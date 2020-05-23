document.addEventListener("DOMContentLoaded", () => {
    const USERS_URL = "http://localhost:3000/users"
    fetchUsers(USERS_URL);
})

function fetchUsers(url) {
    fetch(url)
        .then(res => res.json())
        .then((userData) => {
            console.log(userData)
            renderUsers(userData);
        })
}

function renderUsers(userData) {
    let ul = document.getElementById("user_ul")

    userData.map((user) => {
        createUserli(user, ul)
    })
}

function createUserli(user, parentNode) {
    let userLi = document.createElement("li")
    userLi.innerText = user.first_name
    parentNode.appendChild(userLi)
}