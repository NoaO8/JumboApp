// ============================================================
// TAB SWITCHING
// ============================================================
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tabview').forEach(v => v.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
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
        <div class="info">
          <strong>${student.name}</strong>
          <small>${req.date} • ${req.time}</small>
        </div>
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
const studentSelect = document.getElementById('studentSelect');
const chatMessages  = document.getElementById('chatMessages');
const messageInput  = document.getElementById('messageInput');
const sendBtn       = document.getElementById('sendMessage');
let currentStudent  = null;

// Sla berichten per student op (in-memory, later DB)
const chatHistory = {};

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
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });


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
renderPlanning();
renderRequests();
populateStudentSelect();