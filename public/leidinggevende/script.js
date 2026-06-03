// TAB SWITCHING
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tabview').forEach(v => v.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'planner') renderPlannerKalender();
  });
});


// TOAST NOTIFICATIONS
function showToast(msg, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-visible'));
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}


// PLANNING

function renderPlanning() {
  const list = document.getElementById('planningList');
  const date = document.getElementById('planningDate');
  date.textContent = DATA.planningDate;
  list.innerHTML = DATA.planning.map(shift => {
    const student = getStudent(shift.studentId);
    return `
      <div class="shift">
        <div class="avatar">${getInitials(student.name)}</div>
        <div class="info">
          <strong>${student.name}</strong>
          <span class="role">${shift.role}</span>
          <small>${shift.time}</small>
        </div>
        <span class="status ${shift.statusType}">${shift.status}</span>
      </div>`;
  }).join('');
}

const fetch_availability = () => {
  fetch('/availability', {
      headers: {
          'authorization': localStorage.getItem('token'),
          'role':localStorage.getItem('role')
      }
  })
      .then(res => res.json())
      .then(data => renderRequests(data))
    }

// AANVRAGEN
function renderRequests(data) {
  const list = document.getElementById('requestList');
  console.log(data)

  if (DATA.requests.length === 0) {
    list.innerHTML = `<p class="leeg-tekst" style="padding:20px 0;">Geen open aanwezigheidsverzoeken.</p>`;
    updateBadge();
    return;
  }

  
  list.innerHTML = DATA.requests.map(req => {
    const student = getStudent(req.studentId);
    return `
      <div class="shift" id="req-${req.id}">
        <div class="avatar">${getInitials(student.name)}</div>
        <div class="info">
          <strong>${student.name}</strong>
          <small>${req.date} • ${req.time}</small>
        </div>
        <button class="action reject" onclick="handleRequest(${req.id}, false)">✕ Weigeren</button>
        <button class="action accept" onclick="handleRequest(${req.id}, true)">✓ Bevestigen</button>
      </div>`;
  }).join('');

  updateBadge();
}

function handleRequest(id, accepted) {
  const req = DATA.requests.find(r => r.id === id);
  if (!req) return;
  const student = getStudent(req.studentId);

  if (accepted) {
    const parts = req.date.split('-');
    const datum = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
    const [start, einde] = req.time.split('–').map(t => t.trim());

    const alIngepland = plannerShiften.some(s => s.studentId === req.studentId && s.datum === datum);
    if (!alIngepland) {
      plannerShiften.push({
        id: volgendShiftId++,
        studentId: req.studentId,
        datum,
        start,
        einde,
        rol: req.rol || 'Kassa'
      });
    }

    DATA.requests = DATA.requests.filter(r => {
      if (r.id === id) return false;
      const rParts = r.date.split('-');
      const rDatum = `${rParts[2]}-${rParts[1].padStart(2,'0')}-${rParts[0].padStart(2,'0')}`;
      return rDatum !== datum;
    });
  } else {
    DATA.requests = DATA.requests.filter(r => r.id !== id);
  }

  //renderRequests();
  renderPlannerKalender();

  showToast(
    accepted
      ? `✓ Aanwezigheid ${student.name} bevestigd`
      : `✕ Aanvraag ${student.name} geweigerd`,
    accepted ? 'success' : 'error'
  );
}

function updateBadge() {
  const badge = document.querySelector('[data-tab="aanvragen"] .badge');
  if (!badge) return;
  const count = DATA.requests.length;
  badge.textContent = count;
  badge.style.display = count === 0 ? 'none' : '';
}


// BERICHTEN / CHAT

const studentSelect = document.getElementById('studentSelect');
const chatMessages  = document.getElementById('chatMessages');
const messageInput  = document.getElementById('messageInput');
const sendBtn       = document.getElementById('sendMessage');
let currentStudent  = null;
const chatHistory   = {};

const infoUsers = () => {
  fetch('/user_info')
    .then(res => {
      console.log('Status:', res.status);      // is het 200?
      console.log('OK:', res.ok);
      return res.json();
    })
    .then(data => {
      console.log('Data:', data);              // wat komt er echt terug?
      populateStudentSelect(data);
    })
    .catch(err => {
      console.error('Fetch error:', err);      // netwerk of parse fout?
    });
};

function populateStudentSelect(data) {
  console.log(data)
  data.forEach(s => {
    const option = document.createElement('option');
    option.value = s.users_id;
    option.textContent = s.first_name + " " + data.last_name;
    studentSelect.appendChild(option);
  });
}

