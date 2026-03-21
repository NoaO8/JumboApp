//containers ophalen om te vullen bij opstart
const header_container = document.querySelector(".header_container")
const nav_container = document.querySelector(".nav_container")
const inhoud_container = document.querySelector(".inhoud_container")
//globale DOM variabelen
const btn_go_planner = document.createElement("button")
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

    btn_go_planner.textContent = "Mijn Planner"
    btn_go_beschikbaarheid.textContent = "Beschikbaarheid"
    btn_go_berichten.textContent = "Berichten"
    btn_go_profiel.textContent = "Profiel"

    btn_go_planner.id = "Mijn Planner"
    btn_go_beschikbaarheid.id = "Beschikbaarheid"
    btn_go_berichten.id = "Berichten"
    btn_go_profiel.id = "Profiel"

    nav_container.append(nav_header, nav_header2, btn_go_planner, btn_go_beschikbaarheid, btn_go_berichten, btn_go_profiel)
}
const fill_inhoud_container = (welke_inhoud = "Mijn Planner") => {
    //ook eerst nav afmaken
    //eerst moetn we weten ofda wie da is ingelogt
    //console.log(welke_inhoud)
    switch (welke_inhoud) {
        case "Mijn Planner":
            console.log(welke_inhoud);
            //hier komt alles vo mn planner en per case zovoort
            break;
        case "Beschikbaarheid":
            console.log(welke_inhoud)
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
btn_go_planner.addEventListener("click", () => {
    fill_header_container(btn_go_planner.id)
    fill_inhoud_container(btn_go_planner.id)
})
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
fill_inhoud_container()