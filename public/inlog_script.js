const header_container = document.querySelector(".header_container")
const inhoud_container = document.querySelector(".inhoud_container")
const errorMsg = document.getElementById("error-msg")

const login_button = document.createElement("button")
const geboorteDatumInput = document.createElement("input")

const fill_header_container = () => {
    const login_header = document.createElement("h1")
    login_header.textContent = "Inloggen"
    const sub = document.createElement("p")
    sub.textContent = "Vul je geboortedatum in om verder te gaan"
    header_container.appendChild(login_header)
    header_container.appendChild(sub)
}

const fill_inhoud_container = () => {
    // Input group wrapper
    const group = document.createElement("div")
    group.className = "input-group"

    const label = document.createElement("label")
    label.className = "input-label"
    label.textContent = "Geboortedatum"

    const wrapper = document.createElement("div")
    wrapper.className = "input-wrapper"

    // Kalender icoon
    const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    iconSvg.setAttribute("viewBox", "0 0 24 24")
    iconSvg.setAttribute("fill", "none")
    iconSvg.setAttribute("stroke", "currentColor")
    iconSvg.setAttribute("stroke-width", "2")
    iconSvg.setAttribute("stroke-linecap", "round")
    iconSvg.setAttribute("stroke-linejoin", "round")
    iconSvg.innerHTML = `
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
            `

    geboorteDatumInput.type = "date"
    geboorteDatumInput.id = "geboortedatum"

    wrapper.appendChild(iconSvg)
    wrapper.appendChild(geboorteDatumInput)
    group.appendChild(label)
    group.appendChild(wrapper)

    login_button.textContent = "Inloggen"

    inhoud_container.append(group, login_button)
}

login_button.addEventListener("click", async () => {
    const geboorteDatum = geboorteDatumInput.value
    errorMsg.classList.remove("visible")

    if (!geboorteDatum) {
        errorMsg.textContent = "Kies eerst je geboortedatum."
        errorMsg.classList.add("visible")
        return
    }

    try {
        const res = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ geboorteDatum })
        })
        const data = await res.json()

        if (data.token) {
            localStorage.setItem("token", data.token)
            if (data.role === "medewerker") {
                window.location.href = "medewerker/medewerker.html"
            } else {
                window.location.href = "leidinggevende/beheerder.html"
            }
        } else {
            errorMsg.textContent = "Ongeldige geboortedatum. Probeer het opnieuw."
            errorMsg.classList.add("visible")
        }
    } catch (err) {
        errorMsg.textContent = "Verbindingsfout. Probeer het later opnieuw."
        errorMsg.classList.add("visible")
    }
})

fill_header_container()
fill_inhoud_container()
