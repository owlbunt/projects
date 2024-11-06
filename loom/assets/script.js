// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBvuUQ94hFIcLJ3PnErAOKiWbxdu07lhwg",
    authDomain: "loomchatapp.firebaseapp.com",
    databaseURL: "https://loomchatapp-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "loomchatapp",
    storageBucket: "loomchatapp.appspot.com",
    messagingSenderId: "244738338912",
    appId: "1:244738338912:web:2f0fc983e6f09f28529305",
    measurementId: "G-NWK4HERHLJ"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Default Profile Image and Username
let profileImg = "https://i.ibb.co/nB8wFF9/userImg.png";
let userFullName = "Guest";
// Local Storage User Data
let userData = JSON.parse(localStorage.getItem('userData')); ;
let autoScroll = true;

// Admin Commands
const commands = {
    '/clear': clearMessages,
    // Add more commands here in the future
};


// Fetch User Data From Database
async function fetchUserData() {
    try {
        const response = await fetch(`${firebaseConfig.databaseURL}/loomChatApp/userDatabase.json`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

// Check if the user is already logged in
async function checkLoggedInUser() {
    if (userData) {
        const storedUsername = userData.Username;
        const storedPassword = userData.Password;
        const users = await fetchUserData();
        const loggedInUser = users[storedUsername];

        if (loggedInUser && loggedInUser.Password === storedPassword && loggedInUser.Status === "Active") {
            await loggedIn();
            loadUserDetails(loggedInUser);
        } else {
            logout();
        }
    } else {
        await loadLoginScreen();
    }
}
checkLoggedInUser();

// Load Login Screen
async function loadLoginScreen() {
    try {
        const response = await fetch("./login.html");
        document.body.innerHTML = await response.text();
        const loginForm = document.querySelector("form");

        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();
            validateLogin(
                document.getElementById("email").value,
                document.getElementById("password").value
            );
        });
        localStorage.clear();
    } catch (error) {
        console.error("Error loading login screen:", error);
    }
}

// Validate the login
async function validateLogin(usernameInput, passwordInput) {
    const users = await fetchUserData();
    const userDetails = users[usernameInput];
    if (!userDetails) {
        document.querySelector("#email").style.border = "1px solid red";
        return console.log("Username not found.");
    }

    if (userDetails.Status !== "Active") {
        return console.log("Your account is not active.");
    }

    if (userDetails.Password === passwordInput) {
        // Save all user data to localStorage
        if (document.querySelector("#rememberMe").checked) {
            localStorage.setItem('userData', JSON.stringify(userDetails));
            userData = JSON.parse(localStorage.getItem('userData'));
        }

        await loggedIn();
        loadUserDetails(userDetails);
    } else {
        document.querySelector("#password").style.border = "1px solid red";
        console.log("Incorrect password.");
    }
}

// Check User Login Status (Realtime)
const userDatabaseRef = firebase.database().ref("loomChatApp/userDatabase");
userDatabaseRef.on("value", (snapshot) => {
    checkLoggedInUser();
});

// Load User Profile Details (If Logged-in)
function loadUserDetails(userDetails) {
    profileImg = userDetails["Profile Picture"];
    userFullName = userDetails["Name"];
    document.querySelector("#profileImg").src = profileImg;
    document.querySelector("#userFullName").textContent = userFullName;
    document.querySelector("#userName").innerHTML = userData.Username;
}

// Load Chat Page
async function loggedIn() {
    try {
        const response = await fetch("./chat.html");
        document.body.innerHTML = await response.text();

        document.querySelector("#message").addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                sendMessage();
            }
        });

        const chatBox = document.getElementById("chatBox");
        chatBox.addEventListener("scroll", () => {
            autoScroll = chatBox.scrollTop + chatBox.clientHeight >= chatBox.scrollHeight - 20;
        });
        loadMessages();
    } catch (error) {
        console.error("Error loading chat content:", error);
    }
}

