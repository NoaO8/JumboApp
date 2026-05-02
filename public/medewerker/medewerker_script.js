
const header_container = document.querySelector(".header_container")
const nav_container = document.querySelector(".nav_container")
const inhoud_container = document.querySelector(".inhoud_container")
const tijd_container = document.querySelector(".tijd_container")


const maanden = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"]
const dagen = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"]
let geselcteerde_dagen = []

const datum = new Date()
let thisYear = datum.getFullYear()
let thisMonth = datum.getMonth()
let selectedDay = null

let is_flex = true;
/*ZEKER NOG GEBRUIKEN
fetch("/beschikbaarheid_opslaan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                volledige_start,
                volledige_einde
            })
        })
*/
const fill_header_container = (titel = "Mijn Planner") => {
    header_container.innerHTML = ""

    const h1 = document.createElement("h1")
    h1.textContent = titel

    header_container.appendChild(h1)
}
const fill_nav_container = () => {
    nav_container.innerHTML = ""

    const title = document.createElement("h2")
    title.textContent = "Jumbo Planner"

    const subtitle = document.createElement("p")
    subtitle.textContent = "Welkom!"

    nav_container.append(title, subtitle)

    const knoppen = ["Beschikbaarheid", "Berichten", "Profiel"]

    knoppen.forEach(naam => {
        const btn = document.createElement("button")
        btn.textContent = naam

        btn.addEventListener("click", () => {
            fill_header_container(naam)
            fill_inhoud_container(naam)
        })

        nav_container.appendChild(btn)
    })
}
const getDaysInMonth = (month, year) => {
    const days = []
    const date = new Date(year, month, 1)

    while (date.getMonth() === month) {
        days.push(new Date(date))
        date.setDate(date.getDate() + 1)
    }
    return days
}
const kiesTijd = (day) => {
    tijd_container.innerHTML = ""

    const card = document.createElement("div")
    card.className = "time-card"

    const title = document.createElement("h3")
    title.textContent = "Beschikbaarheid instellen"

    const datumLabel = document.createElement("p")
    datumLabel.className = "time-date"
    datumLabel.textContent = day.toLocaleDateString("nl-BE", {
        weekday: "long",
        day: "numeric",
        month: "long"
    })

    const flexBtn = document.createElement("button")
    flexBtn.textContent = "Flexibel"
    flexBtn.className = "flex-btn"

    flexBtn.onclick = () => {
        is_flex = !is_flex
        if(is_flex){
            flexBtn.style.background = "#FDC100"
        }else{
            flexBtn.style.background = "#F4F4F4"
        }
    }

    const row = document.createElement("div")
    row.className = "time-row"

    const startSelect = document.createElement("select")
    const eindeSelect = document.createElement("select")

    for (let i = 6; i <= 21; i++) {
        const opt1 = document.createElement("option")
        opt1.value = i
        opt1.textContent = i + ":00"

        const opt2 = document.createElement("option")
        opt2.value = i
        opt2.textContent = i + ":00"

        startSelect.appendChild(opt1)
        eindeSelect.appendChild(opt2)
    }

    row.append(startSelect, eindeSelect)

    const opslaanBtn = document.createElement("button")
    opslaanBtn.textContent = "Opslaan"
    opslaanBtn.className = "primary-btn"

    opslaanBtn.onclick = () => {
        const start_uur = startSelect.value
        const eind_uur = eindeSelect.value

        const volledige_start = new Date(day)
        const volledige_einde = new Date(day)
        if (is_flex) {
            volledige_start.setHours(6, 0, 0, 0)
            volledige_einde.setHours(21, 0, 0, 0)
        } else {
            volledige_start.setHours(start_uur, 0, 0, 0)
            volledige_einde.setHours(eind_uur, 0, 0, 0)
        }
        console.log(volledige_start)
        geselcteerde_dagen.push({
            start: volledige_start,
            eind: volledige_einde
        })
        console.log(geselcteerde_dagen)
    }

    // ===== CLOSE (optioneel nice UX)
    const closeBtn = document.createElement("button")
    closeBtn.textContent = "Sluiten"
    closeBtn.className = "secondary-btn"

    closeBtn.onclick = () => {
        tijd_container.innerHTML = ""
    }

    card.append(title, datumLabel, flexBtn, row, opslaanBtn, closeBtn)
    tijd_container.appendChild(card)
}
//gelijkaarde card erbij da de opgeslagn shifts toont + kans om te posten

