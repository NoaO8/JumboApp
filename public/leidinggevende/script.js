// CONFIG
const ROLLEN = ['Kassa', 'Vakkenvuller', 'Vers', 'AGF', 'Bakkerij', 'Schoonmaak'];
const MAANDEN = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
const SHIFT_TIJDEN = Array.from({ length: 16 }, (_, i) => String(i + 6).padStart(2, '0') + ':00');

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

function getMaandagVanWeek(datum) {
  const d = new Date(datum);
  const dag = d.getDay();
  d.setDate(d.getDate() + (dag === 0 ? -6 : 1 - dag));
  d.setHours(0, 0, 0, 0);
  return d;
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
    .then(data => renderRequests(data))
    .catch(() => showToast('Kon aanvragen niet laden', 'error'));
}

function renderRequests(data) {
  const list = document.getElementById('requestList');

  if (!data || data.length === 0) {
    list.innerHTML = `<p class="leeg-tekst" style="padding:20px 0;">Geen open aanvragen.</p>`;
    updateBadge(0);
    return;
  }

  list.innerHTML = data.map(req => `
    <div class="shift" id="req-${req.availability_id}">
      <div class="avatar">${req.user_id}</div>
      <div class="info">
        <strong>User #${req.user_id}</strong>
        <small>${req.start_dateTime} – ${req.end_dateTime}</small>
      </div>
      <button class="action reject" onclick="handleRequest(${req.availability_id}, false)">✕ Weigeren</button>
      <button class="action accept" onclick="handleRequest(${req.availability_id}, true)">✓ Bevestigen</button>
    </div>`).join('');

  updateBadge(data.length);
}

function handleRequest(availabilityId, accepted) {
  const card = document.getElementById(`req-${availabilityId}`);

  if (!accepted) {
    fetch(`/availability/${availabilityId}`, {   // ← dit ontbrak
      method: 'DELETE',
      headers: { 'Authorization': localStorage.getItem('token') }
    });
    card?.remove();
    updateBadge(document.querySelectorAll('#requestList .shift').length);
    showToast('Aanvraag geweigerd', 'error');
    return;
  }

  // ... na POST /shifts geslaagd:
  fetch(`/availability/${availabilityId}`, {     // ← dit ontbrak
    method: 'DELETE',
    headers: { 'Authorization': localStorage.getItem('token') }
  });
  
  // Haal de data uit de kaart zelf
  const dataTekst = card.querySelector('small').textContent; // "2026-05-08T08:00 – 2026-05-08T16:00"
  const [startRaw, eindeRaw] = dataTekst.split('–').map(t => t.trim());

  fetch('/shifts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('token')
    },
    body: JSON.stringify({
      user_id: card.querySelector('.avatar').textContent,
      start: startRaw,
      einde: eindeRaw,
      rol: 'Kassa' // TODO: rol meesturen vanuit availability als die kolom bestaat
    })
  })
    .then(res => {
      if (!res.ok) throw new Error();
      card?.remove();
      updateBadge(document.querySelectorAll('#requestList .shift').length);
      showToast('✓ Aanvraag bevestigd, shift opgeslagen');
      fetch_shifts(); // herlaad planner vanuit DB
    })
    .catch(() => showToast('Shift opslaan mislukt (POST /shifts nog niet klaar)', 'error'));
}

function updateBadge(count) {
  const badge = document.querySelector('[data-tab="aanvragen"] .badge');
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count === 0 ? 'none' : '';
}

// PLANNER  —  GET /shifts
let plannerShiften = [];
let plannerMaand = new Date(); plannerMaand.setDate(1);
let geselecteerdeDagStr = null;
let volgendShiftId = 100;
let modalDatum = '';
let zoekterm = '';
let rolFilter = 'Alle';

function fetch_shifts() {
  fetch('/shifts', {
    headers: { 'Authorization': localStorage.getItem('token') }
  })
    .then(res => res.json())
    .then(data => {
      // DB geeft planner rows terug, map naar intern formaat
      plannerShiften = data.map(s => ({
        id: s.planner_id,
        user_id: s.user_id,
        datum: s.start_dateTime?.split('T')[0] ?? s.start_dateTime?.split(' ')[0],
        start: s.start_dateTime?.split('T')[1]?.slice(0,5) ?? s.start_dateTime?.split(' ')[1]?.slice(0,5),
        einde: s.end_dateTime?.split('T')[1]?.slice(0,5) ?? s.end_dateTime?.split(' ')[1]?.slice(0,5),
        rol: s.rol ?? 'Kassa'
      }));
      renderPlannerKalender();
    })
    .catch(() => showToast('Kon shiften niet laden', 'error'));
}

