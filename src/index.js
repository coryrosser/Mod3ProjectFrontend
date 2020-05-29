const USERS_URL = "http://localhost:3000/users"

const windowStorage = window.localStorage

//commented code locations may be a few lines off bc of added comments. if the function isnt right where the comment points it should be close

let current_user = () => {
        //Once logged in a users object is set in local storage by using JSON.stringify
        // this function retrives that user and parses it to convert back to obj form
        //using this function should always return an object that can be used as any other.
        //eg. current_user().first_name >> "Cory", "Joey" etc

        //see onLoginSubmit for how the obj is stored
        //planned to refactor and use integer only here but time was not on my side.
        let userData = {
            user: JSON.parse(windowStorage.getItem('user')),
            items: JSON.parse(windowStorage.getItem('items'))
        }
        return userData
    }
    //this func is ran on page load. only loads landing screen and adds nav elements. can log in or sign up.
let homeScreen = () => {
    console.log("at home :)")
    let pageWrapper = document.getElementById("whole-page-wrapper")
    let mainParentDiv = document.getElementById("page-content");
    mainParentDiv.innerHTML = "";

    let header = document.createElement("header")
    header.className = "masthead text-center text-white"
    header.innerHTML = `<div class="overlay"></div>
    <div class="container">
      <div class="row">
        <div class="col-xl-9 mx-auto">
          <h1 class="mb-5">ToneDeaf Trader</h1>
        </div>
        <div class="col-md-10 col-lg-8 col-xl-7 mx-auto">
          <form>
            <div class="form-row justify-content-center align-items-center text-center">
              <div class="col-12 col-md-9 mb-2 mb-md-0">
                <h3 style = "color: #FFD500;">We can hear you!</h3>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>`
    mainParentDiv.appendChild(header)

    let welcomeMessage = document.createElement("h1");
    welcomeMessage.innerText = "";
    welcomeMessage.setAttribute("id", "welcome-message");
    mainParentDiv.appendChild(welcomeMessage)
        //nav-bar 
    let navbarDiv = document.getElementById('nav-div')
    navbarDiv.innerHTML = ""
        //adds nav element. takes in parent node, nav name, nav id, callback for event look at line 68 for reference
    addNavElement(navbarDiv, "Home", "nav-item-home", homeScreen)
    addNavElement(navbarDiv, "Login", "nav-item-login", getLoginForm)
    addNavElement(navbarDiv, "Sign Up", "nav-item-signup", getSignUpForm)
        //user will only see the links below if logged in. checks to see if localStorage has anything in "user" key
    if (current_user().user) {
        //navOnLogin removes login and sign up nav elements once a user is logged in see line 617
        navOnLogin()
        addNavElement(navbarDiv, "Listings", "nav-item-listings", getListings)
        addNavElement(navbarDiv, "Profile", "nav-item-profile", () => showUserProfile(current_user().user.id))
        addNavElement(navbarDiv, "Item", "nav-item-form", () => getItemForm(current_user().user.id))
        addNavElement(navbarDiv, "Logout", "nav-item-logout", () => userLogout())
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
//user logout is a call back passed into addSavElement for our logout nav. sets localStorage keys to empty screen and calls homeScreen()
function userLogout() {

    windowStorage.setItem("user", "")
    windowStorage.setItem("items", "")
    homeScreen();
}

function getListings() {
    let mainParentDiv = document.getElementById("page-content");
    mainParentDiv.innerHTML = "";
    let overlay = document.createElement("div")
    document.querySelector("body").appendChild(overlay)
    overlay.className = "overlay"
        //fetches all items. Rails includes the user in the response so we have access to that and we render items afterwards directly below
    let listingsUrl = "http://localhost:3000/items"
    fetch(listingsUrl)
        .then(res => res.json())
        .then(itemData => {
            console.log(itemData.map((item) => item.user))
            renderItems(itemData)
                //itemData is an array of all item objects. [{obj1}, {obj2}, ...]
        })
}
//callled right above in render items. takes items and makes a ul/ li to list them.  each item has Brand, Model and trade rating listed as well as the user with a link to their profile
//itemData is an array that we map over to create li elements with a link to the item owners profile and a trade button
function renderItems(itemData) {
    let mainParentDiv = document.getElementById("page-content");
    let itemUl = document.createElement("ul")
    itemUl.className = "list-group"
    mainParentDiv.appendChild(itemUl)

    itemData.map((item) => {
        let itemLi = document.createElement("li")
        itemLi.className = "list-group-item"
        itemLi.innerText = `${item.brand}: ${item.model} Trade Rating: ${item.trade_rating}`
        let tradeBtn = document.createElement("button")
        tradeBtn.innerHTML = "Trade!"
        tradeBtn.className = "btn btn-sm btn-primary ml-5"
        let itemUser = document.createElement("a")
        itemUser.href = "#Profile"
        itemUser.addEventListener("click", () => {
            //check line 727 for showUserProfile()
            //take a wild guess on what his function takes in as a param ;)
            showUserProfile(item.user.id)
        })
        itemUser.className = "ml-2"
        itemUser.innerText = `Owner: ${item.user.first_name} ${item.user.last_name}`
        itemLi.appendChild(itemUser)
        itemLi.appendChild(tradeBtn)
            //check line 298 for onTradeStart()
        tradeBtn.addEventListener("click", () => onTradeStart(item));
        itemUl.appendChild(itemLi)
    })
}

//Item Create
function getItemForm(user_id) {
    //form creation
    let pageWrapper = document.getElementById("whole-page-wrapper")
    let header = document.createElement("header")
    header.className = "masthead text-center text-white"
    header.innerHTML = `<div class="form-overlay"></div>`
    pageWrapper.appendChild(header)
    let mainParentDiv = document.getElementById("page-content");
    mainParentDiv.innerHTML = "";
    let formDiv = document.createElement("div")
    let itemForm = document.createElement("form")

    let brandLabel = document.createElement("label")
    brandLabel.htmlFor = "brand"
    brandLabel.innerText = "Brand: "

    let brandInput = document.createElement("input")
    brandInput.name = "brand"
    brandInput.type = "brand"
    brandInput.id = "brand-field"

    let modelLabel = document.createElement("label")
    modelLabel.htmlFor = "model"
    modelLabel.innerText = "Model: "

    let modelInput = document.createElement("input")
    modelInput.name = "model"
    modelInput.type = "model"
    modelInput.id = "model-field"

    let finLabel = document.createElement("label")
    finLabel.htmlFor = "finish"
    finLabel.innerText = "Finish: "

    let finInput = document.createElement("input")
    finInput.name = "finish"
    finInput.type = "finish"
    finInput.id = "finish-field"

    let descLabel = document.createElement("label")
    descLabel.htmlFor = "desc"
    descLabel.innerText = "Description: "

    let descTextArea = document.createElement("TEXTAREA")
    descTextArea.name = "desc"
    descTextArea.type = "desc"
    descTextArea.id = "desc-field"
        //hidden field for current user id
    let currentUserInput = document.createElement("input")
    currentUserInput.id = "user-hidden-field"
    currentUserInput.setAttribute("type", "hidden")
    currentUserInput.value = user_id

    let condArray = ["Poor", "Used", "Decent", "Great", "Brand New"]
    let condLabel = document.createElement("label")
    condLabel.htmlFor = "cond"
    condLabel.innerText = "Condition: "
    let condList = document.createElement("select")
    condList.id = "cond-list"
        //IMPORTANT: Back-End expects integers for both condition and retail_value. can only 1-5. this drop down only allows user to select within that range
        //we do the same thing down below around line 212
    for (var i = 0; i < condArray.length; i++) {
        var option = document.createElement("option");
        option.value = i + 1;
        option.text = condArray[i];
        condList.appendChild(option);
    }

    let valueArray = ["Under $50", "$50-$200", "$200-$500", "$500-$1500", "Over $1500"]
    let valueLabel = document.createElement("label")
    valueLabel.htmlFor = "value"
    valueLabel.innerText = "Retail Value: "
    let valueList = document.createElement("select")
    valueList.id = "value-list"
    for (var i = 0; i < valueArray.length; i++) {
        var option = document.createElement("option");
        option.value = i + 1;
        option.text = valueArray[i];
        valueList.appendChild(option);
    }

    let itemSubmitBtn = document.createElement('button')
    itemSubmitBtn.innerHTML = "Submit Item"
    itemSubmitBtn.type = "submit"
    brandInput.className = "form-control"
    modelInput.className = "form-control"
    finInput.className = "form-control"
    descTextArea.className = "form-control"
    condList.className = "form-control"
    valueList.className = "form-control"
    itemSubmitBtn.className = "btn btn-primary btn-block mt-3"
    brandLabel.style = "color: #EEEEEE; font-size: 1rem;"
    modelLabel.style = "color: #EEEEEE; font-size: 1rem;"
    finLabel.style = "color: #EEEEEE; font-size: 1rem;"
    descLabel.style = "color: #EEEEEE; font-size: 1rem;"
    condLabel.style = "color: #EEEEEE; font-size: 1rem;"
    valueLabel.style = "color: #EEEEEE; font-size: 1rem;"

    itemForm.appendChild(brandLabel)
    itemForm.appendChild(brandInput)
    itemForm.appendChild(modelLabel)
    itemForm.appendChild(modelInput)
    itemForm.appendChild(finLabel)
    itemForm.appendChild(finInput)
    itemForm.appendChild(descLabel)
    itemForm.appendChild(descTextArea)
    itemForm.appendChild(currentUserInput)
    itemForm.appendChild(condLabel)
    itemForm.appendChild(condList)
    itemForm.appendChild(valueLabel)
    itemForm.appendChild(valueList)
    itemForm.appendChild(itemSubmitBtn)
    formDiv.appendChild(itemForm)

    //addItemEvent() can be found directly below. takes in the target in order to add event listener
    addItemEvent(itemForm)
    formDiv.className = "form-group justify-content-center ml-auto mr-auto"

    itemForm.className = "form-group justify-content-center ml-auto mr-auto"

    mainParentDiv.appendChild(itemForm)
}
//this function adds an event listener to our item form made above
function addItemEvent(target) {
    target.addEventListener("submit", (e) => {
        //item submit directly below
        onItemSubmit()
        e.preventDefault()
    })
}
//sends a POST request to items controller, after item is submitted we return to user profile
function onItemSubmit(e) {
    let brand = document.getElementById("brand-field").value
    let model = document.getElementById("model-field").value
    let finish = document.getElementById("finish-field").value
    let description = document.getElementById("desc-field").value
    let user_id = document.getElementById("user-hidden-field").value
    let condition = document.getElementById("cond-list").value
    let retail_value = document.getElementById("value-list").value

    fetch("http://localhost:3000/items", {
            method: 'POST',
            mode: 'cors',
            credentials: 'same-origin',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                brand,
                model,
                finish,
                description,
                user_id,
                condition,
                retail_value,
            })
        })
        .then(res => res.json())
        .then(res => {
            //show user profile around 726 
            showUserProfile(current_user().user.id)
            console.log(res)
        })

}

