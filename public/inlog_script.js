//de divs ophalen
const header_container = document.querySelector(".header_container")
const inhoud_container = document.querySelector(".inhoud_container")
//DOM elementen die je globaal nodig hebt
const login_button = document.createElement("button")
const username_input = document.createElement("input")
const password_input = document.createElement("input")
//containers fillen
const fill_header_container = () => {
    const login_header = document.createElement("h1")
    login_header.textContent = "Login"
    header_container.appendChild(login_header)
}
const fill_inhoud_container = () => {
    username_input.placeholder = "Vul hier uw gebruikersnaam in"
    username_input.id = "username_input"
    password_input.placeholder = "Vul hier uw wachtwoord in"
    password_input.id = "password_input"
    password_input.type = "password"
    login_button.textContent = "Login"
    login_button.id = "login_button"

    inhoud_container.append(username_input, password_input, login_button) //append is goe om meer dan 1 ding doortesturen
}
login_button.addEventListener("click", () => {
    const username = username_input.value.trim()
    const password = password_input.value.trim()
    //trim, want perongeluk een spatie opt einde is boeeeeeee!

    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => console.log(data))
})

//fills oproepen
fill_header_container()
fill_inhoud_container()