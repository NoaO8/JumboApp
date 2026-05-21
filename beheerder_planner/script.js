// --- TAB SWITCHING ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tabview').forEach(v => v.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'kalender') renderCal();
  });
});

// --- PLANNING ---
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

// --- REQUESTS ---
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

// --- CHAT ---
const studentSelect = document.getElementById('studentSelect');
const chatMessages  = document.getElementById('chatMessages');
const messageInput  = document.getElementById('messageInput');
const sendBtn       = document.getElementById('sendMessage');

let currentStudent = null;

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
renderPlanning();
renderRequests();
populateStudentSelect();