//Trade Setup
function onTradeStart(item) {
    //tradestart called in the get listings function around 132
    //checks for user confirmation before starting trade
    let c = confirm("Are you sure you want to trade for this item?")
    if (c !== false) {
        //look below for startTrade
        startTrade(item);
    }
}

let tradeStatus = 0;
//start trade takes in the item we clicked on from listings in order to begin the trade process
//info we have access to here is: tradee_item_id >> we get this from item we clicked on in listings. 
//tradee_id >> user id we have access to bc our listing fetch returns associated user with item
//trader_id >> current_user 
//trader_item_id >> this function will render all current user items. when you select an item, the id will be captured
//all trades set to status: 0 by default which is pending
function startTrade(item) {

    let parentDiv = document.getElementById("page-content")
    parentDiv.innerText = ""
    let itemUl = document.createElement("ul")
    itemUl.className = "list-group"
    let eligibleItems = []
    let tradee = item.user.id
    let tradee_item_id = item.id
    let tradee_rating = item.trade_rating
    let trader = current_user().user.id
    let trader_items = current_user().items
    trader_items.map((tradeItems) => {
        let diff = Math.abs(tradee_rating - tradeItems.trade_rating)
            //we substract the trade rating of the items in order to find the difference and use Math.abs() to return the absolute value
            //if the difference id greater than 20 the item is rendered, however the button to trade is diabled
        if (diff >= 20) {
            let itemLi = document.createElement("li")
            itemLi.className = "list-group-item"
            itemLi.innerText = `${tradeItems.brand}: ${tradeItems.model} Trade Rating: ${tradeItems.trade_rating}`
            let tradeBtn = document.createElement("button")
            tradeBtn.disabled = true
            tradeBtn.className = "btn btn-sm btn-primary ml-5"
            tradeBtn.innerHTML = "Not Able to Trade With This Item"
            itemLi.appendChild(tradeBtn)
            itemUl.appendChild(itemLi)
        } else {
            let itemLi = document.createElement("li")
            itemLi.className = "list-group-item"
            itemLi.innerText = `${tradeItems.brand}: ${tradeItems.model} Trade Rating: ${tradeItems.trade_rating}`
            let tradeBtn = document.createElement("button")
            tradeBtn.className = "btn btn-sm btn-primary ml-5"
            tradeBtn.innerHTML = "Trade!"
            itemLi.appendChild(tradeBtn)
            tradeBtn.addEventListener("click", () => makeTrade(tradee, tradee_item_id, trader, tradeItems.id));
            itemUl.appendChild(itemLi)
            eligibleItems.push(tradeItems)

        }
    })
    parentDiv.appendChild(itemUl)
}

