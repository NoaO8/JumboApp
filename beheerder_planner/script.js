// ============================================================
// TAB SWITCHING
// ============================================================
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tabview').forEach(v => v.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');

    // Render kalender als Beschikbaarheid tab geopend wordt
    if (tab.dataset.tab === 'beschikbaarheid') {
      fill_Beschikbaarheid();
    }
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
  chatMessages.innerHTML = `
    <div class="message student">
      Hey, dit is ${student.name} 👋
    </div>`;
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !currentStudent) return;

  chatMessages.innerHTML += `<div class="message manager">${text}</div>`;
  messageInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});


// ============================================================
// BESCHIKBAARHEID – KALENDER
// ============================================================
const maanden = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];

const datum = new Date();
let thisYear  = datum.getFullYear();
let thisMonth = datum.getMonth();
let selectedDay = null;

const getDaysInMonth = (month, year) => {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const kiesTijd = (day) => {
  const tijd_container = document.getElementById('beschikbaarheid_tijd');
  tijd_container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "card";

  // Titel
  const title = document.createElement("h3");
  title.textContent = "Beschikbaarheid instellen";

  const datumLabel = document.createElement("p");
  datumLabel.className = "time-date";
  datumLabel.textContent = day.toLocaleDateString("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  // Flex knop
  const flexBtn = document.createElement("button");
  flexBtn.textContent = "✓ Flexibel";
  flexBtn.className = "flex-btn";

  // Tijd selects
  const row = document.createElement("div");
  row.className = "time-row";

  const startSelect = document.createElement("select");
  const eindeSelect = document.createElement("select");

  for (let i = 6; i <= 21; i++) {
    const opt1 = document.createElement("option");
    opt1.value = i;
    opt1.textContent = i + ":00";

    const opt2 = document.createElement("option");
    opt2.value = i;
    opt2.textContent = i + ":00";

    startSelect.appendChild(opt1);
    eindeSelect.appendChild(opt2);
  }

  row.append(startSelect, eindeSelect);

  // Opslaan
  const opslaanBtn = document.createElement("button");
  opslaanBtn.textContent = "Opslaan";
  opslaanBtn.className = "primary-btn";

  opslaanBtn.onclick = () => {
    const start_uur = startSelect.value;
    const eind_uur  = eindeSelect.value;

    const volledige_start = new Date(day);
    volledige_start.setHours(start_uur, 0, 0, 0);

    const volledige_einde = new Date(day);
    volledige_einde.setHours(eind_uur, 0, 0, 0);

    fetch("/beschikbaarheid_opslaan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ volledige_start, volledige_einde })
    });
  };

  // Sluiten
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Sluiten";
  closeBtn.className = "secondary-btn";
  closeBtn.onclick = () => { tijd_container.innerHTML = ""; };

  card.append(title, datumLabel, flexBtn, row, opslaanBtn, closeBtn);
  tijd_container.appendChild(card);
};

const fill_Beschikbaarheid = () => {
  const inhoud_container = document.getElementById('beschikbaarheid_inhoud');
  const tijd_container   = document.getElementById('beschikbaarheid_tijd');

  inhoud_container.innerHTML = "";
  tijd_container.innerHTML   = "";

  const card = document.createElement("div");
  card.className = "card";

  // Header met navigatie
  const header = document.createElement("div");
  header.style.display         = "flex";
  header.style.justifyContent  = "space-between";
  header.style.alignItems      = "center";

  const btnBack    = document.createElement("button");
  const btnForward = document.createElement("button");
  const title      = document.createElement("h2");

  btnBack.textContent    = "<";
  btnForward.textContent = ">";
  title.textContent      = maanden[thisMonth] + " " + thisYear;

  btnBack.onclick = () => {
    datum.setMonth(datum.getMonth() - 1);
    thisMonth = datum.getMonth();
    thisYear  = datum.getFullYear();
    fill_Beschikbaarheid();
  };

  btnForward.onclick = () => {
    datum.setMonth(datum.getMonth() + 1);
    thisMonth = datum.getMonth();
    thisYear  = datum.getFullYear();
    fill_Beschikbaarheid();
  };

  header.append(btnBack, title, btnForward);

  // Weekdagen header
  const weekRow = document.createElement("div");
  weekRow.className = "calendar-grid header";

  ["Ma","Di","Wo","Do","Vr","Za","Zo"].forEach(d => {
    const el = document.createElement("div");
    el.textContent = d;
    weekRow.appendChild(el);
  });

  // Kalender grid
  const grid = document.createElement("div");
  grid.className = "calendar-grid";

  const firstDay = new Date(thisYear, thisMonth, 1).getDay();
  const offset   = firstDay === 0 ? 6 : firstDay - 1;

  // Lege vakjes voor offset
  for (let i = 0; i < offset; i++) {
    grid.appendChild(document.createElement("div"));
  }

  // Dag cellen
  getDaysInMonth(thisMonth, thisYear).forEach(dag => {
    const cell = document.createElement("div");
    cell.className = "day-cell";

    const num = document.createElement("div");
    num.className   = "day-number";
    num.textContent = dag.getDate();

    cell.appendChild(num);

    cell.addEventListener("click", () => {
      selectedDay = dag;
      kiesTijd(dag);
      document.querySelectorAll(".day-cell").forEach(c => c.classList.remove("active"));
      cell.classList.add("active");
    });

    grid.appendChild(cell);
  });

  card.append(header, weekRow, grid);
  inhoud_container.appendChild(card);
};


// ============================================================
// INIT
// ============================================================
renderPlanning();
renderRequests();
populateStudentSelect();