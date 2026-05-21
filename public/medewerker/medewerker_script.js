
const header_container = document.querySelector(".header_container")
const nav_container = document.querySelector(".nav_container")
const inhoud_container = document.querySelector(".inhoud_container")
const tijd_container = document.querySelector(".tijd_container")

const maanden = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"]
const dagen = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"]
let geselcteerde_dagen = []
let originele_info = []
let aangepaste_info = []

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

    /*const logoBox = document.createElement("div")
    logoBox.className = "logo-box"*/

    const title = document.createElement("h2")
    title.textContent = "Jumbo Planner"
    title.className = "geel"

    const subtitle = document.createElement("p")
    subtitle.textContent = "Welkom!"
    subtitle.className = "geel"

    //logoBox.append(title, subtitle)
    nav_container.appendChild(title, subtitle)

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
    post_datums()

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
        if (is_flex) {
            flexBtn.style.background = "#FDC100"
        } else {
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

    startSelect.addEventListener("change", () => {
        is_flex = false
        flexBtn.style.background = "#F4F4F4"
    })
    eindeSelect.addEventListener("change", () => {
        is_flex = false
        flexBtn.style.background = "#F4F4F4"
    })

    row.append(startSelect, eindeSelect)

    const opslaanBtn = document.createElement("button")
    opslaanBtn.textContent = "Opslaan"
    opslaanBtn.className = "primary-btn"
    opslaanBtn.onclick = () => {
        //post_datums()
        const start_uur = startSelect.value
        const eind_uur = eindeSelect.value

        const volledige_start = new Date(day)
        const volledige_einde = new Date(day)

        if (!is_flex && parseInt(start_uur) >= parseInt(eind_uur)) {
            alert("je kan geen startuur na uw einduur hebben")
            return
        }
        if (is_flex) {
            volledige_start.setHours(6, 0, 0, 0)
            volledige_einde.setHours(21, 0, 0, 0)
        } else {
            volledige_start.setHours(start_uur, 0, 0, 0)
            volledige_einde.setHours(eind_uur, 0, 0, 0)
        }
        console.log(volledige_start)
        const dag = {
            start: volledige_start,
            eind: volledige_einde
        }
        //zorgen daje nie later start dan stopt
        const alBestaand = geselcteerde_dagen.some(d =>
            d.start.toDateString() === volledige_start.toDateString()
        )

        if (!alBestaand) {
            geselcteerde_dagen.push(dag)
            console.log(geselcteerde_dagen)
        }
        tijd_container.innerHTML = ""
        post_datums()
    }
    card.append(title, datumLabel, flexBtn, row, opslaanBtn)
    tijd_container.appendChild(card)
}
//gelijkaarde card erbij da de opgeslagn shifts toont + kans om te posten
const post_datums = () => {
    const card = document.createElement("div")
    card.className = "time-card"

    const title = document.createElement("h3")
    title.textContent = "Verstuur beschikbaarheid"

    // error div
    const errorMsg = document.createElement("p")
    errorMsg.style.color = "red"
    errorMsg.style.fontSize = "0.85rem"
    errorMsg.style.marginTop = "8px"
    errorMsg.style.display = "none"

    // geselecteerde dagen tonen
    const dagenLijst = document.createElement("div")
    dagenLijst.style.marginTop = "12px"
    dagenLijst.style.display = "flex"
    dagenLijst.style.flexDirection = "column"
    dagenLijst.style.gap = "6px"

    if (geselcteerde_dagen.length === 0) {
        const leeg = document.createElement("p")
        leeg.textContent = "Nog geen dagen geselecteerd"
        leeg.style.color = "#888"
        leeg.style.fontSize = "0.85rem"
        dagenLijst.appendChild(leeg)
    } else {
        geselcteerde_dagen.forEach(dag => {
            const item = document.createElement("div")
            item.style.background = "#f4f4f4"
            item.style.borderRadius = "8px"
            item.style.padding = "8px 12px"
            item.style.fontSize = "0.85rem"

            const start = new Date(dag.start)
            const eind = new Date(dag.eind)
            const datumStr = start.toLocaleDateString("nl-BE", { weekday: "short", day: "numeric", month: "short" })
            const flex = start.getHours() === 6 && eind.getHours() === 21

            item.textContent = `${datumStr} — ${flex ? "Flexibel" : `${start.getHours()}:00 - ${eind.getHours()}:00`}`
            dagenLijst.appendChild(item)
        })
    }

    const verstuur_button = document.createElement("button")
    verstuur_button.className = "primary-btn"
    verstuur_button.textContent = "Verstuur beschikbaarheid"
    verstuur_button.addEventListener("click", () => {
        // validatie: geen dagen geselecteerd
        if (geselcteerde_dagen.length === 0) {
            errorMsg.textContent = "Selecteer minstens één dag voor je verstuurt."
            errorMsg.style.display = "block"
            return
        }

        errorMsg.style.display = "none"

        fetch('/beschikbaarheid_opslaan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: localStorage.getItem('user_id'),
                gekozen_shifts: geselcteerde_dagen
            })
        })
            .then(res => {
                if (!res.ok) throw new Error("Serverfout")
                alert("Shifts verstuurd!")
                fill_Beschikbaarheid()
            })
            .catch(() => {
                errorMsg.textContent = "Er ging iets mis, probeer opnieuw."
                errorMsg.style.display = "block"
            })
    })

    card.append(title, dagenLijst, verstuur_button, errorMsg)
    tijd_container.append(card)
}
const fill_Beschikbaarheid = () => {
    inhoud_container.innerHTML = ""
    tijd_container.innerHTML = ""

    Promise.all([
        fetch('/shifts', { headers: { 'Authorization': localStorage.getItem('token') } }).then(r => r.json()),
        fetch('/availability', { headers: { 'Authorization': localStorage.getItem('token') } }).then(r => r.json())
    ]).then(([shifts, availability]) => {
        build_kalender(shifts, availability)
    }).catch(() => {
        build_kalender([], [])
    })
}
const fetch_berichten = () => {
    fetch('/berichten', {
        headers: {
            'Authorization': localStorage.getItem('token')
        }
    })
        .then(res => res.json())
        .then(data => fill_Berichten(data))
}
const build_kalender = (shifts, availability) => {
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

    // legenda
    const legenda = document.createElement("div")
    legenda.style.display = "flex"
    legenda.style.gap = "12px"
    legenda.style.fontSize = "0.75rem"
    legenda.style.marginTop = "8px"

    const legItems = [
        { kleur: "#FDC100", label: "Shift" },
        { kleur: "#4CAF50", label: "Beschikbaar" }
    ]
    legItems.forEach(({ kleur, label }) => {
        const item = document.createElement("div")
        item.style.display = "flex"
        item.style.alignItems = "center"
        item.style.gap = "4px"

        const dot = document.createElement("div")
        dot.style.width = "10px"
        dot.style.height = "10px"
        dot.style.borderRadius = "50%"
        dot.style.background = kleur

        const tekst = document.createElement("span")
        tekst.textContent = label

        item.append(dot, tekst)
        legenda.appendChild(item)
    })

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

    for (let i = 0; i < offset; i++) {
        const empty = document.createElement("div")
        grid.appendChild(empty)
    }

    days.forEach(dag => {
        const cell = document.createElement("div")
        cell.className = "day-cell"

        const num = document.createElement("div")
        num.className = "day-number"
        num.textContent = dag.getDate()

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        dag.setHours(0, 0, 0, 0)

        if (dag < today) {
            cell.style.backgroundColor = "lightgray"
        }

        // shift op deze dag?
        const heeftShift = shifts.some(s =>
            new Date(s.start_dateTime).toDateString() === dag.toDateString()
        )
        // availability op deze dag?
        const heeftAvailability = availability.some(a =>
            new Date(a.start_dateTime).toDateString() === dag.toDateString()
        )

        if (heeftShift) {
            cell.style.backgroundColor = "#FDC100"
            cell.title = "Je hebt een shift"

            const shiftData = shifts.find(s =>
                new Date(s.start_dateTime).toDateString() === dag.toDateString()
            )
            const tijdLabel = document.createElement("div")
            tijdLabel.style.fontSize = "0.6rem"
            tijdLabel.style.marginTop = "2px"
            const start = new Date(shiftData.start_dateTime)
            const eind = new Date(shiftData.end_dateTime)
            tijdLabel.textContent = `${start.getHours()}:00 - ${eind.getHours()}:00`
            cell.appendChild(tijdLabel)

        } else if (heeftAvailability) {
            cell.style.backgroundColor = "#4CAF50"
            cell.style.color = "white"
            cell.title = "Je bent beschikbaar"

            const availData = availability.find(a =>
                new Date(a.start_dateTime).toDateString() === dag.toDateString()
            )
            const tijdLabel = document.createElement("div")
            tijdLabel.style.fontSize = "0.6rem"
            tijdLabel.style.marginTop = "2px"
            const start = new Date(availData.start_dateTime)
            const eind = new Date(availData.end_dateTime)
            const flex = start.getHours() === 6 && eind.getHours() === 21
            tijdLabel.textContent = flex ? "Flexibel" : `${start.getHours()}:00 - ${eind.getHours()}:00`
            cell.appendChild(tijdLabel)
        }

        cell.appendChild(num)

        cell.addEventListener("click", () => {
            if (dag < today) return
            selectedDay = dag
            kiesTijd(dag)
            document.querySelectorAll(".day-cell").forEach(c => c.classList.remove("active"))
            cell.classList.add("active")
        })

        grid.appendChild(cell)
    })

    card.append(header, legenda, weekRow, grid)
    inhoud_container.appendChild(card)
    post_datums()
}
const fill_Berichten = (data) => {
    console.log(data)
    inhoud_container.innerHTML = ""
    tijd_container.innerHTML = ""

    const card = document.createElement("div")
    card.className = "card"

    const header = document.createElement("div")
    header.style.textAlign = "center"

    const titel = document.createElement("h2")
    titel.textContent = "Berichten"
    header.appendChild(titel)

    const chatBox = document.createElement("div")
    chatBox.style.display = "flex"
    chatBox.style.flexDirection = "column"
    chatBox.style.gap = "8px"
    chatBox.style.marginTop = "12px"
    chatBox.style.maxHeight = "400px"
    chatBox.style.overflowY = "auto"
    chatBox.style.padding = "8px"

    if (data.length === 0) {
        const leeg = document.createElement("p")
        leeg.textContent = "Nog geen berichten"
        leeg.style.color = "#888"
        leeg.style.fontSize = "0.85rem"
        chatBox.appendChild(leeg)
    } else {
        const mijn_id = parseInt(localStorage.getItem("user_id"))

        data.forEach(bericht => {
            const bubble = document.createElement("div")
            const isMijne = bericht.sender_id === mijn_id

            bubble.style.maxWidth = "75%"
            bubble.style.padding = "10px 14px"
            bubble.style.borderRadius = "16px"
            bubble.style.fontSize = "0.9rem"
            bubble.style.lineHeight = "1.4"
            bubble.style.alignSelf = isMijne ? "flex-end" : "flex-start"
            bubble.style.background = isMijne ? "#FDC100" : "#F4F4F4"
            bubble.style.color = "#222"

            const tekst = document.createElement("p")
            tekst.textContent = bericht.content
            tekst.style.margin = "0"

            const tijd = document.createElement("span")
            const datum = new Date(bericht.sent_at)
            tijd.textContent = datum.toLocaleString("nl-BE", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
            })
            tijd.style.fontSize = "0.7rem"
            tijd.style.color = isMijne ? "#a07800" : "#888"
            tijd.style.display = "block"
            tijd.style.marginTop = "4px"
            tijd.style.textAlign = isMijne ? "right" : "left"

            bubble.append(tekst, tijd)
            chatBox.appendChild(bubble)
        })
    }

    // scroll automatisch naar beneden
    chatBox.scrollTop = chatBox.scrollHeight

    // nieuw bericht sturen
    const inputRow = document.createElement("div")
    inputRow.style.display = "flex"
    inputRow.style.gap = "8px"
    inputRow.style.marginTop = "12px"


    const input = document.createElement("input")
    input.placeholder = "Typ een bericht..."
    input.style.flex = "1"
    input.style.padding = "12px"
    input.style.borderRadius = "10px"
    input.style.border = "1px solid #ddd"
    input.style.minWidth = "0"

    const verstuurBtn = document.createElement("button")
    verstuurBtn.textContent = "Stuur"
    verstuurBtn.className = "primary-btn"
    verstuurBtn.style.width = "auto"
    verstuurBtn.style.flexShrink = "0"
    verstuurBtn.style.whiteSpace = "nowrap"

    verstuurBtn.addEventListener("click", () => {
        const inhoud = input.value.trim()
        if (!inhoud) return

        fetch('/bericht_sturen', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({ content: inhoud })
        })
            .then(res => {
                if (!res.ok) throw new Error("Serverfout")
                input.value = ""
                fetch_berichten() // herladen na versturen
            })
            .catch(() => alert("Er ging iets mis, probeer opnieuw."))
    })

    // ook sturen met Enter
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") verstuurBtn.click()
    })

    inputRow.append(input, verstuurBtn)
    card.append(header, chatBox, inputRow)
    inhoud_container.appendChild(card)
}
const fetch_profiel_info = () => {
    fetch('/profiel', {
        headers: {
            'Authorization': localStorage.getItem('token')
        }
    })
        .then(res => res.json())
        .then(data => {
            console.log("ontvangen data:", data)
            fill_Profiel(data)
        })
}

