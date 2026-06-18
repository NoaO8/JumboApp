// CONFIG
const ROLLEN = ['Kassa', 'Vakkenvuller', 'Vers', 'AGF', 'Bakkerij', 'Schoonmaak'];
const MAANDEN = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
const SHIFT_TIJDEN = Array.from({ length: 16 }, (_, i) => String(i + 6).padStart(2, '0') + ':00');

// GLOBALE DATA STORAGE
let globaleLedenLijst = []; 
let plannerShiften = [];
let plannerMaand = new Date(); plannerMaand.setDate(1);
let geselecteerdeDagStr = null;
let modalDatum = '';
let zoekterm = '';
let rolFilter = 'Alle';

// HELPERS
function getInitials(voornaam, achternaam) {
  return (voornaam?.[0] ?? '') + (achternaam?.[0] ?? '');
}

function datumStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getDaysInMonth(month, year) {
  const days = [], d = new Date(year, month, 1);
  while (d.getMonth() === month) { days.push(new Date(d)); d.setDate(d.getDate() + 1); }
  return days;
}

function getStudentNaam(userId) {
  const student = globaleLedenLijst.find(u => u.users_id == userId || u.id == userId);
  if (student) {
    return `${student.first_name} ${student.last_name}`;
  }
  return `User #${userId}`;
}

function showToast(msg, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-visible'));
  setTimeout(() => { toast.classList.remove('toast-visible'); setTimeout(() => toast.remove(), 300); }, 2800);
}

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

// SHIFT AANVRAGEN  —  GET /availability
function fetch_availability() {
  fetch('/availability', {
    headers: {
      'Authorization': localStorage.getItem('token'),
      'role': localStorage.getItem('role')
    }
  })
    .then(res => res.json())
    .then(data => {
      renderRequests(data);
    })
    .catch(() => showToast('Kon aanvragen niet laden', 'error'));
}

function renderRequests(data) {
  const list = document.getElementById('requestList');

  if (!list) return;
  if (!data || data.length === 0) {
    list.innerHTML = `<p class="leeg-tekst" style="padding:20px 0;">Geen open aanvragen.</p>`;
    updateBadge(0);
    return;
  }

  const tijdOpties = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
  const formatter = new Intl.DateTimeFormat('nl-NL', tijdOpties);

  list.innerHTML = data.map(req => {
    // Safari/iOS fix: vervang spaties door 'T' voor een geldige datum parsing
    const startDatumObj = new Date(req.start_dateTime.replace(' ', 'T'));
    const eindDatumObj = new Date(req.end_dateTime.replace(' ', 'T'));

    const startSchoon = formatter.format(startDatumObj).replace(',', '');
    const eindSchoon = formatter.format(eindDatumObj).replace(',', '');

    const sqlStart = startDatumObj.toISOString().slice(0, 19).replace('T', ' ');
    const sqlEind = eindDatumObj.toISOString().slice(0, 19).replace('T', ' ');
    
    const weergaveRol = req.rol || req.role || 'Geen rol gespecificeerd';
    const volledigeNaam = getStudentNaam(req.user_id);

    return `
    <div class="shift" id="req-${req.availability_id}">
      <div class="avatar">${getInitials(volledigeNaam.split(' ')[0], volledigeNaam.split(' ')[1]) || req.user_id}</div>
      <div class="info">
        <strong>${volledigeNaam}</strong>
        <small 
          data-start="${sqlStart}" 
          data-einde="${sqlEind}" 
          data-userid="${req.user_id}" 
          data-rol="${weergaveRol}"
        >${startSchoon} – ${eindSchoon.slice(11)}</small>
        <span class="role">${weergaveRol}</span>
      </div>
      <button class="action reject" onclick="handleRequest(${req.availability_id}, false)">✕ Weigeren</button>
      <button class="action accept" onclick="handleRequest(${req.availability_id}, true)">✓ Bevestigen</button>
    </div>`;
  }).join('');

  updateBadge(data.length);
}