function getTrades(user) {
    //gets all trades and calls retrieveuserinfo, this function is called inside showUserProfile()
    fetch(`http://localhost:3000/trades`)
        .then(res => res.json())
        .then(trades => {
            console.log(trades)
            trades.map((trade) => {
                //map over all trades returned by fetch and calls function
                retrieveUserInfoForTrade(user, trade)

            })
        })
}
//in order to have access to all the users so that we can include their names, we have to fetch them and call renderTradeInfo()
//could possibly rewrite this to do one fetch for all users before we get trades in order to not have to hit database so much. 
function retrieveUserInfoForTrade(user, trade) {
    fetch(`http://localhost:3000/users`)
        .then(res => res.json())
        .then(users => {
            renderTradeInfo(users, trade, user)
        })
}

function renderTradeInfo(users, trade, user) {
    //users: all users in database
    //trade: the individual trade currently being mapped over
    //user: the user who's profile we are viewing this info for
    let tradeList = document.getElementById("panel-body")
    let pendingTrade = document.getElementById("trade-ul")

    if (user.id === trade.tradee_id && trade.status === 0) {
        //if pending trade and waiting on the users approval
        console.log(trade)
        let tradeLi = document.createElement("li")
        tradeLi.style = "background-color: rgb(255,213,0, 0.5);"
        tradeLi.className = "list-group-item"
            //the .find method is an iterator that returns the first item that matches the condition passed in. 
        tradeLi.innerText = ` Pending Trade From: ${users.find(user => user.id  === trade.trader_id).first_name}`
            //only can approve or deny trade if the current user is on their own profile
        if (current_user().user.id == user.id) {
            let btnGroup = document.createElement("div")
            btnGroup.className = "btn-group-sm"

            let approveBtn = document.createElement("button")
            approveBtn.innerText = "Approve"
            approveBtn.className = "btn btn-sm btn-success"
            approveBtn.addEventListener("click", () => {
                tradeLi.remove()
                updateTrade(user, trade, 2)
            })
            let denyBtn = document.createElement("button")
            denyBtn.innerText = "Deny"
            denyBtn.addEventListener("click", () => {
                tradeLi.remove()
                updateTrade(user, trade, 3)
            })
            denyBtn.className = "btn btn-sm btn-danger"
            btnGroup.append(approveBtn, denyBtn)
            tradeLi.appendChild(btnGroup)
        }
        pendingTrade.appendChild(tradeLi)
        tradeList.appendChild(pendingTrade)
    } else if (user.id === trade.tradee_id && trade.status === 2) {
        //if trade is approved and user is the tradee
        console.log(trade)
        let tradeLi = document.createElement("li")
        tradeLi.className = "list-group-item"
        tradeLi.style = "background-color: rgb(82, 199, 115, 0.5);"
            //we use .find a few times bc we want to differentiate between if the user is trader or tradee
        tradeLi.innerText = ` Traded With: ${users.find(user => user.id  === trade.trader_id).first_name}`

        pendingTrade.appendChild(tradeLi)
        tradeList.appendChild(pendingTrade)
    } else if (user.id == trade.trader_id && trade.status == 2) {
        //if trade is pending and user is the trader.
        console.log(trade)
        let tradeLi = document.createElement("li")
        tradeLi.style = "background-color: rgb(82, 199, 115, 0.5);"
        tradeLi.className = "list-group-item"
        tradeLi.innerText = ` Traded With: ${users.find(user => user.id  === trade.tradee_id).first_name}`

        pendingTrade.appendChild(tradeLi)
        tradeList.appendChild(pendingTrade)
    } else if (user.id == trade.trader_id && trade.status == 0) {
        //if trade is pending and wating on another users approval.
        console.log(trade)
        let tradeLi = document.createElement("li")
        tradeLi.style = "background-color: rgb(255,213,0, 0.5);"
        tradeLi.className = "list-group-item"
        tradeLi.innerText = `Trade Awaiting Approval From: ${users.find(user => user.id  === trade.tradee_id).first_name}`
        pendingTrade.appendChild(tradeLi)
        tradeList.appendChild(pendingTrade)

    }

}
//this is called when a user clicks to approve or deny a trade it takes in the user, the specific trade, and the status(set above when a user clicks. 2 for approve, 3 for deny)
function updateTrade(user, trade, status) {
    fetch(`http://localhost:3000/trades/${trade.id}`, {
            method: 'PATCH',
            mode: 'cors',
            credentials: 'same-origin',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({

                status: status
            })
        })
        .then(res => res.json())
        .then(res => {
            console.log(res)
            if (status == 2) {
                //again, we re-render this trade in the user profile after its updated
                retrieveUserInfoForTrade(user, res.trade)
            }
        })

}


