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
  list.innerHTML = DATA.requests.map((req, i) => {
    const student = getStudent(req.studentId);
    return `
      <div class="shift" id="req-${i}">
        <div class="info">
          <strong>${student.name}</strong>
          <small>${req.date} • ${req.time}</small>
        </div>
        <button class="action reject" onclick="removeRequest(${i})">❌ Afwijzen</button>
        <button class="action accept" onclick="removeRequest(${i})">✅ Accepteren</button>
      </div>`;
  }).join('');
}

function removeRequest(index) {
  const el = document.getElementById(`req-${index}`);
  if (el) el.remove();
}


// ============================================================
// BERICHTEN / CHAT
// ============================================================
const studentSelect = document.getElementById('studentSelect');
const chatMessages  = document.getElementById('chatMessages');
const messageInput  = document.getElementById('messageInput');
const sendBtn       = document.getElementById('sendMessage');
let currentStudent  = null;

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
  chatMessages.innerHTML = `<div class="message student">Hey, dit is ${student.name} 👋</div>`;
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !currentStudent) return;
  chatMessages.innerHTML += `<div class="message manager">${text}</div>`;
  messageInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;
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

// Beschikbaarheid per student per dag (later uit db)
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

  getDaysInMonth(month, year).forEach(dag => {
    const ds = datumStr(dag);
    const shiftenOpDag = plannerShiften.filter(s => s.datum === ds);
    const beschikbaarAantal = DATA.students.filter(s => beschikbaarheidData[s.id]?.[ds]).length;

    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (geselecteerdeDag && datumStr(geselecteerdeDag) === ds) cell.classList.add('active');

    // Stipjes: geel = shift ingepland, groen = beschikbaar
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
  const shiftenOpDag = plannerShiften.filter(s => s.datum === ds);

  detail.innerHTML = `
    <div class="detail-header">
      <h3>${dag.toLocaleDateString('nl-BE', { weekday:'long', day:'numeric', month:'long' })}</h3>
      <button class="primary-btn" style="width:auto;padding:8px 16px;margin-top:0;" onclick="openShiftModal('${ds}')">+ Shift</button>
    </div>

    <h4 class="detail-sectie-titel">📋 Shiften (${shiftenOpDag.length})</h4>
    ${shiftenOpDag.length === 0
      ? `<p class="leeg-tekst">Nog geen shiften.</p>`
      : shiftenOpDag.map(shift => {
          const student = getStudent(shift.studentId);
          return `
            <div class="shift-card">
              <div class="shift-card-top">
                <div class="avatar">${getInitials(student.name)}</div>
                <div class="info">
                  <strong>${student.name}</strong>
                  <span class="role">${shift.rol}</span>
                </div>
                <button class="delete-btn" onclick="verwijderShift(${shift.id})">✕</button>
              </div>
              <div class="shift-tijd">🕐 ${shift.start} – ${shift.einde}</div>
            </div>`;
        }).join('')
    }

    <h4 class="detail-sectie-titel" style="margin-top:18px;">👥 Beschikbaarheid</h4>
    ${DATA.students.map(student => {
      const besch     = beschikbaarheidData[student.id]?.[ds];
      const ingepland = shiftenOpDag.some(s => s.studentId === student.id);
      return `
        <div class="beschikbaar-rij ${ingepland ? 'ingepland' : ''} ${!besch ? 'niet-beschikbaar' : ''}">
          <div class="avatar small">${getInitials(student.name)}</div>
          <div class="info">
            <strong>${student.name}</strong>
            <small>${besch ? '🟢 ' + besch : '🔴 Niet beschikbaar'}</small>
          </div>
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
  plannerShiften.push({ id: volgendShiftId++, studentId, datum: modalDatum, start, einde, rol });
  sluitModal();
  renderPlannerKalender();
  renderDagDetail(modalDatum);
}

function verwijderShift(id) {
  if (!confirm('Shift verwijderen?')) return;
  plannerShiften = plannerShiften.filter(s => s.id !== id);
  const ds = geselecteerdeDag ? datumStr(geselecteerdeDag) : null;
  renderPlannerKalender();
  if (ds) renderDagDetail(ds);
}


// ============================================================
// INIT
// ============================================================
renderPlanning();
renderRequests();
populateStudentSelect();