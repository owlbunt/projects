//  Database URL (firebase)
const databaseURL = "https://loomchatapp-default-rtdb.asia-southeast1.firebasedatabase.app/loomChatApp/";
// Default Profile Image
let profileImg = "https://i.ibb.co/nB8wFF9/userImg.png";
// Default User Name
let userFullName = "Guest";
// Get The User Details From Local Storage (if logged-in)
let storedUsername = localStorage.getItem('username');
let storedPassword = localStorage.getItem('password');

// Fetch User Data From Database
async function fetchUserData() {
    const userDatabaseURL = `${databaseURL}userDatabase.json`; 
    try {
        const response = await fetch(userDatabaseURL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}


// Function to check if the user is already logged in
async function checkLoggedInUser() {
    // Check if username and passowrd found in localstorage
    if (storedUsername && storedPassword) {
        // fetch data from databse
        let users = await fetchUserData();
        // Check if the username match with any user in the database
        let loggedInUser = users[storedUsername];
        if(loggedInUser){
            // load chat screen if password match
            if(loggedInUser.Password == storedPassword){
                await loggedIn();
            }else{
                logout();
            }
            loadUserDetails(loggedInUser);
        }
    }else{
        // Load Login Page (if not logged-in)
        async function loadLoginScreen() {
            try {
                const response = await fetch("./login.html"); 
                const loginHtml = await response.text();
                document.body.innerHTML = loginHtml; 
            } catch (error) {
                console.error("Error loading chat content:", error);
            }
        }
        await loadLoginScreen();
        
        // Handling form submission
        const loginForm = document.querySelector("form");
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            // Get the entered username and password
            const username = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            // Validate the login with fetched data
            validateLogin(username, password);
        });
    }
}
checkLoggedInUser();


// Function to validate the login
async function validateLogin(usernameInput, passwordInput) {
    let users = await fetchUserData(); // Fetch the user data 
    // Check if the username exists in the database
    if (users[usernameInput]) {
        const userDetails = users[usernameInput];

        // Check if the user's status is 'Active'
        if (userDetails.Status !== "Active") {
            console.log("User account is not active.");
            return;
        }

        // Check if the password matches
        if (userDetails.Password === passwordInput) {       
            // Check if the user wants to save the login details
            if(document.querySelector("#rememberMe").checked){
                // Remove old Login Details and Store New Details
                localStorage.removeItem('username'); localStorage.removeItem('password'); 
                localStorage.setItem('username', usernameInput);localStorage.setItem('password', passwordInput);
            }
            // Load chat screen 
            await loggedIn();
            // Load Userdetails
            loadUserDetails(userDetails)

        } else {
            console.log("Incorrect password.");
            // If passowrd is Incorrect show an error in passowrd
            document.querySelector("#password").style.border ="1px solid red";
        }
    } else {
        console.log("Username not found.");
        // If username is Incorrect or not found show an error in username
        document.querySelector("#email").style.border ="1px solid red";
    }
}

// Login User
async function loggedIn(){
    // Load Chat Page
    async function loadChatScreen() {
        try {
            const response = await fetch("./chat.html"); 
            const chatHtml = await response.text();
            document.body.innerHTML = chatHtml; 
        } catch (error) {
            console.error("Error loading chat content:", error);
        }
    }
    await loadChatScreen();
}

function loadUserDetails(loggedInUser){
    // Load User Profile Details 
    profileImg = loggedInUser["Profile Picture"];
    userFullName = loggedInUser["Name"];
    document.querySelector("#profileImg").src = profileImg;
    document.querySelector("#userFullName").innerHTML = userFullName;
}

// Log Out User
function logout(){
    localStorage.clear();
    location.reload();
}