studentSelect.addEventListener('change', () => {
  const student = getStudent(Number(studentSelect.value));
  if (!student) return;
  currentStudent = student;
  if (!chatHistory[student.id]) {
    chatHistory[student.id] = [
      { from: 'student', text: `Hey, dit is ${student.name} 👋` }
    ];
  }
  fetch_berichten();
});

const fetch_berichten = () => {
  fetch('/berichten', {
      headers: {
          'Authorization': localStorage.getItem('token'),
          'role':localStorage.getItem('role'),
          'studentennaam' : studentennaam
      }
  })
      .then(res => res.json())
      .then(data => renderChat(data))
}


function renderChat(data) {
  console.log(data)
  if (!currentStudent) return;
  const msgs = chatHistory[currentStudent.id] || [];
  chatMessages.innerHTML = msgs.map(m =>
    `<div class="message ${m.from}">${m.text}</div>`
  ).join('');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !currentStudent) return;
  if (!chatHistory[currentStudent.id]) chatHistory[currentStudent.id] = [];
  chatHistory[currentStudent.id].push({ from: 'manager', text });
  messageInput.value = '';
  renderChat();
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });




let plannerShiften = [
  { id: 1, studentId: 1, datum: '2026-05-08', start: '08:00', einde: '16:00', rol: 'Kassa' },
  { id: 2, studentId: 3, datum: '2026-05-08', start: '10:00', einde: '18:00', rol: 'Vers' },
  { id: 3, studentId: 2, datum: '2026-05-09', start: '09:00', einde: '17:00', rol: 'Vakkenvuller' },
  { id: 4, studentId: 4, datum: '2026-05-12', start: '07:00', einde: '15:00', rol: 'AGF' },
  { id: 5, studentId: 5, datum: '2026-05-12', start: '11:00', einde: '19:00', rol: 'Bakkerij' },
];

let plannerMaand = new Date();
plannerMaand.setDate(1);
let geselecteerdeDag    = null;
let geselecteerdeDagStr = null;
let volgendShiftId      = 10;
let modalDatum          = '';
let zoekterm            = '';
let rolFilter           = 'Alle';



function datumStr(d) {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function getDaysInMonth(month, year) {
  const days = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) { days.push(new Date(d)); d.setDate(d.getDate() + 1); }
  return days;
}



function renderPlannerKalender() {
  const year  = plannerMaand.getFullYear();
  const month = plannerMaand.getMonth();

  document.getElementById('planner-maand-titel').textContent =
    MAANDEN[month] + ' ' + year;

  const grid = document.getElementById('planner-kalender-grid');
  grid.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const offset   = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < offset; i++) grid.appendChild(document.createElement('div'));

  const vandaagStr = datumStr(new Date());

  getDaysInMonth(month, year).forEach(dag => {
    const ds            = datumStr(dag);
    const shiftenOpDag  = plannerShiften.filter(s => s.datum === ds);
    const beschikbaarAantal = DATA.students.filter(s => beschikbaarheidData[s.id]?.[ds]).length;

    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (ds === vandaagStr)          cell.classList.add('vandaag');
    if (geselecteerdeDagStr === ds) cell.classList.add('active');

    const stipjes = shiftenOpDag.length > 0 || beschikbaarAantal > 0
      ? `<div class="dag-stipjes">
          ${shiftenOpDag.length  > 0 ? `<span class="stip stip-shift" title="${shiftenOpDag.length} shift(en)"></span>` : ''}
          ${beschikbaarAantal > 0    ? `<span class="stip stip-beschikbaar" title="${beschikbaarAantal} beschikbaar"></span>` : ''}
         </div>`
      : '';

    cell.innerHTML = `<div class="day-number">${dag.getDate()}</div>${stipjes}`;
    cell.addEventListener('click', () => {
      geselecteerdeDag    = dag;
      geselecteerdeDagStr = ds;
      document.querySelectorAll('.day-cell').forEach(c => c.classList.remove('active'));
      cell.classList.add('active');
      zoekterm  = '';
      rolFilter = 'Alle';
      renderDagDetail(ds);
    });

    grid.appendChild(cell);
  });
}