function renderPlannerKalender() {
  const year = plannerMaand.getFullYear();
  const month = plannerMaand.getMonth();
  document.getElementById('planner-maand-titel').textContent = MAANDEN[month] + ' ' + year;

  const grid = document.getElementById('planner-kalender-grid');
  grid.innerHTML = '';

  const offset = new Date(year, month, 1).getDay();
  for (let i = 0; i < (offset === 0 ? 6 : offset - 1); i++) grid.appendChild(document.createElement('div'));

  const vandaagStr = datumStr(new Date());
  getDaysInMonth(month, year).forEach(dag => {
    const ds = datumStr(dag);
    const shiftenOpDag = plannerShiften.filter(s => s.datum === ds);

    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (ds === vandaagStr) cell.classList.add('vandaag');
    if (geselecteerdeDagStr === ds) cell.classList.add('active');

    cell.innerHTML = `
      <div class="day-number">${dag.getDate()}</div>
      ${shiftenOpDag.length > 0 ? `<div class="dag-stipjes"><span class="stip stip-shift" title="${shiftenOpDag.length} shift(en)"></span></div>` : ''}
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

function renderDagDetail(ds) {
  const detail = document.getElementById('planner-detail-inhoud');
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
  if (zoekterm) shiften = shiften.filter(s => String(s.user_id).includes(zoekterm));

  document.querySelectorAll('#rol-filter-btns .rol-btn').forEach(btn => btn.classList.toggle('active', btn.textContent === rolFilter));

  lijsten.innerHTML = `
    <h4 class="detail-sectie-titel">Shiften (${shiften.length})</h4>
    ${shiften.length === 0
      ? `<p class="leeg-tekst">Geen shiften.</p>`
      : shiften.map(s => `
          <div class="shift-card">
            <div class="shift-card-top">
              <div class="avatar">${s.user_id}</div>
              <div class="info">
                <strong>User #${s.user_id}</strong>
                <span class="role">${s.rol}</span>
              </div>
              <button class="delete-btn" onclick="verwijderShift(${s.id})">✕</button>
            </div>
            <div class="shift-tijd">${s.start} – ${s.einde}</div>
          </div>`).join('')
    }
  `;
}

function plannerMaandVorige() { plannerMaand.setMonth(plannerMaand.getMonth() - 1); renderPlannerKalender(); }
function plannerMaandVolgende() { plannerMaand.setMonth(plannerMaand.getMonth() + 1); renderPlannerKalender(); }

function vulModalTijden() {
  ['modal-start', 'modal-einde'].forEach(id => {
    document.getElementById(id).innerHTML = SHIFT_TIJDEN.map(t => `<option>${t}</option>`).join('');
  });
  // TODO: studenten uit DB laden zodra GET /users beschikbaar is
  document.getElementById('modal-student').innerHTML = `<option value="">— Kies student —</option>`;
}

function openShiftModal(ds, userId = null) {
  modalDatum = ds;
  vulModalTijden();
  document.getElementById('modal-datum-label').textContent =
    new Date(ds + 'T12:00:00').toLocaleDateString('nl-BE', { weekday:'long', day:'numeric', month:'long' });
  if (userId) document.getElementById('modal-student').value = userId;
  const studentSel = document.getElementById('modal-student');
  const tijdWrapper = document.getElementById('modal-tijd-wrapper');
  studentSel.onchange = () => { tijdWrapper.style.display = studentSel.value ? 'flex' : 'none'; };
  tijdWrapper.style.display = userId ? 'flex' : 'none';
  document.getElementById('shift-modal').style.display = 'flex';
}

function sluitModal() { document.getElementById('shift-modal').style.display = 'none'; }
function sluitModalBuiten(e) { if (e.target.classList.contains('modal-overlay')) sluitModal(); }

function slaShiftOp() {
  const userId = document.getElementById('modal-student').value;
  const rol    = document.getElementById('modal-rol').value;
  const start  = document.getElementById('modal-start').value;
  const einde  = document.getElementById('modal-einde').value;

  if (!userId) { showToast('Kies een student', 'error'); return; }
  if (einde <= start) { showToast('Eindtijd moet na begintijd zijn', 'error'); return; }

  // Check op overlappende tijden (zelfde persoon, zelfde dag, overlappend uur)
  const conflict = plannerShiften.some(s =>
    s.user_id == userId &&
    s.datum === modalDatum &&
    s.start < einde &&
    s.einde > start
  );
  if (conflict) { showToast('Student heeft al een shift op dit tijdstip', 'error'); return; }

  // TODO: POST /shifts zodra route beschikbaar is

  plannerShiften.push({ id: volgendShiftId++, user_id: userId, datum: modalDatum, start, einde, rol });
  sluitModal();
  renderPlannerKalender();
  if (geselecteerdeDagStr) renderDagDetail(geselecteerdeDagStr);
  showToast('Shift opgeslagen');
}

function verwijderShift(id) {
  if (!confirm('Shift verwijderen?')) return;
  // TODO: DELETE /shifts/:id zodra route beschikbaar is
  plannerShiften = plannerShiften.filter(s => s.id !== id);
  renderPlannerKalender();
  if (geselecteerdeDagStr) renderDagDetail(geselecteerdeDagStr);
  showToast('Shift verwijderd', 'error');
}

// BERICHTEN  —  GET /berichten  +  POST /bericht_sturen
const studentSelect = document.getElementById('studentSelect');
const chatMessages  = document.getElementById('chatMessages');
const messageInput  = document.getElementById('messageInput');
let currentUserId   = null;

// TODO: GET /user_info heeft een bug op de server (mist de '/'), fetch faalt momenteel
function fetch_users_voor_chat() {
  fetch('/user_info', {
    headers: { 'Authorization': localStorage.getItem('token') }
  })
    .then(res => res.json())
    .then(data => {
      data.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.users_id;
        opt.textContent = s.first_name + ' ' + s.last_name;
        studentSelect.appendChild(opt);
      });
    })
    .catch(() => console.warn('GET /user_info faalt — bug op server (mist slash)'));
}

studentSelect.addEventListener('change', () => {
  currentUserId = studentSelect.value;
  if (!currentUserId) return;
  fetch_berichten();
});

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

document.getElementById('sendMessage').addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

// LEDEN  —  GET/POST/DELETE /users  (TODO: routes nog te maken)
function fetch_leden() {
  // TODO: GET /users zodra route beschikbaar is
  fetch('/users', {
    headers: { 'Authorization': localStorage.getItem('token') }
  })
    .then(res => res.json())
    .then(data => renderLeden(data))
    .catch(() => document.getElementById('ledenList').innerHTML = `<p class="leeg-tekst">Kon leden niet laden (route nog niet beschikbaar).</p>`);
}

function renderLeden(data) {
  const list = document.getElementById('ledenList');
  if (!data || data.length === 0) {
    list.innerHTML = `<p class="leeg-tekst">Geen leden gevonden.</p>`;
    return;
  }
  list.innerHTML = data.map(s => `
    <div class="shift">
      <div class="avatar">${(s.first_name?.[0] ?? '') + (s.last_name?.[0] ?? '')}</div>
      <div class="info">
        <strong>${s.first_name} ${s.last_name}</strong>
        <small>${s.email ?? ''} ${s.telefoonnummer ? '• ' + s.telefoonnummer : ''}</small>
      </div>
      <button class="action reject" onclick="verwijderLid(${s.users_id})">✕ Verwijderen</button>
    </div>`).join('');
}

function voegLidToe() {
  const voornaam      = document.getElementById('lid-voornaam').value.trim();
  const achternaam    = document.getElementById('lid-achternaam').value.trim();
  const email         = document.getElementById('lid-email').value.trim();
  const telefoon      = document.getElementById('lid-telefoon').value.trim();
  const geboortedatum = document.getElementById('lid-geboortedatum').value;

  if (!voornaam || !achternaam || !geboortedatum) {
    showToast('Voornaam, achternaam en geboortedatum zijn verplicht', 'error');
    return;
  }

  // TODO: POST /users zodra route beschikbaar is
  fetch('/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('token')
    },
    body: JSON.stringify({ first_name: voornaam, last_name: achternaam, email, telefoonnummer: telefoon, birthdate: geboortedatum })
  })
    .then(res => res.json())
    .then(() => {
      showToast(`${voornaam} ${achternaam} toegevoegd`);
      ['lid-voornaam','lid-achternaam','lid-email','lid-telefoon','lid-geboortedatum'].forEach(id => document.getElementById(id).value = '');
      fetch_leden();
    })
    .catch(() => showToast('Toevoegen mislukt (route nog niet beschikbaar)', 'error'));
}

function verwijderLid(id) {
  if (!confirm('Dit lid permanent verwijderen?')) return;
  // TODO: DELETE /users/:id zodra route beschikbaar is
  fetch(`/users/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': localStorage.getItem('token') }
  })
    .then(() => { showToast('Lid verwijderd', 'error'); fetch_leden(); })
    .catch(() => showToast('Verwijderen mislukt (route nog niet beschikbaar)', 'error'));
}

// INIT
fetch_availability();
fetch_shifts();
fetch_users_voor_chat();
fetch_leden();