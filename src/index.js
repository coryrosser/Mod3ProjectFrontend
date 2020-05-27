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
    if (current_user().user) {
        addNavElement(navbarDiv, "Profile", "nav-item-profile", () => showUserProfile(current_user().user.id))
    }


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
}

function onTradeStart(item) {
    let c = confirm("Are you sure you want to trade for this item?")
    if (c !== false) {
        startTrade(item);
    }
}

let tradeStatus = 0;

function startTrade(item) {
    let parentDiv = document.getElementById("page-content")
    parentDiv.innerText = ""
    let itemUl = document.createElement("ul")
    let eligibleItems = []
    let tradee = item.user.id
    let tradee_item_id = item.id
    let tradee_rating = item.trade_rating
    let trader = current_user().user.id
    let trader_items = current_user().items
    trader_items.map((tradeItems) => {
        let diff = Math.abs(tradee_rating - tradeItems.trade_rating)
        if (diff >= 20) {
            console.log("Trade not allowed")
        } else {
            let itemLi = document.createElement("li")
            itemLi.innerText = `${tradeItems.brand}: ${tradeItems.model} Trade Rating: ${tradeItems.trade_rating}`
            let tradeBtn = document.createElement("button")
            tradeBtn.innerHTML = "Trade!"
            itemLi.appendChild(tradeBtn)
            tradeBtn.addEventListener("click", () => makeTrade(tradee, tradee_item_id, trader, tradeItems.id));
            itemUl.appendChild(itemLi)
            eligibleItems.push(tradeItems)

        }
    })
    parentDiv.appendChild(itemUl)

}

function makeTrade(tradee, tradee_item_id, trader, tradeItems) {
    // debugger;
    fetch("http://localhost:3000/trades", {
            method: 'POST',
            mode: 'cors',
            credentials: 'same-origin',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                tradee_id: tradee,
                tradee_item_id: tradee_item_id,
                trader_id: trader,
                trader_item_id: tradeItems
            })
        })
        .then(res => res.json())
        .then(res => console.log(res))
}



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

                console.log(res)
                windowStorage.setItem('user', JSON.stringify(res.user))
                windowStorage.setItem('items', JSON.stringify(res.items))
                showUserProfile(res.user.id)
            } else {
                alert("Invalid Credentials")
            }

        })
    event.preventDefault()
}

function showUserProfile(user_id) {

    let mainParentDiv = document.getElementById("page-content")
    mainParentDiv.innerHTML = ""
    fetchSingleUser(user_id, mainParentDiv)
}

function createUserCard(user, parent) {
    console.log(user)
    let highestRatedItem = Math.max(user.items.map((item) => item.trade_rating))

    parent.innerHTML = `
	<div class="container emp-profile">
            <form method="post">
                <div class="row">
                    <div class="col-md-4">
                        <div class="profile-img">
                            <div class="file btn btn-lg btn-primary">
                                Change Photo
                                <input type="file" name="file"/>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="profile-head">
                                    <h5>
                                        ${user.first_name} ${user.last_name} 
                                    </h5>
                                    <h6>
                                        Member Since: ${new Date(user.created_at.replace(' ', 'T'))}
                                    </h6>
                                    <p class="proile-rating">Current Items Listed: <span>${user.items.length}</span></p>
                            <ul class="nav nav-tabs" id="myTab" role="tablist">
                                <li class="nav-item">
                                    <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">About</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">Items</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-md-2">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4">
                        <div class="profile-work">
                            <p id="view-trade-link">View ${user.first_name}'s Past Trades</p>
                            <a href="">Trade 1</a><br/>
                            <a href="">Trade 1</a><br/>
                            <a href="">Trade 1</a><br/>
                            <a href="">Trade 1</a><br/>
                            <a href="">Trade 1</a><br/>
                            <a href="">Trade 1</a><br/>
                            <a href="">Trade 1</a><br/>
                            <a href="">Trade 1</a><br/>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="tab-content profile-tab" id="myTabContent">
                            <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                                    <div id="user-info-content">
                                    
                                    </div>
                            </div>
                            <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                                    <div id="timeline-content">

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>           
        </div>`
    let timelineDiv = document.getElementById("timeline-content")
    let userInfoDiv = document.querySelector("div .tab-pane")
    user.items.forEach((item) => {
        timelineDiv.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <label>${item.brand} ${item.model}</label>
                </div>
                <div class="col-md-6">
                    <p>Rating: ${item.trade_rating}
                    <button class="btn btn-sm btn-primary"id="propose-trade">Propose A Trade!</button></p>
                    
                </div>
            </div>
            `
    })

    addUserInfo(user, userInfoDiv, "first_name", )
    addUserInfo(user, userInfoDiv, "last_name")
    addUserInfo(user, userInfoDiv, "email")
    addUserInfo(user, userInfoDiv, "location")
}

function addUserInfo(user, parent, key) {
    let infoRow = document.createElement("div")
    infoRow.className = "row"
    let colDiv = document.createElement("div")
    colDiv.className = "col-md-6"
    infoRow.appendChild(colDiv)

    let keyLabel = document.createElement("label")
    keyLabel.innerText = key
    colDiv.appendChild(keyLabel)
    let colDiv2 = document.createElement("div")
    colDiv2.className = "col-md-6"
    colDiv2.id = `${key}_div`

    let pTag = document.createElement("p")
    pTag.innerText = user[key]

    colDiv2.appendChild(pTag)

    let editBtn = document.createElement("a")
    editBtn.className = "ml-2"
    editBtn.innerHTML = `<i class="fa fa-edit"></i>`

    editBtn.addEventListener("click", () => {
        let attrEditForm = document.createElement("form")
        attrEditForm.className = "form-group"
        let attrEditField = document.createElement("input")
        attrEditField.value = user[key]
        attrEditField.className = "form-control col-xs-5"
        let formDiv = document.createElement("div")
        formDiv.className = "row"
        formDiv.appendChild(attrEditField)

        let editSubmitBtn = document.createElement("button")
        editSubmitBtn.className = "btn btn-sm btn-success"
        editSubmitBtn.innerText = "Confirm"
        editSubmitBtn.type = "submit"
        formDiv.appendChild(editSubmitBtn)
        attrEditForm.appendChild(formDiv)
        colDiv2.innerHTML = ""
        colDiv2.appendChild(attrEditForm)
        attrEditForm.addEventListener("submit", (e) => {
            let newValue = attrEditField.value
            editUserAttribute(user, key, newValue, infoRow)
            e.preventDefault()
        })
    })
    pTag.appendChild(editBtn)

    infoRow.appendChild(colDiv2)
    parent.appendChild(infoRow)
}

function editUserAttribute(user, key, newValue, parent) {
    fetch(`${USERS_URL}/${user.id}`, {
            method: 'PATCH',
            mode: 'cors',
            credentials: 'same-origin',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                key,
                newValue
            })
        })
        .then(res => res.json())
        .then(userData => {
            let user = userData["user"]
            let val = user[key]
            let infoParent = document.getElementById(`${key}_div`)
            addEditUserInfo(user, infoParent, val)
        })
}

function addEditUserInfo(user, infoParent, value) {
    infoParent.innerHTML = `<p>${value}</p>`

}

function fetchSingleUser(user_id, parent) {
    fetch(`http://localhost:3000/users/${user_id}`)
        .then(res => res.json())
        .then(user => createUserCard(user, parent))
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