function makeTrade(tradee, tradee_item_id, trader, tradeItems) {
    // debugger;
    //this is the initial fetch with status: 0 
    //renders user profile.
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
        .then(res => {
            res.json()

            showUserProfile(current_user().user.id)
        })

}

//Create User
function getSignUpForm() {
    let mainParentDiv = document.getElementById("page-content");
    mainParentDiv.innerHTML = "";
    let userformDiv = document.createElement("div")
    userformDiv.style = "width: 50 vw;"
    userformDiv.className = "form-group justify-content-center ml-auto mr-auto"
    let userSignUpForm = document.createElement("form")
    userSignUpForm.className = "form-group"

    let fnameLabel = document.createElement("label")
    fnameLabel.htmlFor = "first-name"
    fnameLabel.innerText = "First Name: "
    fnameLabel.style.color = "white"

    let fnameInput = document.createElement("input")
    fnameInput.name = "first_name"
    fnameInput.type = "first_name"
    fnameInput.id = "user-first-name"

    let lnameLabel = document.createElement("label")
    lnameLabel.htmlFor = "last-name"
    lnameLabel.innerText = "Last Name: "
    lnameLabel.style.color = "white"

    let lnameInput = document.createElement("input")
    lnameInput.name = "last_name"
    lnameInput.type = "last_name"
    lnameInput.id = "user-last-name"

    let userEmailLabel = document.createElement("label")
    userEmailLabel.htmlFor = "email"
    userEmailLabel.innerText = "Email: "
    userEmailLabel.style.color = "white"

    let userEmailInput = document.createElement("input")
    userEmailInput.name = "user-email"
    userEmailInput.type = "user-email"
    userEmailInput.id = "user-email-input"

    let userPasswordLabel = document.createElement("label")
    userPasswordLabel.htmlFor = "user-password"
    userPasswordLabel.innerText = "Password: "
    userPasswordLabel.style.color = "white"

    let userPasswordInput = document.createElement("input")
    userPasswordInput.name = "user-password"
    userPasswordInput.type = "user-password"
    userPasswordInput.id = "user-password-input"

    let locationLabel = document.createElement("label")
    locationLabel.htmlFor = "location"
    locationLabel.innerText = "Location By State: "
    locationLabel.style.color = "white"

    let locationInput = document.createElement("input")
    locationInput.name = "location"
    locationInput.type = "location"
    locationInput.id = "location-input"

    let createUserSubmitBtn = document.createElement('button')
    createUserSubmitBtn.innerHTML = "Create User"
    createUserSubmitBtn.type = "submit"
    fnameInput.className = "form-control"
    lnameInput.className = "form-control"
    userEmailInput.className = "form-control"
    userPasswordInput.className = "form-control"
    locationInput.className = "form-control"
    createUserSubmitBtn.className = "btn btn-primary btn-block mt-3"
    fnameLabel.style = "color: #EEEEEE; font-size: 1rem;"
    lnameLabel.style = "color: #EEEEEE; font-size: 1rem;"
    userEmailLabel.style = "color: #EEEEEE; font-size: 1rem;"
    userPasswordLabel.style = "color: #EEEEEE; font-size: 1rem;"
    locationLabel.style = "color: #EEEEEE; font-size: 1rem;"
    userSignUpForm.appendChild(fnameLabel)
    userSignUpForm.appendChild(fnameInput)
    userSignUpForm.appendChild(lnameLabel)
    userSignUpForm.appendChild(lnameInput)
    userSignUpForm.appendChild(userEmailLabel)
    userSignUpForm.appendChild(userEmailInput)
    userSignUpForm.appendChild(userPasswordLabel)
    userSignUpForm.appendChild(userPasswordInput)
    userSignUpForm.appendChild(locationLabel)
    userSignUpForm.appendChild(locationInput)
    userSignUpForm.appendChild(createUserSubmitBtn)
    userformDiv.className = "form-group justify-content-center ml-auto mr-auto"
    userSignUpForm.className = "form-group justify-content-center ml-auto mr-auto"
    userformDiv.appendChild(userSignUpForm)
        //look below for function
    addCreateUserEvent(userSignUpForm)

    mainParentDiv.appendChild(userSignUpForm)
}

