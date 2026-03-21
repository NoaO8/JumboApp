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
    const username_label = document.createElement("label")
    
}

//fills oproepen
fill_header_container()
fill_inhoud_container()