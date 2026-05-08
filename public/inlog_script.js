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
    //input group wrapper
    const group = document.createElement("div")
    group.className = "input-group"

    const label = document.createElement("label")
    label.className = "input-label"
    label.textContent = "Geboortedatum"

    const wrapper = document.createElement("div")
    wrapper.className = "input-wrapper"

    geboorteDatumInput.type = "date"
    geboorteDatumInput.id = "geboortedatum"
    
    wrapper.appendChild(geboorteDatumInput)
    group.appendChild(label)
    group.appendChild(wrapper)

    login_button.textContent = "Inloggen"
    login_button.className = "Inlog_btn"

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