function addCreateUserEvent(target) {
    target.addEventListener("submit", (e) => {
        createUser()
        e.preventDefault();
    })
}


function createUser() {
    //user values captured from inputs and sent to rails in post request. after user create we render profile for new user
    let first_name = document.getElementById("user-first-name").value
    let last_name = document.getElementById("user-last-name").value
    let email = document.getElementById("user-email-input").value
    let password = document.getElementById("user-password-input").value
    let location = document.getElementById("location-input").value
    fetch("http://localhost:3000/users", {
            method: 'POST',
            mode: 'cors',
            credentials: 'same-origin',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                first_name,
                last_name,
                email,
                password,
                location
            })
        })
        .then(res => res.json())
        .then(res => {
            console.log(res)
            windowStorage.clear()
                //add user to localstorage as current user and change nav elements to reflect that a user is logged in
            windowStorage.setItem('user', JSON.stringify(res))
            windowStorage.setItem('items', JSON.stringify(res.items))
            navOnLogin()
            let navbarDiv = document.getElementById("nav-div")
            addNavElement(navbarDiv, "Listings", "nav-item-listings", getListings)
            addNavElement(navbarDiv, "Profile", "nav-item-profile", () => showUserProfile(current_user().user.id))
            addNavElement(navbarDiv, "Item", "nav-item-form", () => getItemForm(current_user().user.id))
            debugger;
            addNavElement(navbarDiv, "Logout", "nav-item-logout", () => userLogout())
            showUserProfile(res.id)
        })
}

