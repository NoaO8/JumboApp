// ============================================================
// data.js — tijdelijk in-memory, later vervangen door SQLite API
// ============================================================

// --- CONFIG ---
const ROLLEN = ['Kassa', 'Vakkenvuller', 'Vers', 'AGF', 'Bakkerij', 'Schoonmaak'];

const SHIFT_TIJDEN = Array.from({ length: 16 }, (_, i) =>
  String(i + 6).padStart(2, '0') + ':00'
);

const MAANDEN = [
  'januari','februari','maart','april','mei','juni',
  'juli','augustus','september','oktober','november','december'
];

const WEEKDAGEN = ['Ma','Di','Wo','Do','Vr','Za','Zo'];

// --- DATA ---
const DATA = {
  planningDate: 'vrijdag 30 januari 2026',

  students: [
    { id: 1, name: 'Emma Jansen' },
    { id: 2, name: 'Lars de Boer' },
    { id: 3, name: 'Sophie Vermeer' },
    { id: 4, name: 'Daan Bakker' },
    { id: 5, name: 'Lisa Mulder' },
  ],

  planning: [
    { studentId: 1, role: 'Kassa',        time: '08:00 – 16:00', status: 'Aanwezig', statusType: 'green' },
    { studentId: 2, role: 'Vakkenvuller', time: '09:00 – 17:00', status: 'Aanwezig', statusType: 'green' },
    { studentId: 3, role: 'Vers',         time: '10:00 – 14:00', status: 'Pauze',    statusType: 'yellow' },
    { studentId: 4, role: 'AGF',          time: '07:00 – 15:00', status: 'Aanwezig', statusType: 'green' },
    { studentId: 5, role: 'Bakkerij',     time: '11:00 – 19:00', status: 'Te laat',  statusType: 'red' },
  ],

  requests: [
    { id: 1, studentId: 2, date: '22-1-2026', time: '09:00–17:00', rol: 'Vakkenvuller' },
    { id: 2, studentId: 3, date: '23-1-2026', time: '10:00–18:00', rol: 'Vers' },
    { id: 3, studentId: 5, date: '24-1-2026', time: '11:00–19:00', rol: 'Bakkerij' },
  ],
};

const beschikbaarheidData = {
  1: {
    '2026-05-08': { start: '08:00', einde: '16:00' },
    '2026-05-09': { start: '10:00', einde: '18:00' },
    '2026-05-12': { start: '08:00', einde: '16:00' },
    '2026-05-19': 'vrij',
    '2026-05-20': 'vrij',
    '2026-05-21': 'vrij',
    '2026-05-22': 'vrij',
    '2026-05-23': 'vrij',
  },
  2: {
    '2026-05-08': { start: '12:00', einde: '20:00' },
    '2026-05-09': { start: '08:00', einde: '16:00' },
    '2026-05-13': { start: '09:00', einde: '17:00' },
  },
  3: {
    '2026-05-08': { start: '08:00', einde: '20:00' },
    '2026-05-10': { start: '09:00', einde: '17:00' },
    '2026-05-12': { start: '10:00', einde: '18:00' },
  },
  4: {
    '2026-05-09': { start: '07:00', einde: '15:00' },
    '2026-05-12': { start: '07:00', einde: '15:00' },
    '2026-05-14': { start: '08:00', einde: '16:00' },
  },
  5: {
    '2026-05-08': { start: '11:00', einde: '19:00' },
    '2026-05-09': { start: '11:00', einde: '19:00' },
    '2026-05-12': { start: '11:00', einde: '19:00' },
  },
};

function getBeschikbaarheidStr(studentId, ds) {
  const b = beschikbaarheidData[studentId]?.[ds];
  if (!b) return null;
  if (b === 'vrij') return 'Vrij (hele dag)';
  return `${b.start}–${b.einde}`;
}

function getBeschikbaarheidTijden(studentId, ds) {
  const b = beschikbaarheidData[studentId]?.[ds];
  if (!b) return null;
  if (b === 'vrij') return { start: '08:00', einde: '20:00' };
  return { start: b.start, einde: b.einde };
}

let volgendReqId = 10;

function getStudent(id) {
  return DATA.students.find(s => s.id === id);
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('');
}

function getWeekUren(studentId, weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return plannerShiften
    .filter(s => {
      if (s.studentId !== studentId) return false;
      const d = new Date(s.datum);
      return d >= weekStart && d < weekEnd;
    })
    .reduce((sum, s) => {
      const [sh, sm] = s.start.split(':').map(Number);
      const [eh, em] = s.einde.split(':').map(Number);
      return sum + ((eh * 60 + em) - (sh * 60 + sm)) / 60;
    }, 0);
}

function getMaandagVanWeek(datum) {
  const d = new Date(datum);
  const dag = d.getDay();
  const diff = dag === 0 ? -6 : 1 - dag;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}