const fill_Beschikbaarheid = () => {
    inhoud_container.innerHTML = ""
    tijd_container.innerHTML = ""

    const card = document.createElement("div")
    card.className = "card"

    const header = document.createElement("div")
    header.style.display = "flex"
    header.style.justifyContent = "space-between"
    header.style.alignItems = "center"

    const btnBack = document.createElement("button")
    const btnForward = document.createElement("button")
    const title = document.createElement("h2")

    btnBack.textContent = "<"
    btnForward.textContent = ">"

    title.textContent = maanden[thisMonth] + " " + thisYear

    btnBack.onclick = () => {
        datum.setMonth(datum.getMonth() - 1)
        thisMonth = datum.getMonth()
        thisYear = datum.getFullYear()
        fill_Beschikbaarheid()
    }

    btnForward.onclick = () => {
        datum.setMonth(datum.getMonth() + 1)
        thisMonth = datum.getMonth()
        thisYear = datum.getFullYear()
        fill_Beschikbaarheid()
    }

    header.append(btnBack, title, btnForward)

    const weekRow = document.createElement("div")
    weekRow.className = "calendar-grid header"

    const dagenKort = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]
    dagenKort.forEach(d => {
        const el = document.createElement("div")
        el.textContent = d
        weekRow.appendChild(el)
    })

    const grid = document.createElement("div")
    grid.className = "calendar-grid"

    const firstDay = new Date(thisYear, thisMonth, 1).getDay()
    const offset = firstDay === 0 ? 6 : firstDay - 1

    const days = getDaysInMonth(thisMonth, thisYear)

    //lege vakjes
    for (let i = 0; i < offset; i++) {
        const empty = document.createElement("div")
        grid.appendChild(empty)
    }

    //echte dagen
    days.forEach(dag => {
        const cell = document.createElement("div")
        cell.className = "day-cell"

        const num = document.createElement("div")
        num.className = "day-number"
        num.textContent = dag.getDate()

        cell.appendChild(num)

        cell.addEventListener("click", () => {
            selectedDay = dag
            kiesTijd(dag)

            document.querySelectorAll(".day-cell").forEach(c => c.classList.remove("active"))
            cell.classList.add("active")
        })

        grid.appendChild(cell)
    })

    card.append(header, weekRow, grid)
    inhoud_container.appendChild(card)
}

const fill_Berichten = () => {
    inhoud_container.innerHTML = ""
    tijd_container.innerHTML = ""

    const card = document.createElement("div")
    card.className = "card"

    const p = document.createElement("p")
    p.textContent = "Nog geen berichten"

    card.appendChild(p)
    inhoud_container.appendChild(card)
}

const fill_Profiel = () => {
    inhoud_container.innerHTML = ""
    tijd_container.innerHTML = ""

    const card = document.createElement("div")
    card.className = "card"

    //EADER
    const header = document.createElement("div")
    header.style.textAlign = "center"

    const avatar = document.createElement("div")
    avatar.textContent = "👤"
    avatar.style.fontSize = "3rem"

    const naamTitel = document.createElement("h2")
    naamTitel.textContent = "Jouw profiel"

    header.append(avatar, naamTitel)

    //INPUTS
    const naam = document.createElement("input")
    naam.placeholder = "Naam"

    const email = document.createElement("input")
    email.placeholder = "Email"

    const tel = document.createElement("input")
    tel.placeholder = "Telefoon"

    const locatie = document.createElement("input")
    locatie.placeholder = "Locatie"

        ;[naam, email, tel, locatie].forEach(inp => {
            inp.style.display = "block"
            inp.style.width = "100%"
            inp.style.marginTop = "10px"
            inp.style.padding = "12px"
            inp.style.borderRadius = "10px"
            inp.style.border = "1px solid #ddd"
        })

    //BUTTONS
    const save = document.createElement("button")
    save.textContent = "Opslaan"

    const logout = document.createElement("button")
    logout.textContent = "Uitloggen"
    logout.style.background = "#eee"

    save.style.marginTop = "16px"
    logout.style.marginTop = "8px"

    logout.onclick = () => {
        localStorage.removeItem("token")
        window.location.href = "/inlog.html"
    }

    card.append(header, naam, email, tel, locatie, save, logout)
    inhoud_container.appendChild(card)
}


const fill_inhoud_container = (keuze) => {
    switch (keuze) {
        case "Beschikbaarheid":
            fill_Beschikbaarheid()
            break
        case "Berichten":
            fill_Berichten()
            break
        case "Profiel":
            fill_Profiel()
            break
    }
}

fill_nav_container()
fill_header_container("Beschikbaarheid")
fill_inhoud_container("Beschikbaarheid")