function renderDagDetail(ds) {
  const detail = document.getElementById('planner-detail-inhoud');
  const dag    = new Date(ds + 'T12:00:00');
  const rollen = ['Alle', ...ROLLEN];

  if (detail.dataset.dag !== ds) {
    detail.dataset.dag = ds;
    detail.innerHTML = `
      <div class="detail-header">
        <h3>${dag.toLocaleDateString('nl-BE', { weekday:'long', day:'numeric', month:'long' })}</h3>
        <button class="primary-btn" style="width:auto;padding:8px 16px;margin-top:0;" onclick="openShiftModal('${ds}')">+ Shift</button>
      </div>
      <div class="filter-bar">
        <input type="text" id="planner-zoek" class="filter-input" placeholder="Zoek student…" value="">
        <div class="rol-filters" id="rol-filter-btns">
          ${rollen.map(r => `
            <button class="rol-btn ${rolFilter === r ? 'active' : ''}"
              onclick="rolFilter='${r}'; renderShiftenEnBeschikbaar('${ds}')">${r}</button>
          `).join('')}
        </div>
      </div>
      <div id="dag-detail-lijsten"></div>
    `;

    document.getElementById('planner-zoek').addEventListener('input', e => {
      zoekterm = e.target.value;
      renderShiftenEnBeschikbaar(ds);
    });
  }

  renderShiftenEnBeschikbaar(ds);
}

function renderShiftenEnBeschikbaar(ds) {
  const lijsten = document.getElementById('dag-detail-lijsten');
  if (!lijsten) return;

  const maandag      = getMaandagVanWeek(new Date(ds + 'T12:00:00'));
  const shiftenOpDag = plannerShiften.filter(s => s.datum === ds);

  const gefilterd = rolFilter !== 'Alle'
    ? shiftenOpDag.filter(s => s.rol === rolFilter)
    : shiftenOpDag;

  const gezochtIds = zoekterm
    ? DATA.students.filter(s => s.name.toLowerCase().includes(zoekterm.toLowerCase())).map(s => s.id)
    : null;

  document.querySelectorAll('#rol-filter-btns .rol-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === rolFilter);
  });

  lijsten.innerHTML = `
    <h4 class="detail-sectie-titel">Shiften (${gefilterd.length}${gefilterd.length !== shiftenOpDag.length ? '/' + shiftenOpDag.length : ''})</h4>
    ${gefilterd.length === 0
      ? `<p class="leeg-tekst">Geen shiften${rolFilter !== 'Alle' ? ' voor ' + rolFilter : ''}.</p>`
      : gefilterd.map(shift => {
          const student  = getStudent(shift.studentId);
          const weekUren = getWeekUren(shift.studentId, maandag);
          return `
            <div class="shift-card">
              <div class="shift-card-top">
                <div class="avatar">${getInitials(student.name)}</div>
                <div class="info">
                  <strong>${student.name}</strong>
                  <span class="role">${shift.rol}</span>
                </div>
                <span class="week-uren-badge">${weekUren}u/wk</span>
                <button class="delete-btn" onclick="verwijderShift(${shift.id})">✕</button>
              </div>
              <div class="shift-tijd">${shift.start} – ${shift.einde}</div>
            </div>`;
        }).join('')
    }

    <h4 class="detail-sectie-titel" style="margin-top:16px;">Beschikbaarheid</h4>
    ${DATA.students
      .filter(s => gezochtIds ? gezochtIds.includes(s.id) : true)
      .map(student => {
        const beschStr  = getBeschikbaarheidStr(student.id, ds);
        const ingepland = shiftenOpDag.some(s => s.studentId === student.id);
        const weekUren  = getWeekUren(student.id, maandag);
        return `
          <div class="beschikbaar-rij ${ingepland ? 'ingepland' : ''} ${!beschStr ? 'niet-beschikbaar' : ''}">
            <div class="avatar small">${getInitials(student.name)}</div>
            <div class="info">
              <strong>${student.name}</strong>
              <small>${beschStr ? '● ' + beschStr : '○ Niet beschikbaar'}</small>
            </div>
            <span class="week-uren-badge">${weekUren}u</span>
            ${beschStr && !ingepland
              ? `<button class="action accept" onclick="openShiftModal('${ds}', ${student.id})">Inplannen</button>`
              : ingepland ? `<span class="ingepland-badge">✓</span>` : ''
            }
          </div>`;
      }).join('')}
  `;
}

function plannerMaandVorige() {
  plannerMaand.setMonth(plannerMaand.getMonth() - 1);
  renderPlannerKalender();
}
function plannerMaandVolgende() {
  plannerMaand.setMonth(plannerMaand.getMonth() + 1);
  renderPlannerKalender();
}


function vulModalTijden() {
  ['modal-start', 'modal-einde'].forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = SHIFT_TIJDEN.map(t => `<option value="${t}">${t}</option>`).join('');
  });
  const sel = document.getElementById('modal-student');
  sel.innerHTML = `<option value="all">📢 Iedereen beschikbaar</option>` +
    DATA.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

