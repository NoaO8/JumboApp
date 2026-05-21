<<<<<<< HEAD
// ============================================================
// TAB SWITCHING
// ============================================================
=======
// --- TAB SWITCHING ---
>>>>>>> klaar_voor_presentatie
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tabview').forEach(v => v.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
<<<<<<< HEAD
    if (tab.dataset.tab === 'planner') renderPlannerKalender();
  });
});


// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
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


// ============================================================
// PLANNING
// ============================================================
=======
    if (tab.dataset.tab === 'kalender') renderCal();
  });
});

// --- PLANNING ---
>>>>>>> klaar_voor_presentatie
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

<<<<<<< HEAD

// ============================================================
// AANVRAGEN
// ============================================================
function renderRequests() {
  const list = document.getElementById('requestList');

  if (DATA.requests.length === 0) {
    list.innerHTML = `<p class="leeg-tekst" style="padding:20px 0;">Geen openstaande aanvragen.</p>`;
    updateBadge();
    return;
  }

  list.innerHTML = DATA.requests.map(req => {
    const student = getStudent(req.studentId);
    return `
      <div class="shift" id="req-${req.id}">
        <div class="avatar">${getInitials(student.name)}</div>
=======
// --- REQUESTS ---
function renderRequests() {
  const list = document.getElementById('requestList');
  list.innerHTML = DATA.requests.map((req, i) => {
    const student = getStudent(req.studentId);
    return `
      <div class="shift" id="req-${i}">
>>>>>>> klaar_voor_presentatie
        <div class="info">
          <strong>${student.name}</strong>
          <small>${req.date} • ${req.time}</small>
        </div>
<<<<<<< HEAD
        <button class="action reject" onclick="handleRequest(${req.id}, false)">❌ Afwijzen</button>
        <button class="action accept" onclick="handleRequest(${req.id}, true)">✅ Accepteren</button>
      </div>`;
  }).join('');

  updateBadge();
}

function handleRequest(id, accepted) {
  const req = DATA.requests.find(r => r.id === id);
  if (!req) return;
  const student = getStudent(req.studentId);
  DATA.requests = DATA.requests.filter(r => r.id !== id);
  renderRequests();
  showToast(
    accepted
      ? `✅ Shift van ${student.name} geaccepteerd`
      : `❌ Aanvraag van ${student.name} afgewezen`,
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


// ============================================================
// BERICHTEN / CHAT
// ============================================================
=======
        <button class="action reject" onclick="removeRequest(${i})">❌ Afwijzen</button>
        <button class="action accept" onclick="removeRequest(${i})">✅ Accepteren</button>
      </div>`;
  }).join('');
}

function removeRequest(index) {
  const el = document.getElementById(`req-${index}`);
  if (el) el.remove();
}

// --- CHAT ---
>>>>>>> klaar_voor_presentatie
const studentSelect = document.getElementById('studentSelect');
const chatMessages  = document.getElementById('chatMessages');
const messageInput  = document.getElementById('messageInput');
const sendBtn       = document.getElementById('sendMessage');
<<<<<<< HEAD
let currentStudent  = null;

// Sla berichten per student op (in-memory, later DB)
const chatHistory = {};
=======

let currentStudent = null;
>>>>>>> klaar_voor_presentatie

function populateStudentSelect() {
  DATA.students.forEach(s => {
    const option = document.createElement('option');
    option.value = s.id;
    option.textContent = s.name;
    studentSelect.appendChild(option);
  });
}

studentSelect.addEventListener('change', () => {
  const student = getStudent(Number(studentSelect.value));
  if (!student) return;
  currentStudent = student;
<<<<<<< HEAD

  if (!chatHistory[student.id]) {
    chatHistory[student.id] = [
      { from: 'student', text: `Hey, dit is ${student.name} 👋` }
    ];
  }

  renderChat();
});

function renderChat() {
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
=======
  chatMessages.innerHTML = `<div class="message student">Hey, dit is ${student.name} 👋</div>`;
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !currentStudent) return;
  chatMessages.innerHTML += `<div class="message manager">${text}</div>`;
  messageInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;
>>>>>>> klaar_voor_presentatie
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

