// --- TAB SWITCHING ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tabview').forEach(v => v.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
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

// Vul dropdown dynamisch in
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

// --- INIT ---
renderPlanning();
renderRequests();
populateStudentSelect();