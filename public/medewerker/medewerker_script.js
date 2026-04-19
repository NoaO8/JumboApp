//containers ophalen om te vullen bij opstart
const header_container = document.querySelector(".header_container")
const nav_container = document.querySelector(".nav_container")
const inhoud_container = document.querySelector(".inhoud_container")
const tijd_container = document.querySelector(".tijd_container")
//globale DOM variabelen
const btn_go_beschikbaarheid = document.createElement("button")
const btn_go_berichten = document.createElement("button")
const btn_go_profiel = document.createElement("button")
//globale variabelen

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
const getDayMaBeter = (day) => {
    console.log(day)
    let dayString = ""
    switch (day) {
        case 0:
            dayString = "zondag"
            break;
        case 1:
            dayString = "maandag"
            break;
        case 2:
            dayString = "dinsdag"
            break;
        case 3:
            dayString = "woensdag"
            break;
        case 4:
            dayString = "donderdag"
            break;
        case 5:
            dayString = "vrijdag"
            break;
        case 6:
            dayString = "zaterdag"
            break;
    }
    return dayString
}
const kiesTijd = (day) => {
    //hier krijgt de student de keuze welke uren hij/zij wil
    const startSelect = document.createElement("select")
    const eindeSelect = document.createElement("select")
    const flexBtn = document.createElement("button")

    
}
const fill_Beschikbaarheid = () => {
    //eerst den maand
    const datum = new Date
    console.log(datum)
    //roster me buttns 7*3 of 4
    const thisYear = datum.getFullYear()
    const thisMonth = datum.getMonth()
    const aDagen = getDaysInMonth(thisMonth, thisYear)
    console.log(aDagen)

    for (let i = 0; i < aDagen.length; i++) {
        const btn = document.createElement("button")
        btn.textContent = getDayMaBeter(aDagen[i].getDay()) + "\r\n"
        btn.textContent += aDagen[i].getDate()
        inhoud_container.append(btn)
        btn.addEventListener("click", (kiesTijd(getDayMaBeter(aDagen[i].getDay()))))
    }
}
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