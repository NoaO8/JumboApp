//word nog vervangen door een db

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
    { studentId: 2, date: '22-1-2026', time: '09:00 – 17:00' },
    { studentId: 3, date: '23-1-2026', time: '10:00 – 18:00' },
    { studentId: 5, date: '24-1-2026', time: '11:00 – 19:00' },
  ],
};

function getStudent(id) {
  return DATA.students.find(s => s.id === id);
}
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('');
}