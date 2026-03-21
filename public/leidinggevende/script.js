// moet nog naar db
const aantalAanvragen = 3;

const studenten = [
    { naam: "Emma Jansen",   taak: "Kasa",      status: "op tijd" },
    { naam: "Lars de Boer",  taak: "Bijvullen",  status: "te laat" },
    { naam: "Sophie Vermeer",taak: "Kasa",      status: "op tijd" },
    { naam: "Daan Bakker",   taak: "Stockroom",  status: "op tijd" },
    { naam: "Lisa Mulder",   taak: "Bijvullen",  status: "niet aanwezig" },
];
const aantalIngepland = 5;




// --- Badge ---
const badge = document.getElementById("aanvraagBadge");
badge.textContent = aantalAanvragen > 0 ? aantalAanvragen : "";

// nav systeem
const tabs = document.querySelectorAll(".tab");
const tabviews = document.querySelectorAll(".tabview");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        // Verwijder active van alle tabs en sections
        tabs.forEach(t => t.classList.remove("active"));
        tabviews.forEach(v => v.classList.remove("active"));

        // Voeg active toe aan geklikte tab en bijhorende section
        tab.classList.add("active");
        document.getElementById(tab.dataset.tab).classList.add("active");
    });
});



// aanwezigheden
// --- Datum ---
const datum = new Date();
const opties = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
document.getElementById("currentDate").textContent = datum.toLocaleDateString("nl-NL", opties);
document.getElementById("studentCount").textContent = `${studenten.length} studenten ingepland`;

// --- Planning cards ---
const planningList = document.getElementById("planningList");

studenten.forEach(student => {
    const card = document.createElement("div");
    card.className = "student-card";
    card.innerHTML = `
        <span class="student-naam">${student.naam}</span>
        <span class="student-taak">${student.taak}</span>
        <span class="student-status ${student.status === 'te laat' ? 'laat' : 'tijd'}">${student.status}</span>
    `;
    planningList.appendChild(card);
});




// --- Studenten in select ---
const select = document.getElementById("studentSelect");
studenten.forEach(naam => {
    const option = document.createElement("option");
    option.value = naam;
    option.textContent = naam;
    select.appendChild(option);
});