<<<<<<< HEAD

// ============================================================
// PLANNER – KALENDER + DAG-DETAIL
// ============================================================

let plannerShiften = [
  { id: 1, studentId: 1, datum: '2026-05-08', start: '08:00', einde: '16:00', rol: 'Kassa' },
  { id: 2, studentId: 3, datum: '2026-05-08', start: '10:00', einde: '18:00', rol: 'Vers' },
  { id: 3, studentId: 2, datum: '2026-05-09', start: '09:00', einde: '17:00', rol: 'Vakkenvuller' },
  { id: 4, studentId: 4, datum: '2026-05-12', start: '07:00', einde: '15:00', rol: 'AGF' },
  { id: 5, studentId: 5, datum: '2026-05-12', start: '11:00', einde: '19:00', rol: 'Bakkerij' },
];

const beschikbaarheidData = {
  1: { '2026-05-08': '08:00–16:00', '2026-05-09': '10:00–18:00', '2026-05-12': '08:00–16:00' },
  2: { '2026-05-08': '12:00–20:00', '2026-05-09': '08:00–16:00', '2026-05-13': '09:00–17:00' },
  3: { '2026-05-08': '08:00–20:00', '2026-05-10': '09:00–17:00', '2026-05-12': '10:00–18:00' },
  4: { '2026-05-09': '07:00–15:00', '2026-05-12': '07:00–15:00', '2026-05-14': '08:00–16:00' },
  5: { '2026-05-08': '11:00–19:00', '2026-05-09': '11:00–19:00', '2026-05-12': '11:00–19:00' },
};

const maanden = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
let plannerMaand = new Date();
plannerMaand.setDate(1);
let geselecteerdeDag = null;
let volgendShiftId = 10;
let modalDatum = '';

// Filter/zoek state
let zoekterm = '';
let rolFilter = 'Alle';

function datumStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
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

  document.getElementById('planner-maand-titel').textContent = maanden[month] + ' ' + year;

  const grid = document.getElementById('planner-kalender-grid');
  grid.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const offset   = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < offset; i++) grid.appendChild(document.createElement('div'));

  const vandaagStr = datumStr(new Date());

  getDaysInMonth(month, year).forEach(dag => {
    const ds = datumStr(dag);
    const shiftenOpDag = plannerShiften.filter(s => s.datum === ds);
    const beschikbaarAantal = DATA.students.filter(s => beschikbaarheidData[s.id]?.[ds]).length;

    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (ds === vandaagStr) cell.classList.add('vandaag');
    if (geselecteerdeDag && datumStr(geselecteerdeDag) === ds) cell.classList.add('active');

    const stipjes = shiftenOpDag.length > 0 || beschikbaarAantal > 0
      ? `<div class="dag-stipjes">
          ${shiftenOpDag.length > 0 ? `<span class="stip stip-shift" title="${shiftenOpDag.length} shift(en)"></span>` : ''}
          ${beschikbaarAantal > 0   ? `<span class="stip stip-beschikbaar" title="${beschikbaarAantal} beschikbaar"></span>` : ''}
         </div>`
      : '';

    cell.innerHTML = `<div class="day-number">${dag.getDate()}</div>${stipjes}`;
    cell.addEventListener('click', () => {
      geselecteerdeDag = dag;
      document.querySelectorAll('.day-cell').forEach(c => c.classList.remove('active'));
      cell.classList.add('active');
      renderDagDetail(ds);
    });

    grid.appendChild(cell);
  });
}