function navOnLogin() {
    //removes login and sign up nav when called.
    document.getElementById("nav-item-login").remove()
    document.getElementById("nav-item-signup").remove()
}

function getLoginForm() {
    let mainParentDiv = document.getElementById("page-content");
    mainParentDiv.innerHTML = "";
    //form creation 
    let loginForm = document.createElement("form")
    loginForm.className = "form-group"

    let emailLabel = document.createElement("label")
    emailLabel.htmlFor = "email"
    emailLabel.innerText = "Email: "
    emailLabel.style.color = "white"

    let emailInput = document.createElement("input")
    emailInput.name = "email"
    emailInput.type = "email"
    emailInput.id = "login-email"
    emailInput.align = "center"

    let passwordLabel = document.createElement("label")
    passwordLabel.htmlFor = "password"
    passwordLabel.innerText = "Password: "
    passwordLabel.style.color = "white"

    let passwordInput = document.createElement("input")
    passwordInput.name = "password"
    passwordInput.type = "password"
    passwordInput.id = "login-password"
    passwordInput.align = "center"

    let submitBtn = document.createElement('button')
    submitBtn.innerHTML = "Login"
    submitBtn.type = "submit"
    submitBtn.className = "btn btn-primary mt-1"
    emailInput.className = "form-control"
    passwordInput.className = "form-control"

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
                navOnLogin()
                let navbarDiv = document.getElementById('nav-div')
                addNavElement(navbarDiv, "Profile", "nav-item-profile", () => showUserProfile(current_user().user.id))
                addNavElement(navbarDiv, "Item", "nav-item-form", () => getItemForm(current_user().user.id))
                addNavElement(navbarDiv, "Logout", "nav-item-logout", () => userLogout())
                showUserProfile(res.user.id)
                addNavElement(navbarDiv, "Listings", "nav-item-listings", getListings)
            } else {
                alert("Invalid Credentials")
            }

        })

    event.preventDefault()
}

