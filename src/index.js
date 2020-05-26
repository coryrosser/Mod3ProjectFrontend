const USERS_URL = "http://localhost:3000/users"

const windowStorage = window.localStorage

let current_user = () => {
    //Once logged in a users object is set in local storage by using JSON.stringify
    // this function retrives that user and parses it to convert back to obj form
    //using this function should always return an object that can be used as any other.
    //eg. current_user().first_name >> "Cory", "Joey" etc

    //see onLoginSubmit for how the obj is stored
    let userData = {
        user: JSON.parse(windowStorage.getItem('user')),
        items: JSON.parse(windowStorage.getItem('items'))
    }
    return userData
}


let homeScreen = () => {
    console.log("at home :)")
    let mainParentDiv = document.getElementById("page-content");
    mainParentDiv.innerHTML = "";
    let welcomeMessage = document.createElement("h1");
    welcomeMessage.innerText = "ToneDeaf Traders";
    welcomeMessage.setAttribute("id", "welcome-message");
    mainParentDiv.appendChild(welcomeMessage)
        //nav-bar 
    let navbarDiv = document.getElementById('nav-div')
    navbarDiv.innerHTML = ""
        //adds nav element. takes in parent node, nav name, nav id, callback for event
    addNavElement(navbarDiv, "Home", "nav-item-home", homeScreen)
    addNavElement(navbarDiv, "Listings", "nav-item-listings", getListings)
    addNavElement(navbarDiv, "Login", "nav-item-login", getLoginForm)


}

function addNavElement(parent, elementName, elementId, callback) {
    let newElement = document.createElement("a");
    newElement.innerText = elementName;
    newElement.href = `#${elementName}`;
    newElement.setAttribute("id", elementId);
    newElement.setAttribute("class", "item");
    newElement.addEventListener("click", callback)
    parent.appendChild(newElement);

}

function getListings() {
    let mainParentDiv = document.getElementById("page-content");
    mainParentDiv.innerHTML = "";
    //using items url for now. will change when we have listings
    let listingsUrl = "http://localhost:3000/items"
    fetch(listingsUrl)
        .then(res => res.json())
        .then(itemData => {  
            renderItems(itemData)
    })
}   

        .then(itemData => {
            console.log(itemData.map((item) => item.user))
            renderItems(itemData)
        })
}
//for development purposes
function renderItems(itemData) {
    let mainParentDiv = document.getElementById("page-content");
    let itemUl = document.createElement("ul")
    mainParentDiv.appendChild(itemUl)
    itemData.map((item) => {
        let itemLi = document.createElement("li")
        itemLi.innerText = `${item.brand}: ${item.model} Trade Rating: ${item.trade_rating}`
        let tradeBtn = document.createElement("button")
        tradeBtn.innerHTML = "Trade!"
        itemLi.appendChild(tradeBtn)
        tradeBtn.addEventListener("click", () => onTradeStart(item));
        itemUl.appendChild(itemLi)
    })

        let tradeBtn = document.createElement("button")
        tradeBtn.innerHTML = "Trade!"
        tradeBtn.addEventListener("click", () => onTradeStart(item));

        itemLi.appendChild(tradeBtn)


        itemUl.appendChild(itemLi)
    })
}

}


function onTradeStart(item) {
    console.log(item.user)
    console.log(item)

    console.log(current_user())
    console.log(current_user().items)
  
    let c = confirm("Are you sure you want to trade for this item?")
    if(c !== false) {
        startTrade(item);
    }
 
let tradeStatus = 0;   
    
function startTrade(item, ) {
    debugger;
    let tradee = item.user_id;
    let tradeeItemId = item.id;
}
    
    
    console.log(`${tradee} is the user id number. ${tradeeItemId} is the trader item number`)
    // console.log(item.user_id)
    // console.log(item.brand);
    // console.log(item.id)
}

//Trade Item Start



function getLoginForm() {
    let mainParentDiv = document.getElementById("page-content");
    mainParentDiv.innerHTML = "";
    //form creation 
    let loginForm = document.createElement("form")

    let emailLabel = document.createElement("label")
    emailLabel.htmlFor = "email"
    emailLabel.innerText = "Email: "

    let emailInput = document.createElement("input")
    emailInput.name = "email"
    emailInput.type = "email"
    emailInput.id = "login-email"

    let passwordLabel = document.createElement("label")
    passwordLabel.htmlFor = "password"
    passwordLabel.innerText = "Password: "

    let passwordInput = document.createElement("input")
    passwordInput.name = "password"
    passwordInput.type = "password"
    passwordInput.id = "login-password"

    let submitBtn = document.createElement('button')
    submitBtn.innerHTML = "Login"
    submitBtn.type = "submit"

    loginForm.appendChild(emailLabel)
    loginForm.appendChild(emailInput)
    loginForm.appendChild(passwordLabel)
    loginForm.appendChild(passwordInput)
    loginForm.appendChild(submitBtn)

    addLoginEvent(loginForm)
    mainParentDiv.appendChild(loginForm)
}

function addLoginEvent(target) {
    target.addEventListener("submit", onLoginSubmit)

}

function onLoginSubmit(event) {
    //login submit sends a POST to sessions controller with email and pw from login form
    //session controller verifies a user with that email exists and pw is correct
    //if correct, sends back the user object and sets current_user to the corresponding
    //user
    let email = document.getElementById("login-email").value
    let pw = document.getElementById("login-password").value
    fetch("http://localhost:3000/login", {
            method: 'POST',
            mode: 'cors',
            credentials: 'same-origin',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                email,
                pw
            })
        })
        .then(res => res.json())
        .then(res => {
            if (res.code == 200) {
                //if credentials match up, 
                //we use local storage to store the user Object in string form
                //and redirect to user profile
                //added storing current_user's items in localstorage as well
                windowStorage.clear()
                showUserProfile(res)
                console.log(res)
                windowStorage.setItem('user', JSON.stringify(res.user))
                windowStorage.setItem('items', JSON.stringify(res.items))
            } else {
                alert("Invalid Credentials")
            }

        })
    event.preventDefault()
}

function showUserProfile(user) {
    let mainParentDiv = document.getElementById("page-content")
    mainParentDiv.innerHTML = ""

    let userInfoCard = document.createElement("div")
    userInfoCard.innerHTML = `<h1>${user.first_name} ${user.last_name}</h1>`
}


//fetch and render users
function fetchUsers(url) {
    fetch(url)
        .then(res => res.json())
        .then((userData) => {
            console.log(userData)
            renderUsers(userData);
        })
}

function renderUsers(userData) {
    let main = document.getElementById("content-container")
    let ul = document.createElement("user_ul")
    main.appendChild(ul)

    userData.map((user) => {
        createUserli(user, ul)
    })
}
//==========

function createUserli(user, parentNode) {
    let userLi = document.createElement("li")
    userLi.innerText = user.first_name
    parentNode.appendChild(userLi)
}


homeScreen();