// Load Chats
function displayMessages(data) {
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";

    for (const key in data) {
        const { name, message, timestamp, profilePicture } = data[key];
        const date = new Date(timestamp);
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

        const messageDiv = document.createElement("div");
        messageDiv.innerHTML = `
            <div class="messageTemplate">
                <div class="userInfo d-flex align-items-center">
                    <img src="${profilePicture}" alt="Profile Picture" height="30px" class="border rounded-circle p-1 me-2">
                    <span class="name fw-bold me-1">${name}</span>
                    <span class="time text-muted">• ${formattedTime}</span>
                </div>
                <div class="d-flex align-items-center">
                    <p class="message border rounded-4 bg-white ps-3 pe-3">${message}</p>
                    <div class="dropdown">
                        <div class="actionMenuBtn" data-bs-toggle="dropdown">
                            <svg style="opacity:.9" class="text-muted" aria-expanded="false" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/></svg>
                        </div>
                        <ul class="dropdown-menu text-small shadow">
                            <li><a class="dropdown-item disabled d-flex align-items-center justify-content-between" href="#">Replay <svg width="16px" height="16px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" transform="scale(-1, 1)";><g id="SVGRepo_bgCarrier" stroke-width="1"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14.6644 5.47875L18.6367 9.00968C20.2053 10.404 20.9896 11.1012 20.9896 11.9993C20.9896 12.8975 20.2053 13.5946 18.6367 14.989L14.6644 18.5199C13.9484 19.1563 13.5903 19.4746 13.2952 19.342C13 19.2095 13 18.7305 13 17.7725V15.4279C9.4 15.4279 5.5 17.1422 4 19.9993C4 10.8565 9.33333 8.57075 13 8.57075V6.22616C13 5.26817 13 4.78917 13.2952 4.65662C13.5903 4.52407 13.9484 4.8423 14.6644 5.47875Z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></a></li>
                            <li><hr class="dropdown-divider m-1"></li>
                            <li><a class="dropdown-item d-flex align-items-center justify-content-between disabled" href="#">Copy <svg width="20px" height="20px" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="1"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M8.94605 4.99995L13.2541 4.99995C14.173 5.00498 15.0524 5.37487 15.6986 6.02825C16.3449 6.68163 16.7051 7.56497 16.7001 8.48395V12.716C16.7051 13.6349 16.3449 14.5183 15.6986 15.1717C15.0524 15.825 14.173 16.1949 13.2541 16.2H8.94605C8.02707 16.1949 7.14773 15.825 6.50148 15.1717C5.85522 14.5183 5.495 13.6349 5.50005 12.716L5.50005 8.48495C5.49473 7.5658 5.85484 6.6822 6.50112 6.0286C7.1474 5.375 8.0269 5.00498 8.94605 4.99995Z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10.1671 19H14.9371C17.4857 18.9709 19.5284 16.8816 19.5001 14.333V9.666" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></a></li>
                            <li><hr class="dropdown-divider m-1"></li>
                            <li class="d-flex align-items-center"><a onclick="deleteMessage('${key}')" class="dropdown-item text-danger d-flex align-items-center justify-content-between">Delete <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 7H20" stroke="currentColor"" stroke-width="0.696" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6 7V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V7" stroke="currentColor"" stroke-width="0.696" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="currentColor"" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></a> </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        chatBox.appendChild(messageDiv);
    }
    scrollToBottom();
}

// Fetch Messages In Realtime
function loadMessages() {
    const messagesRef = firebase.database().ref("loomChatApp/messages/global");
    messagesRef.on("value", (snapshot) => {
        const data = snapshot.val();
        displayMessages(data);
    });
}

// Scroll chats to bottom if there is a new message
function scrollToBottom() {
    const chatBox = document.getElementById("chatBox");
    if (autoScroll) {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// Send Message to Database
function sendMessage() {
    const messageInput = document.getElementById("message");
    const message = messageInput.value.trim();

    if (message) {
        // Check if the message is a command
        const command = message.split(" ")[0]; // Get the first word
        if (commands[command]) {
            // Check If the user has Admin Rights
            if(userData.Role == "Admin"){
                commands[command](); 
            }else{
                console.log("You'r Not Admin")
            }
             
        } else {
            const messageData = {
                sender : userData.Username,
                name: userFullName,
                profilePicture: profileImg,
                message,
                timestamp: new Date().toISOString()
            };

            fetch(`${firebaseConfig.databaseURL}/loomChatApp/messages/global.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData),
            });
        }

        messageInput.value = "";
    }
}

// Mobile Menu Toggle
function openMobileMenu() {
    const mobileMenu = document.querySelector(".mobileMenu");
    mobileMenu.classList.toggle("active");
    mobileMenu.innerHTML = document.querySelector("#sidebar").outerHTML;
    
    if (mobileMenu.classList.contains("active")) {
        document.addEventListener("mousedown", function hideMenu(event) {
            if (!mobileMenu.contains(event.target)) {
                mobileMenu.classList.remove("active");
                document.removeEventListener("mousedown", hideMenu);
            }
        });
    }
    // Menu Close Button
    document.querySelector("#menuCloseBtn").addEventListener("click", ()=>{
        mobileMenu.classList.remove("active");
    })

    // Close Mobile Menu On Slide
    let touchStartX = 0;
    let touchEndX = 0;
    mobileMenu.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    });
    mobileMenu.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;

    if (touchStartX - touchEndX > 100) { 
        mobileMenu.classList.remove("active");
    }
    });
}

// Delete Messages (Users)
function deleteMessage(key) {
    // Fetch the message data to check the Username
    fetch(`${firebaseConfig.databaseURL}/loomChatApp/messages/global/${key}.json`)
        .then(response => response.json())
        .then(data => {
            // Check if the Username in the message matches userData.Username
            if (data && data.sender == userData.Username || userData.Role === "Admin") {
                // If Username matches, delete the message
                return fetch(`${firebaseConfig.databaseURL}/loomChatApp/messages/global/${key}.json`, {
                    method: 'DELETE',
                });
            } else {
                console.log("You can't Delete This Message!");
            }
        })
}


// Function to clear all messages (Admin)
function clearMessages() {
    // Fetch all messages to delete them
    fetch(`${firebaseConfig.databaseURL}/loomChatApp/messages/global.json`)
        .then(response => response.json())
        .then(data => {
            const keys = Object.keys(data);
            const deletePromises = keys.map(key => deleteMessage(key)); // Use deleteMessage function

            // Wait for all delete requests to finish
            return Promise.all(deletePromises);
        })
        .then(() => {
            console.log("All messages cleared.");
            loadMessages(); // Optionally reload messages after clearing
        })
        .catch(error => {
            console.error("Error clearing messages:", error);
        });
}

// Logout Function
function logout() {
    localStorage.clear();
    location.reload();
}