function showUserProfile(user_id) {

    let mainParentDiv = document.getElementById("page-content")
    mainParentDiv.innerHTML = ""
        //we fetch the user who's profile we wish to view. rails will return all associated items as well
    fetchSingleUser(user_id, mainParentDiv)
}
//alot happens in this next function. will try to comment as needed
function createUserCard(user, parent) {
    console.log(user)
    parent.className = "container ml-auto mr-auto"
    parent.innerHTML = `
	<div class="container emp-profile ">
            <form method="post">
                <div class="row">
                    <div class="col-md-4">
                        <div class="profile-img">
                        <img src="https://picsum.photos/200"/>
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
                        <div class="panel panel-primary">
                            <div id="view-trade-link" class="panel-heading">
                                <h5 class="panel-title">View ${user.first_name}'s Past Trades</h5>
                            </div>
                            <div class="panel-body" id="panel-body"></div>
                            <ul id="trade-ul"class="list-group overflow-auto" style="max-height: 30vh; max-width: 22vw; margin-bottom: 10px;">
                            </ul>

                        </div>
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
        //map over items and create a list
    user.items.forEach((item) => {
        let row = document.createElement("div")
        row.className = "row mb-2"
        row.id = `item-${item.id}`
        let colSize = document.createElement("div")
        colSize.className = "col-md-6"
        colSize.innerHTML = `<label>${item.brand} ${item.model}</label>`
        let colSize2 = document.createElement("div")
        colSize2.className = "col-md-6 input-group"
        let pTag = document.createElement("p")
        pTag.className = "input-group"
        pTag.innerText = `
                Rating: ${ item.trade_rating }
                `
        if (current_user().user.id == user.id) {
            let removeItemButton = document.createElement("button")
            removeItemButton.className = "input-group-btn btn btn-sm btn-primary"
            removeItemButton.innerText = "Remove Item"
            removeItemButton.addEventListener("click", (e) => {
                e.preventDefault();
                let c = confirm("Are you sure you want to remove this item?")
                if (c !== false) {
                    colSize.remove();
                    colSize2.remove();

                    removeItem(item);
                }
            })
            colSize2.appendChild(removeItemButton)
        }
        colSize2.appendChild(pTag)

        row.append(colSize, colSize2)
        timelineDiv.appendChild(row)

    })

    getTrades(user)
    addUserInfo(user, userInfoDiv, "first_name", )
    addUserInfo(user, userInfoDiv, "last_name")
    addUserInfo(user, userInfoDiv, "email")
    addUserInfo(user, userInfoDiv, "location")
}

function removeItem(item) {
    // debugger;
    fetch(`http://localhost:3000/items/${item.id}`, {
            method: 'DELETE',
            mode: 'cors',
            credentials: 'same-origin',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                item
            })
        })
        .then(res => res.json())
        .then(res => console.log(res))
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
    colDiv2.id = `${ key }_div `

    let pTag = document.createElement("p")
    pTag.innerText = user[key]

    colDiv2.appendChild(pTag)
    if (current_user().user.id == user.id) {
        let editBtn = document.createElement("a")
        editBtn.className = "ml-2"
        editBtn.innerHTML = ` <i class="fa fa-edit"> </i>`

        editBtn.addEventListener("click", () => {
            let attrEditForm = document.createElement("form")
            attrEditForm.className = ""
            attrEditForm.style = "max-height: 5vh;"
            let attrEditField = document.createElement("input")
            attrEditField.value = user[key]
            attrEditField.className = ""
            attrEditField.style = "max-width: 15vw;"
            let formDiv = document.createElement("div")
            formDiv.className = ""
            formDiv.style = "margin-top: 0;"
            formDiv.appendChild(attrEditField)

            let editSubmitBtn = document.createElement("button")
            editSubmitBtn.className = "btn btn-sm btn-success"
            editSubmitBtn.innerText = "Confirm"
            editSubmitBtn.type = "submit"
            formDiv.appendChild(editSubmitBtn)
            attrEditForm.appendChild(formDiv)
            colDiv2.innerHTML = ""
            colDiv2.appendChild(attrEditForm)
            colDiv2.style = "max-height: 5vh;"
            attrEditForm.addEventListener("submit", (e) => {
                let newValue = attrEditField.value
                colDiv2.innerText = newValue
                editUserAttribute(user, key, newValue, infoRow)
                e.preventDefault()
            })
        })
        pTag.appendChild(editBtn)
    }
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
        // .then(userData => {
        //     // let user = userData["user"]
        //     // let val = user[key]
        //     // let infoParent = document.getElementById(`${key}_div`)
        //     // addEditUserInfo(user, infoParent, val)
        // })
}

// function addEditUserInfo(user, infoParent, value) {
//     infoParent.innerHTML = `<p>${value}</p>`

// }

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