function handleRequest(availabilityId, accepted) {
  const card = document.getElementById(`req-${availabilityId}`);
  const token = localStorage.getItem('token');

  if (!card) return;

  if (!accepted) {
    fetch(`/availability/${availabilityId}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    })
    .then(async res => {
      if (!res.ok) throw new Error('Kon aanvraag niet weigeren');
      card.remove();
      updateBadge(document.querySelectorAll('#requestList .shift').length);
      showToast('Aanvraag geweigerd', 'error');
    })
    .catch(err => showToast(err.message, 'error'));
    return;
  }

  const smallTag = card.querySelector('small');
  const startRaw = smallTag.dataset.start;
  const eindeRaw = smallTag.dataset.einde;
  const vanUserId = smallTag.dataset.userid;
  const vanRol    = smallTag.dataset.rol;

  const definitieveRol = (vanRol === 'Geen rol gespecificeerd' || !vanRol) ? 'Kassa' : vanRol;

  fetch('/shifts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({
      user_id: vanUserId, 
      start: startRaw, 
      einde: eindeRaw,
      start_dateTime: startRaw,
      end_dateTime: eindeRaw,
      rol: definitieveRol
    })
  })
  .then(res => {
    if (!res.ok) throw new Error('Kon shift niet opslaan op de server.');
    return fetch(`/availability/${availabilityId}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    });
  })
  .then(async res => {
    if (!res.ok) throw new Error('Shift opgeslagen, maar kon aanvraag niet wissen');
    
    card.remove();
    updateBadge(document.querySelectorAll('#requestList .shift').length);
    showToast('✓ Aanvraag bevestigd, shift opgeslagen');
    
    fetch_shifts(); 
  })
  .catch(err => showToast(err.message, 'error'));
}

function renderPlannerKalender() {
  const year = plannerMaand.getFullYear();
  const month = plannerMaand.getMonth();
  const titelEl = document.getElementById('planner-maand-titel');
  if (titelEl) titelEl.textContent = MAANDEN[month] + ' ' + year;

  const grid = document.getElementById('planner-kalender-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const offset = new Date(year, month, 1).getDay();
  for (let i = 0; i < (offset === 0 ? 6 : offset - 1); i++) grid.appendChild(document.createElement('div'));

  const vandaag = new Date();
  const vandaagStr = `${vandaag.getFullYear()}-${String(vandaag.getMonth()+1).padStart(2,'0')}-${String(vandaag.getDate()).padStart(2,'0')}`;

  getDaysInMonth(month, year).forEach(dag => {
    const j = dag.getFullYear();
    const m = String(dag.getMonth() + 1).padStart(2, '0');
    const d = String(dag.getDate()).padStart(2, '0');
    const ds = `${j}-${m}-${d}`;

    const shiftenOpDag = plannerShiften.filter(s => s.datum === ds);

    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (ds === vandaagStr) cell.classList.add('vandaag');
    if (geselecteerdeDagStr === ds) cell.classList.add('active');

    let stipHtml = '';
    if (shiftenOpDag.length > 0) {
      const heeftKassa = shiftenOpDag.some(s => s.rol === 'Kassa');
      const kleur = heeftKassa ? '#3498db' : '#2ecc71';
      
      stipHtml = `
        <div class="dag-stipjes" style="display: flex; gap: 3px; justify-content: center; margin-top: 4px;">
          <span class="stip" style="display: inline-block; width: 8px; height: 8px; background-color: ${kleur}; border-radius: 50%;" title="${shiftenOpDag.length} shift(en)"></span>
        </div>`;
    }

    cell.innerHTML = `
      <div class="day-number">${dag.getDate()}</div>
      ${stipHtml}
    `;
    
    cell.addEventListener('click', () => {
      geselecteerdeDagStr = ds;
      document.querySelectorAll('.day-cell').forEach(c => c.classList.remove('active'));
      cell.classList.add('active');
      zoekterm = ''; rolFilter = 'Alle';
      renderDagDetail(ds);
    });
    grid.appendChild(cell);
  });
}

function updateBadge(count) {
  const badge = document.querySelector('[data-tab="aanvragen"] .badge');
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count === 0 ? 'none' : '';
}

// PLANNER  —  GET /shifts
function fetch_shifts() {
  fetch('/shifts', {
    headers: { 
      'Authorization': localStorage.getItem('token'),
      'role': localStorage.getItem('role')
    }
  })
    .then(res => res.json())
    .then(data => {
      plannerShiften = data.map(s => {
        if (!s.start_dateTime) return null;
        
        const puurDatumStr = s.start_dateTime.substring(0, 10);
        const startObj = new Date(s.start_dateTime.replace(' ', 'T'));
        const eindObj = new Date(s.end_dateTime.replace(' ', 'T'));

        const startTijd = String(startObj.getHours()).padStart(2, '0') + ':' + String(startObj.getMinutes()).padStart(2, '0');
        const eindTijd = String(eindObj.getHours()).padStart(2, '0') + ':' + String(eindObj.getMinutes()).padStart(2, '0');

        return {
          id: s.planner_id,
          user_id: s.user_id,
          datum: puurDatumStr,
          start: startTijd,
          einde: eindTijd,
          rol: s.rol || s.role || s.description || 'Kassa'
        };
      }).filter(Boolean);
      
      renderPlannerKalender();
      
      if (geselecteerdeDagStr) {
        renderShiftenLijst(geselecteerdeDagStr);
      }
    })
    .catch(() => showToast('Kon shiften niet laden', 'error'));
}

function renderDagDetail(ds) {
  const detail = document.getElementById('planner-detail-inhoud');
  if (!detail) return;
  const dag = new Date(ds + 'T12:00:00');

  detail.dataset.dag = ds;
  detail.innerHTML = `
    <div class="detail-header">
      <h3>${dag.toLocaleDateString('nl-BE', { weekday:'long', day:'numeric', month:'long' })}</h3>
      <button class="primary-btn" style="width:auto;padding:8px 16px;margin-top:0;" onclick="openShiftModal('${ds}')">+ Shift</button>
    </div>
    <div class="filter-bar">
      <input type="text" id="planner-zoek" class="filter-input" placeholder="Zoek…">
      <div class="rol-filters" id="rol-filter-btns">
        ${['Alle', ...ROLLEN].map(r => `<button class="rol-btn ${rolFilter === r ? 'active' : ''}" onclick="rolFilter='${r}';renderShiftenLijst('${ds}')">${r}</button>`).join('')}
      </div>
    </div>
    <div id="dag-detail-lijsten"></div>
  `;
  document.getElementById('planner-zoek').addEventListener('input', e => { zoekterm = e.target.value; renderShiftenLijst(ds); });
  renderShiftenLijst(ds);
}

function renderShiftenLijst(ds) {
  const lijsten = document.getElementById('dag-detail-lijsten');
  if (!lijsten) return;

  let shiften = plannerShiften.filter(s => s.datum === ds);
  if (rolFilter !== 'Alle') shiften = shiften.filter(s => s.rol === rolFilter);
  if (zoekterm) shiften = shiften.filter(s => String(s.user_id).includes(zoekterm) || getStudentNaam(s.user_id).toLowerCase().includes(zoekterm.toLowerCase()));

  document.querySelectorAll('#rol-filter-btns .rol-btn').forEach(btn => btn.classList.toggle('active', btn.textContent === rolFilter));

  lijsten.innerHTML = `
    <h4 class="detail-sectie-titel">Shiften (${shiften.length})</h4>
    ${shiften.length === 0
      ? `<p class="leeg-tekst">Geen shiften op deze dag.</p>`
      : shiften.map(s => {
          const studentNaam = getStudentNaam(s.user_id);
          return `
          <div class="shift-card" style="border-left: 4px solid ${s.rol === 'Kassa' ? '#3498db' : '#2ecc71'}; margin-bottom: 10px; padding: 10px; background: #fff; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div class="shift-card-top" style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div class="avatar">${getInitials(studentNaam.split(' ')[0], studentNaam.split(' ')[1]) || s.user_id}</div>
                <div class="info">
                  <strong>${studentNaam}</strong>
                  <span class="role" style="display: block; font-size: 12px; color: #7f8c8d;">${s.rol}</span>
                </div>
              </div>
              <button class="delete-btn" onclick="verwijderShift(${s.id})" style="background:none;border:none;color:#ff4d4d;cursor:pointer;font-size:16px;">✕</button>
            </div>
            <div class="shift-tijd" style="margin-top: 8px; font-weight: bold; color: #2c3e50;">${s.start} – ${s.einde}</div>
          </div>`;
        }).join('')
    }
  `;
}

function plannerMaandVorige() { plannerMaand.setMonth(plannerMaand.getMonth() - 1); renderPlannerKalender(); }
function plannerMaandVolgende() { plannerMaand.setMonth(plannerMaand.getMonth() + 1); renderPlannerKalender(); }

function vulModalTijden() {
  ['modal-start', 'modal-einde'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = SHIFT_TIJDEN.map(t => `<option>${t}</option>`).join('');
  });
  
  const studentSel = document.getElementById('modal-student');
  if (studentSel) {
    studentSel.innerHTML = `<option value="">— Kies student —</option>` + 
      globaleLedenLijst.map(s => `<option value="${s.users_id || s.id}">${s.first_name} ${s.last_name}</option>`).join('');
  }
}

