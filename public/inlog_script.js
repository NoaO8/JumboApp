//de divs ophalen
const header_container = document.querySelector(".header_container")
const inhoud_container = document.querySelector(".inhoud_container")

//containers fillen
const fill_header_container = () => {
    const login_header = document.createElement("h1")
    login_header.textContent = "Login"
    header_container.appendChild(login_header)
}
const fill_inhoud_container = () => {
    const username_input = document.createElement("input")
    username_input.placeholder = "Vul hier uw gebruikersnaam in"
    username_input.id = "username_input"
    const password_input = document.createElement("input")
    password_input.placeholder = "Vul hier uw wachtwoord in"
    password_input.id = "password_input"
    const login_button = document.createElement("button")
    login_button.textContent = "Login"
    login_button.id = "login_button"

    inhoud_container.append(username_input, password_input, login_button) //append is goe om meer dan 1 ding doortesturen
}

//fills oproepen
fill_header_container()
fill_inhoud_container()