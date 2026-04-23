//containers ophalen om te vullen bij opstart
const header_container = document.querySelector(".header_container")
const nav_container = document.querySelector(".nav_container")
const inhoud_container = document.querySelector(".inhoud_container")
const tijd_container = document.querySelector(".tijd_container")
//globale DOM variabelen
const btn_go_beschikbaarheid = document.createElement("button")
const btn_go_berichten = document.createElement("button")
const btn_go_profiel = document.createElement("button")
const opslaanBtn = document.createElement("button")
const startSelect = document.createElement("select")
const eindeSelect = document.createElement("select")
//globale variabelen
const maanden = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"]
const dagen = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"]
const datum = new Date
let thisYear = datum.getFullYear()
let thisMonth = datum.getMonth()
let selectedDay = ""

//fill functies opzetten
const fill_header_container = (titel = "Mijn Planner") => {
    const header_span = document.querySelector(".header_span")
    header_span.textContent = titel //titel verandert op basis van keuze
}
const fill_nav_container = () => {
    const nav_header = document.createElement("h2")
    const nav_header2 = document.createElement("h3")
    nav_header.textContent = "Jumbo Planner"
    nav_header2.textContent = "Welkom!"

    btn_go_beschikbaarheid.textContent = "Beschikbaarheid"
    btn_go_berichten.textContent = "Berichten"
    btn_go_profiel.textContent = "Profiel"

    btn_go_beschikbaarheid.id = "Beschikbaarheid"
    btn_go_berichten.id = "Berichten"
    btn_go_profiel.id = "Profiel"

    nav_container.append(nav_header, nav_header2, btn_go_beschikbaarheid, btn_go_berichten, btn_go_profiel)
}
getDaysInMonth = (month, year) => {
    const days = [];
    const date = new Date(year, month, 1);

    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }

    return days;
}
/*
const days = getDaysInMonth(0, 2025); 
console.log(days.length); // 31*/
const getAllDaysByMonth = (year) => {
    return Array.from({ length: 12 }, (_, month) => ({
        month: month,
        days: Array.from(
            { length: new Date(year, month + 1, 0).getDate() },
            (_, i) => new Date(year, month, i + 1)
        )
    }));
}
/*
const result = getAllDaysByMonth(2026);
result.forEach(({ month, days }) => {
  console.log(`Maand ${month + 1}: ${days.length} dagen`);
  console.log(days)
});*/
//elke keuze eigen functie
//functie zoda we weten welke .getDay() naar een deftige dag zettn = 3 -> woensdag
const kiesTijd = (day) => {
    tijd_container.innerHTML = ""
    //hier krijgt de student de keuze welke uren hij/zij wil
    const flexBtn = document.createElement("button")
    //van 6 tot 21u
    for (let i = 6; i <= 21; i++) {
        let optStart = document.createElement('option');
        optStart.value = i;
        optStart.textContent = i + "u";
        startSelect.appendChild(optStart);
        let optEinde = document.createElement('option');
        optEinde.value = i;
        optEinde.textContent = i + "u";
        eindeSelect.appendChild(optEinde)
    }
    flexBtn.textContent = "flexibel"
    opslaanBtn.textContent = "Sla beschikbaarheid op"
    //nieuwe container word gevuld me deze keuzes
    tijd_container.append(startSelect, flexBtn, eindeSelect, opslaanBtn)
}
const fill_Beschikbaarheid = () => {
    inhoud_container.innerHTML = ""
    //eerst den maand
    //console.log(datum)
    const btnBack = document.createElement("button")
    const btnForward = document.createElement("button")
    const pMonthYear = document.createElement("p")
    btnBack.addEventListener("click", () => {
        datum.setMonth(datum.getMonth() - 1)
        thisMonth = datum.getMonth()
        thisYear = datum.getFullYear()
        pMonthYear.textContent = (maanden[thisMonth]) + " " + thisYear
        fill_Beschikbaarheid()
    })
    btnForward.addEventListener("click", () => {
        datum.setMonth(datum.getMonth() + 1)
        thisMonth = datum.getMonth()
        thisYear = datum.getFullYear()
        pMonthYear.textContent = (maanden[thisMonth]) + " " + thisYear
        fill_Beschikbaarheid()
    })
    btnBack.textContent = "<-"
    btnForward.textContent = "->"
    pMonthYear.textContent = maanden[thisMonth] + " " + thisYear
    inhoud_container.append(btnBack, pMonthYear, btnForward)

    //roster me buttns 7*3 of 4
    const aDagen = getDaysInMonth(thisMonth, thisYear)
    //console.log(aDagen)
    const eerstedag = new Date(thisYear, thisMonth, 1).getDay()
    for (let i = 0; i < aDagen.length; i++) {
        const btn = document.createElement("button")
        const welkeDag = (eerstedag + i) % 7  // zo loop je rond na zaterdag
        btn.textContent = dagen[welkeDag] + "\n" + aDagen[i].getDate()
        inhoud_container.append(btn)
        btn.addEventListener("click", () => {
            kiesTijd(aDagen[i])
            selectedDay = aDagen[i]
            console.log(selectedDay)
        })
    }
}
opslaanBtn.addEventListener("click", () => {
const start_uur = startSelect.value
const eind_uur = eindeSelect.value

const volledige_start = new Date(selectedDay)
volledige_start.setHours(start_uur, 0, 0, 0)

const volledig_einde = new Date(selectedDay)
volledig_einde.setHours(eind_uur, 0, 0, 0)

console.log(volledige_start)
console.log(volledig_einde)

fetch("/beschikbaarheid_opslaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volledige_start, volledig_einde })
      })
})
const fill_inhoud_container = (welke_inhoud = "Mijn Planner") => {
    //ook eerst nav afmaken
    //eerst moetn we weten ofda wie da is ingelogt
    //console.log(welke_inhoud)
    inhoud_container.innerHTML = ""
    switch (welke_inhoud) {
        case "Beschikbaarheid":
            console.log(welke_inhoud)
            fill_Beschikbaarheid()
            break;
        case "Berichten":
            console.log(welke_inhoud)
            break;
        case "Profiel":
            console.log(welke_inhoud)
            break;
    }
}

/*die nav_buttons
moe nog kijkn vo dit makkelijker te doen*/
btn_go_beschikbaarheid.addEventListener("click", () => {
    fill_header_container(btn_go_beschikbaarheid.id)
    fill_inhoud_container(btn_go_beschikbaarheid.id)
})
btn_go_berichten.addEventListener("click", () => {
    fill_header_container(btn_go_berichten.id)
    fill_inhoud_container(btn_go_berichten.id)
})
btn_go_profiel.addEventListener("click", () => {
    fill_header_container(btn_go_profiel.id)
    fill_inhoud_container(btn_go_profiel.id)
})


//alle fills bij opstart aanroepen
fill_header_container()
fill_nav_container()
fill_inhoud_container("Beschikbaarheid")