// ============================================================
// data.js — tijdelijk in-memory, later vervangen door SQLite API
// ============================================================

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

  // requests bijhouden als array van objecten zodat we ze echt kunnen verwijderen
  requests: [
    { id: 1, studentId: 2, date: '22-1-2026', time: '09:00 – 17:00' },
    { id: 2, studentId: 3, date: '23-1-2026', time: '10:00 – 18:00' },
    { id: 3, studentId: 5, date: '24-1-2026', time: '11:00 – 19:00' },
  ],
};

function getStudent(id) {
  return DATA.students.find(s => s.id === id);
}
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('');
}

// Bereken totale geplande uren voor een student in een week
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

// Geeft maandag van de week voor een gegeven datum
function getMaandagVanWeek(datum) {
  const d = new Date(datum);
  const dag = d.getDay();
  const diff = dag === 0 ? -6 : 1 - dag;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}