const maak_veld = (label, placeholder, value) => {
    const wrapper = document.createElement("div")
    wrapper.style.marginTop = "10px"

    const titel = document.createElement("label")
    titel.textContent = label
    titel.style.fontSize = "0.85rem"
    titel.style.color = "#666"

    const input = document.createElement("input")
    input.placeholder = placeholder
    input.value = value
    input.style.display = "block"
    input.style.width = "100%"
    input.style.marginTop = "4px"
    input.style.padding = "12px"
    input.style.borderRadius = "10px"
    input.style.border = "1px solid #ddd"

    wrapper.append(titel, input)
    return { wrapper, input }
}
const fill_Profiel = (data) => {
    inhoud_container.innerHTML = ""
    tijd_container.innerHTML = ""
    originele_info = []
    aangepaste_info = []

    console.log(data)
    let user_naam = ""
    let user_email = ""
    let user_telefoon = ""

    data.forEach(user => {
        user_naam = `${user.first_name} ${user.last_name}`
        user_email = user.email
        user_telefoon = user.telefoonnummer
    });
    originele_info = [user_naam, user_email, user_telefoon]

    const card = document.createElement("div")
    card.className = "card"

    const header = document.createElement("div")
    header.style.textAlign = "center"

    const avatar = document.createElement("div")
    avatar.textContent = "👤"
    avatar.style.fontSize = "3rem"

    const naamTitel = document.createElement("h2")
    naamTitel.textContent = "Jouw profiel"

    header.append(avatar, naamTitel)

    const { wrapper: naamWrapper, input: naam } = maak_veld("Naam", "Naam", user_naam)
    const { wrapper: emailWrapper, input: email } = maak_veld("Email", "Email", user_email)
    const { wrapper: telWrapper, input: tel } = maak_veld("Telefoon", "Telefoon", user_telefoon)

    const save = document.createElement("button")
    save.textContent = "Opslaan"

    const logout = document.createElement("button")
    logout.textContent = "Uitloggen"
    logout.style.background = "#eee"

    save.style.marginTop = "16px"
    logout.style.marginTop = "8px"

    logout.addEventListener("click", () => {
        localStorage.removeItem("token")
        window.location.href = "/inlog.html"
    })
    save.addEventListener("click", () => {
        if (naam.value !== user_naam) aangepaste_info.push({ veld: "naam", waarde: naam.value })
        if (email.value !== user_email) aangepaste_info.push({ veld: "email", waarde: email.value })
        if (tel.value !== user_telefoon) aangepaste_info.push({ veld: "telefoon", waarde: tel.value })

        if (aangepaste_info.length === 0) {
            alert("geen nieuwe data")
            return
        }

        fetch('/profiel_wijziging_opslaan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: localStorage.getItem('user_id'),
                aangepaste_info: aangepaste_info
            })
        })
            .then(() => {
                alert("wijziging opgeslaan")
            })
    })
    card.append(header, naamWrapper, emailWrapper, telWrapper, save, logout)
    inhoud_container.appendChild(card)
}
const fill_inhoud_container = (keuze) => {
    switch (keuze) {
        case "Beschikbaarheid":
            fill_Beschikbaarheid()
            break
        case "Berichten":
            fetch_berichten()
            break
        case "Profiel":
            fetch_profiel_info()
            break
    }
}

fill_nav_container()
fill_header_container("Beschikbaarheid")
fill_inhoud_container("Beschikbaarheid")