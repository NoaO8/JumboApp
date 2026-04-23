//de divs ophalen
const header_container = document.querySelector(".header_container")
const inhoud_container = document.querySelector(".inhoud_container")
//DOM elementen die je globaal nodig hebt
const login_button = document.createElement("button")
const geboorteDatumInput = document.createElement("input")
//const username_input = document.createElement("input")
//const password_input = document.createElement("input")
//containers fillen
const fill_header_container = () => {
    const login_header = document.createElement("h1")
    login_header.textContent = "Login"
    header_container.appendChild(login_header)
}
const fill_inhoud_container = () => {
    geboorteDatumInput.type = "date"
    geboorteDatumInput.placeholder = "DD-MM-YYYY"
    login_button.textContent = "login"
    inhoud_container.append(geboorteDatumInput,login_button)
}
login_button.addEventListener("click", async () =>  {
    const geboorteDatum = geboorteDatumInput.value
    //datum goezeetn en doortsuren
    const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geboorteDatum })
      })

    const data = await res.json()
    console.log(data.token)
    console.log(data.role)
      if (data.token) {
        localStorage.setItem("token", data.token)
        if(data.role === "medewerker") {
            window.location.href = "medewerker/medewerker.html" // van stackoverflow
        }else{
            window.location.href = "leidinggevende/beheerder.html"   
        }
    } else {
        console.error("Login mislukt")
    }
    })

//fills oproepen
fill_header_container()
fill_inhoud_container()