function openShiftModal(ds, userId = null) {
  modalDatum = ds;
  vulModalTijden();
  document.getElementById('modal-datum-label').textContent =
    new Date(ds + 'T12:00:00').toLocaleDateString('nl-BE', { weekday:'long', day:'numeric', month:'long' });
  
  if (userId) document.getElementById('modal-student').value = userId;
  const studentSel = document.getElementById('modal-student');
  const tijdWrapper = document.getElementById('modal-tijd-wrapper');
  
  if (studentSel && tijdWrapper) {
    studentSel.onchange = () => { tijdWrapper.style.display = studentSel.value ? 'flex' : 'none'; };
    tijdWrapper.style.display = userId ? 'flex' : 'none';
  }
  document.getElementById('shift-modal').style.display = 'flex';
}

function sluitShiftModal() {
  document.getElementById('shift-modal').style.display = 'none';
}

function slaShiftOp() {
  const userId = document.getElementById('modal-student').value;
  const startTijd = document.getElementById('modal-start').value;
  const eindTijd = document.getElementById('modal-einde').value;
  const rol = document.getElementById('modal-rol')?.value || 'Kassa';

  if (!userId || !startTijd || !eindTijd) {
    showToast('Vul alle velden in', 'error');
    return;
  }

  const startFull = `${modalDatum} ${startTijd}:00`;
  const eindFull = `${modalDatum} ${eindTijd}:00`;

  fetch('/shifts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('token')
    },
    body: JSON.stringify({ 
      user_id: userId, 
      start: startFull, 
      einde: eindFull,
      start_dateTime: startFull,
      end_dateTime: eindFull,
      rol: rol 
    })
  })
  .then(res => {
    if (!res.ok) throw new Error('Kon shift niet opslaan');
    showToast('Shift handmatig toegevoegd');
    sluitShiftModal();
    fetch_shifts(); 
  })
  .catch(err => showToast(err.message, 'error'));
}