function renderDagDetail(ds) {
  const detail = document.getElementById('planner-detail-inhoud');
  const dag    = new Date(ds + 'T12:00:00');
  let shiftenOpDag = plannerShiften.filter(s => s.datum === ds);

  // Filter op rol
  const gefilterd = rolFilter !== 'Alle'
    ? shiftenOpDag.filter(s => s.rol === rolFilter)
    : shiftenOpDag;

  // Zoek op naam
  const gezochtStudenten = zoekterm
    ? DATA.students.filter(s => s.name.toLowerCase().includes(zoekterm.toLowerCase())).map(s => s.id)
    : null;

  const rollen = ['Alle', 'Kassa', 'Vakkenvuller', 'Vers', 'AGF', 'Bakkerij', 'Schoonmaak'];
  const maandag = getMaandagVanWeek(new Date(ds + 'T12:00:00'));

  detail.innerHTML = `
    <div class="detail-header">
      <h3>${dag.toLocaleDateString('nl-BE', { weekday:'long', day:'numeric', month:'long' })}</h3>
      <button class="primary-btn" style="width:auto;padding:8px 16px;margin-top:0;" onclick="openShiftModal('${ds}')">+ Shift</button>
    </div>

    <!-- Zoek + filter -->
    <div class="filter-bar">
      <input type="text" class="filter-input" placeholder="🔍 Zoek student…" value="${zoekterm}"
        oninput="zoekterm = this.value; renderDagDetail('${ds}')">
      <div class="rol-filters">
        ${rollen.map(r => `
          <button class="rol-btn ${rolFilter === r ? 'active' : ''}"
            onclick="rolFilter='${r}'; renderDagDetail('${ds}')">${r}</button>
        `).join('')}
      </div>
    </div>

    <h4 class="detail-sectie-titel">📋 Shiften (${gefilterd.length}${gefilterd.length !== shiftenOpDag.length ? ' van ' + shiftenOpDag.length : ''})</h4>
    ${gefilterd.length === 0
      ? `<p class="leeg-tekst">Geen shiften${rolFilter !== 'Alle' ? ' voor ' + rolFilter : ''}.</p>`
      : gefilterd.map(shift => {
          const student = getStudent(shift.studentId);
          const weekUren = getWeekUren(shift.studentId, maandag);
          const uren = ((parseInt(shift.einde) - parseInt(shift.start)));
          return `
            <div class="shift-card">
              <div class="shift-card-top">
                <div class="avatar">${getInitials(student.name)}</div>
                <div class="info">
                  <strong>${student.name}</strong>
                  <span class="role">${shift.rol}</span>
                </div>
                <span class="week-uren-badge" title="Uren deze week">${weekUren}u/week</span>
                <button class="delete-btn" onclick="verwijderShift(${shift.id})">✕</button>
              </div>
              <div class="shift-tijd">🕐 ${shift.start} – ${shift.einde}</div>
            </div>`;
        }).join('')
    }

    <h4 class="detail-sectie-titel" style="margin-top:18px;">👥 Beschikbaarheid</h4>
    ${DATA.students
      .filter(s => gezochtStudenten ? gezochtStudenten.includes(s.id) : true)
      .map(student => {
        const besch     = beschikbaarheidData[student.id]?.[ds];
        const ingepland = shiftenOpDag.some(s => s.studentId === student.id);
        const weekUren  = getWeekUren(student.id, maandag);
        return `
          <div class="beschikbaar-rij ${ingepland ? 'ingepland' : ''} ${!besch ? 'niet-beschikbaar' : ''}">
            <div class="avatar small">${getInitials(student.name)}</div>
            <div class="info">
              <strong>${student.name}</strong>
              <small>${besch ? '🟢 ' + besch : '🔴 Niet beschikbaar'}</small>
            </div>
            <span class="week-uren-badge" title="Uren deze week">${weekUren}u</span>
            ${besch && !ingepland
              ? `<button class="action accept" onclick="openShiftModal('${ds}', ${student.id})">+ Plan in</button>`
              : ingepland ? `<span class="ingepland-badge">✓ Ingepland</span>` : ''
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


// ============================================================
// SHIFT MODAL
// ============================================================
function vulModalTijden() {
  const tijden = Array.from({length: 16}, (_, i) => String(i + 6).padStart(2, '0') + ':00');
  ['modal-start', 'modal-einde'].forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = tijden.map(t => `<option value="${t}">${t}</option>`).join('');
  });
  const sel = document.getElementById('modal-student');
  sel.innerHTML = DATA.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

function openShiftModal(ds, studentId = null) {
  modalDatum = ds;
  vulModalTijden();
  const dag = new Date(ds + 'T12:00:00');
  document.getElementById('modal-datum-label').textContent =
    dag.toLocaleDateString('nl-BE', { weekday:'long', day:'numeric', month:'long' });

  if (studentId) {
    document.getElementById('modal-student').value = studentId;
    const besch = beschikbaarheidData[studentId]?.[ds];
    if (besch) {
      const [start, einde] = besch.split('–').map(t => t.trim());
      document.getElementById('modal-start').value = start;
      document.getElementById('modal-einde').value = einde;
    }
  }
  document.getElementById('shift-modal').style.display = 'flex';
}

function sluitModal() {
  document.getElementById('shift-modal').style.display = 'none';
}

function sluitModalBuiten(e) {
  if (e.target.classList.contains('modal-overlay')) sluitModal();
}

function slaShiftOp() {
  const studentId = Number(document.getElementById('modal-student').value);
  const rol       = document.getElementById('modal-rol').value;
  const start     = document.getElementById('modal-start').value;
  const einde     = document.getElementById('modal-einde').value;

  // Validatie: einde moet na start
  if (einde <= start) {
    showToast('⚠️ Eindtijd moet na begintijd zijn', 'error');
    return;
  }

  // Check: student al ingepland op deze dag?
  const alIngepland = plannerShiften.some(s => s.studentId === studentId && s.datum === modalDatum);
  if (alIngepland) {
    showToast('⚠️ Student al ingepland op deze dag', 'error');
    return;
  }

  const student = getStudent(studentId);
  plannerShiften.push({ id: volgendShiftId++, studentId, datum: modalDatum, start, einde, rol });
  sluitModal();
  renderPlannerKalender();
  renderDagDetail(modalDatum);
  showToast(`✅ Shift voor ${student.name} opgeslagen`);
}

function verwijderShift(id) {
  const shift = plannerShiften.find(s => s.id === id);
  if (!shift) return;
  const student = getStudent(shift.studentId);
  if (!confirm(`Shift van ${student.name} verwijderen?`)) return;
  plannerShiften = plannerShiften.filter(s => s.id !== id);
  const ds = geselecteerdeDag ? datumStr(geselecteerdeDag) : null;
  renderPlannerKalender();
  if (ds) renderDagDetail(ds);
  showToast(`🗑️ Shift van ${student.name} verwijderd`, 'error');
}


// ============================================================
// INIT
// ============================================================
=======
// --- KALENDER ---
const MENSEN = {
  studenten: [
    { id: 's1', naam: 'Lars Livyns' },
    { id: 's2', naam: 'Emiely Spiegelman' },
    { id: 's3', naam: 'Sofie Martens' },
    { id: 's4', naam: 'Remi Claes' },
  ],
  medewerkers: [
    { id: 'm1', naam: 'Jan Friedrick' },
    { id: 'm2', naam: 'Nathalie Pieters' },
    { id: 'm3', naam: 'Kevin De Smedt' },
  ]
}

let planning = {}
let selectedDay = null
let viewDate = new Date()
let activeTab = 'dag'

function dayKey(d) { return d.toISOString().slice(0, 10) }
function persoonInfo(id) { return [...MENSEN.studenten, ...MENSEN.medewerkers].find(p => p.id === id) }
function isStudent(id) { return id.startsWith('s') }
function initials(naam) { return naam.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }

function renderCal() {
  const y = viewDate.getFullYear(), m = viewDate.getMonth()
  const maanden = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']
  document.getElementById('calTitle').textContent = maanden[m] + ' ' + y

  const grid = document.getElementById('calGrid')
  grid.innerHTML = ''

  const first = new Date(y, m, 1)
  const offset = first.getDay() === 0 ? 6 : first.getDay() - 1
  for (let i = 0; i < offset; i++) {
    const e = document.createElement('div'); e.className = 'day-cell empty'; grid.appendChild(e)
  }

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const last = new Date(y, m + 1, 0).getDate()

  for (let d = 1; d <= last; d++) {
    const date = new Date(y, m, d); date.setHours(0, 0, 0, 0)
    const k = dayKey(date)
    const shifts = planning[k] || []

    const cell = document.createElement('div')
    cell.className = 'day-cell'
    if (date < today) cell.classList.add('past')
    if (date.getTime() === today.getTime()) cell.classList.add('today')
    if (selectedDay && dayKey(selectedDay) === k) cell.classList.add('selected')

    const num = document.createElement('div'); num.className = 'day-num'; num.textContent = d
    cell.appendChild(num)

    if (shifts.length > 0) {
      const chips = document.createElement('div'); chips.className = 'shift-chips'
      shifts.slice(0, 2).forEach(s => {
        const p = persoonInfo(s.id); if (!p) return
        const chip = document.createElement('div')
        chip.className = 'chip ' + (isStudent(s.id) ? 'student' : 'medewerker')
        chip.textContent = p.naam.split(' ')[0] + ' ' + s.start + '-' + s.eind
        chips.appendChild(chip)
      })
      if (shifts.length > 2) {
        const more = document.createElement('div'); more.className = 'chip more'
        more.textContent = '+' + (shifts.length - 2) + ' meer'; chips.appendChild(more)
      }
      cell.appendChild(chips)
    }

    if (!cell.classList.contains('past')) {
      cell.addEventListener('click', () => { selectedDay = date; renderCal(); renderPanel() })
    }
    grid.appendChild(cell)
  }
}

function renderPanel() {
  const panel = document.getElementById('sidePanel')
  if (!selectedDay) { panel.innerHTML = '<div class="no-day">Klik op een dag om te plannen</div>'; return }

  const k = dayKey(selectedDay)
  const shifts = planning[k] || []
  const dagNamen = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag']
  const maandNamen = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december']
  const dagStr = dagNamen[selectedDay.getDay()] + ' ' + selectedDay.getDate() + ' ' + maandNamen[selectedDay.getMonth()]

  panel.innerHTML = `
    <div>
      <div class="panel-title">${dagStr.charAt(0).toUpperCase() + dagStr.slice(1)}</div>
      <div class="panel-date">${shifts.length} shift(s) ingepland</div>
    </div>
    <div class="tab-row">
      <button class="ptab ${activeTab === 'dag' ? 'active' : ''}" onclick="setTab('dag')">Dag</button>
      <button class="ptab ${activeTab === 'overzicht' ? 'active' : ''}" onclick="setTab('overzicht')">Week</button>
    </div>
    <div id="tabContent"></div>
  `
  renderTabContent()
}

function setTab(t) { activeTab = t; renderPanel() }

function renderTabContent() {
  const el = document.getElementById('tabContent')
  if (!el) return
  activeTab === 'dag' ? renderDagTab(el) : renderWeekTab(el)
}

function renderDagTab(el) {
  const k = dayKey(selectedDay)
  const shifts = planning[k] || []
  const studs = shifts.filter(s => isStudent(s.id))
  const meds = shifts.filter(s => !isStudent(s.id))

  let html = ''
  if (studs.length > 0) {
    html += `<div class="section-label">Studenten (${studs.length})</div>`
    studs.forEach(s => {
      const p = persoonInfo(s.id)
      html += `<div class="person-row">
        <div class="avatar s">${initials(p.naam)}</div>
        <div class="person-info"><strong>${p.naam}</strong><span>${s.start}:00 – ${s.eind}:00 · ${s.eind - s.start}u</span></div>
        <button class="remove-btn" onclick="removeShift('${k}','${s.id}')">×</button>
      </div>`
    })
  }
  if (meds.length > 0) {
    html += `<div class="section-label" style="margin-top:8px">Medewerkers (${meds.length})</div>`
    meds.forEach(s => {
      const p = persoonInfo(s.id)
      html += `<div class="person-row">
        <div class="avatar m">${initials(p.naam)}</div>
        <div class="person-info"><strong>${p.naam}</strong><span>${s.start}:00 – ${s.eind}:00 · ${s.eind - s.start}u</span></div>
        <button class="remove-btn" onclick="removeShift('${k}','${s.id}')">×</button>
      </div>`
    })
  }
  if (shifts.length === 0) html += `<div class="no-day">Nog niemand ingepland</div>`

  const today = new Date(); today.setHours(0, 0, 0, 0)
  if (selectedDay >= today) {
    html += `
    <div class="add-section">
      <div class="section-label">Iemand inplannen</div>
      <select id="persoonSelect">
        <option value="">Kies persoon...</option>
        <optgroup label="Studenten">${MENSEN.studenten.map(s => `<option value="${s.id}">${s.naam}</option>`).join('')}</optgroup>
        <optgroup label="Medewerkers">${MENSEN.medewerkers.map(m => `<option value="${m.id}">${m.naam}</option>`).join('')}</optgroup>
      </select>
      <div class="time-row">
        <select id="startUur"><option value="">Start</option>${Array.from({length:16},(_,i)=>i+6).map(h=>`<option value="${h}">${h}:00</option>`).join('')}</select>
        <select id="eindUur"><option value="">Einde</option>${Array.from({length:16},(_,i)=>i+6).map(h=>`<option value="${h}">${h}:00</option>`).join('')}</select>
      </div>
      <button class="add-btn" onclick="addShift()">+ Inplannen</button>
    </div>`
  }
  el.innerHTML = html
}

function renderWeekTab(el) {
  const mon = new Date(selectedDay)
  const day = mon.getDay() === 0 ? 6 : mon.getDay() - 1
  mon.setDate(mon.getDate() - day)

  const dagKort = ['Ma','Di','Wo','Do','Vr','Za','Zo']
  const maandK = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec']
  let stuTotaal = 0, medTotaal = 0, uren = 0, rows = ''

  for (let i = 0; i < 7; i++) {
    const d = new Date(mon); d.setDate(d.getDate() + i)
    const k = dayKey(d)
    const shifts = planning[k] || []
    stuTotaal += shifts.filter(s => isStudent(s.id)).length
    medTotaal += shifts.filter(s => !isStudent(s.id)).length
    uren += shifts.reduce((a, s) => a + (s.eind - s.start), 0)

    const chips = shifts.map(s => {
      const p = persoonInfo(s.id)
      return `<span class="chip ${isStudent(s.id) ? 'student' : 'medewerker'}">${p.naam.split(' ')[0]}</span>`
    }).join('')

    rows += `<div class="week-row">
      <div class="wr-date">${dagKort[i]} ${d.getDate()} ${maandK[d.getMonth()]}</div>
      <div class="wr-chips">${chips || '<span style="font-size:11px;color:#aaa">vrij</span>'}</div>
    </div>`
  }

  el.innerHTML = `
    <div class="overview-grid">
      <div class="stat-card"><div class="slabel">Studenten</div><div class="sval">${stuTotaal}</div></div>
      <div class="stat-card"><div class="slabel">Medewerkers</div><div class="sval">${medTotaal}</div></div>
      <div class="stat-card"><div class="slabel">Totaal uren</div><div class="sval">${uren}</div></div>
      <div class="stat-card"><div class="slabel">Shifts</div><div class="sval">${stuTotaal + medTotaal}</div></div>
    </div>
    <div style="margin-top:12px">
      <div class="section-label">Deze week</div>
      <div class="week-overview">${rows}</div>
    </div>
  `
}

function addShift() {
  const id = document.getElementById('persoonSelect').value
  const start = parseInt(document.getElementById('startUur').value)
  const eind = parseInt(document.getElementById('eindUur').value)
  if (!id || isNaN(start) || isNaN(eind) || eind <= start) return
  const k = dayKey(selectedDay)
  if (!planning[k]) planning[k] = []
  if (planning[k].find(s => s.id === id)) { alert('Deze persoon staat al ingepland op deze dag.'); return }
  planning[k].push({ id, start, eind })
  renderCal(); renderPanel()
}

function removeShift(k, id) {
  if (!planning[k]) return
  planning[k] = planning[k].filter(s => s.id !== id)
  renderCal(); renderPanel()
}

document.getElementById('btnPrev').addEventListener('click', () => {
  viewDate.setMonth(viewDate.getMonth() - 1); renderCal()
})
document.getElementById('btnNext').addEventListener('click', () => {
  viewDate.setMonth(viewDate.getMonth() + 1); renderCal()
})

// --- INIT ---
>>>>>>> klaar_voor_presentatie
renderPlanning();
renderRequests();
populateStudentSelect();