function openShiftModal(ds, studentId = null) {
  modalDatum = ds;
  vulModalTijden();

  const dag = new Date(ds + 'T12:00:00');
  document.getElementById('modal-datum-label').textContent =
    dag.toLocaleDateString('nl-BE', { weekday:'long', day:'numeric', month:'long' });

  const studentSel  = document.getElementById('modal-student');
  const tijdWrapper = document.getElementById('modal-tijd-wrapper');

  function updateTijdVisibility() {
    tijdWrapper.style.display = studentSel.value === 'all' ? 'none' : 'flex';
  }

  studentSel.onchange = () => {
    updateTijdVisibility();
    const sid = Number(studentSel.value);
    if (!isNaN(sid) && sid > 0) {
      const b = getBeschikbaarheidTijden(sid, ds);
      if (b) {
        document.getElementById('modal-start').value = b.start;
        document.getElementById('modal-einde').value = b.einde;
      }
    }
  };

  if (studentId) {
    studentSel.value = studentId;
    const b = getBeschikbaarheidTijden(studentId, ds);
    if (b) {
      document.getElementById('modal-start').value = b.start;
      document.getElementById('modal-einde').value = b.einde;
    }
  } else {
    studentSel.value = 'all';
  }

  updateTijdVisibility();
  document.getElementById('shift-modal').style.display = 'flex';
}

function sluitModal() {
  document.getElementById('shift-modal').style.display = 'none';
}

function sluitModalBuiten(e) {
  if (e.target.classList.contains('modal-overlay')) sluitModal();
}

function slaShiftOp() {
  const studentVal = document.getElementById('modal-student').value;
  const rol        = document.getElementById('modal-rol').value;
  const start      = document.getElementById('modal-start').value;
  const einde      = document.getElementById('modal-einde').value;

  if (studentVal === 'all') {
    const beschikbaar = DATA.students.filter(s =>
      beschikbaarheidData[s.id]?.[modalDatum] &&
      !plannerShiften.some(p => p.studentId === s.id && p.datum === modalDatum)
    );

    if (beschikbaar.length === 0) {
      showToast('Niemand beschikbaar of iedereen al ingepland', 'error');
      return;
    }

    const parts = modalDatum.split('-');
    const datumDisplay = `${parts[2]}-${parts[1]}-${parts[0]}`;

    DATA.requests = DATA.requests.filter(r => {
      const rParts = r.date.split('-');
      const rDatum = `${rParts[2]}-${rParts[1].padStart(2,'0')}-${rParts[0].padStart(2,'0')}`;
      return rDatum !== modalDatum;
    });

    beschikbaar.forEach(s => {
      const b = getBeschikbaarheidTijden(s.id, modalDatum);
      DATA.requests.push({
        id: volgendReqId++,
        studentId: s.id,
        date: datumDisplay,
        time: b ? `${b.start}–${b.einde}` : '08:00–16:00',
        rol
      });
    });

    updateBadge();
    sluitModal();
    showToast(`Aanvraag verstuurd naar ${beschikbaar.length} student${beschikbaar.length > 1 ? 'en' : ''}`);
    return;
  }

  const studentId = Number(studentVal);

  if (einde <= start) {
    showToast('Eindtijd moet na begintijd zijn', 'error');
    return;
  }

  if (plannerShiften.some(s => s.studentId === studentId && s.datum === modalDatum)) {
    showToast('Student al ingepland op deze dag', 'error');
    return;
  }

  const student = getStudent(studentId);
  plannerShiften.push({ id: volgendShiftId++, studentId, datum: modalDatum, start, einde, rol });
  sluitModal();
  renderPlannerKalender();
  if (geselecteerdeDagStr) renderDagDetail(geselecteerdeDagStr);
  showToast(`Shift voor ${student.name} opgeslagen`);
}

function verwijderShift(id) {
  const shift = plannerShiften.find(s => s.id === id);
  if (!shift) return;
  const student = getStudent(shift.studentId);
  if (!confirm(`Shift van ${student.name} verwijderen?`)) return;
  plannerShiften = plannerShiften.filter(s => s.id !== id);
  renderPlannerKalender();
  if (geselecteerdeDagStr) renderDagDetail(geselecteerdeDagStr);
  showToast(`Shift van ${student.name} verwijderd`, 'error');
}



renderPlanning();
fetch_availability();
populateStudentSelect();