function verwijderShift(shiftId) {
  if (!confirm('Weet je zeker dat je deze shift wilt verwijderen?')) return;
  
  fetch(`/shifts/${shiftId}`, {
    method: 'DELETE',
    headers: { 'Authorization': localStorage.getItem('token') }
  })
  .then(res => {
    if (!res.ok) throw new Error('Kon shift niet verwijderen');
    showToast('Shift verwijderd', 'error');
    fetch_shifts(); 
  })
  .catch(err => showToast(err.message, 'error'));
}

// BERICHTEN
const studentSelect = document.getElementById('studentSelect');
const chatMessages   = document.getElementById('chatMessages');
const messageInput   = document.getElementById('messageInput');
let currentUserId   = null;

function fetch_users_voor_chat() {
  fetch('/user_info', {
    headers: { 'Authorization': localStorage.getItem('token') }
  })
    .then(res => res.json())
    .then(data => {
      if (studentSelect) {
        studentSelect.innerHTML = '<option value="">— Kies een student —</option>';
        data.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.users_id;
          opt.textContent = s.first_name + ' ' + s.last_name;
          studentSelect.appendChild(opt);
        });
      }
    })
    .catch(() => console.warn('GET /user_info faalt'));
}

if (studentSelect) {
  studentSelect.addEventListener('change', () => {
    currentUserId = studentSelect.value;
    if (!currentUserId) return;
    fetch_berichten();
  });
}

function fetch_berichten() {
  if (!currentUserId) return;
  fetch('/berichten', {
    headers: {
      'Authorization': localStorage.getItem('token'),
      'role': localStorage.getItem('role'),
      'studentId': currentUserId
    }
  })
    .then(res => res.json())
    .then(data => renderChat(data))
    .catch(() => showToast('Kon berichten niet laden', 'error'));
}

function renderChat(data) {
  if (!chatMessages) return;
  chatMessages.innerHTML = (data ?? []).map(m =>
    `<div class="message ${m.sender_id == currentUserId ? 'student' : 'manager'}">${m.content}</div>`
  ).join('');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !currentUserId) return;

  fetch('/bericht_sturen', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('token')
    },
    body: JSON.stringify({ content: text })
  })
    .then(() => { messageInput.value = ''; fetch_berichten(); })
    .catch(() => showToast('Bericht versturen mislukt', 'error'));
}

if (document.getElementById('sendMessage')) {
  document.getElementById('sendMessage').addEventListener('click', sendMessage);
  messageInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
}

function renderLeden(data) {
  const list = document.getElementById('ledenList');
  if (!list) return;
  if (!data || data.length === 0) {
    list.innerHTML = `<p class="leeg-tekst">Geen leden gevonden.</p>`;
    return;
  }
  list.innerHTML = data.map(s => `
    <div class="shift">
      <div class="avatar">${getInitials(s.first_name, s.last_name)}</div>
      <div class="info">
        <strong>${s.first_name} ${s.last_name}</strong>
        <small>${s.email ?? ''} ${s.telefoonnummer ? '• ' + s.telefoonnummer : ''}</small>
      </div>
    </div>`).join('');
}

// ==========================================
// GEZAMENLIJKE INITIALISATIE BIJ APPLICATIE START
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  // Haal eerst alle leden op, zodat getStudentNaam() direct werkt
  fetch('/users', {
    headers: { 'Authorization': token }
  })
  .then(res => res.json())
  .then(data => {
    globaleLedenLijst = data; 
    renderLeden(data);

    // Pas nadat de ledenlijst geladen is, starten we de rest op
    fetch_availability();
    fetch_shifts();
    fetch_users_voor_chat();
  })
  .catch(() => {
    const el = document.getElementById('ledenList');
    if (el) el.innerHTML = `<p class="leeg-tekst">Kon leden niet laden.</p>`;
    
    // Fallback opstart als de gebruikers API faalt
    fetch_availability();
    fetch_shifts();
    fetch_users_voor_chat();
  });
});