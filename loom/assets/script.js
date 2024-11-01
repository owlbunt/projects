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
    console.log(userDetails)

    if (!userDetails) {
        document.querySelector("#email").style.border = "1px solid red";
        return console.log("Username not found.");
    }

    if (userDetails.Status !== "Active") {
        return console.log("User account is not active.");
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

// Load User Profile Details (If Logged-in)
function loadUserDetails(userDetails) {
    profileImg = userDetails["Profile Picture"];
    userFullName = userDetails["Name"];
    document.querySelector("#profileImg").src = profileImg;
    document.querySelector("#userFullName").textContent = userFullName;
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
                    <div class="dropdown d-flex ms-2">
                        <svg style="opacity:.9" class="dropdown-toggle text-muted" data-bs-toggle="dropdown" aria-expanded="false" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/></svg>
                        </a>
                        <ul class="dropdown-menu text-small shadow">
                            <li><a class="dropdown-item disabled" href="#">Replay</a></li>
                            <li><hr class="dropdown-divider m-1"></li>
                            <li><a class="dropdown-item disabled" href="#">Copy</a></li>
                            <li><hr class="dropdown-divider m-1"></li>
                            <li class="d-flex align-items-center"><a onclick="deleteMessage('${key}')" class="dropdown-item text-danger">Delete</a><svg class="me-3" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="var(--bs-danger)" class="bi bi-trash3" viewBox="0 0 16 16"><path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/></svg></li>
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
}

// Delete Messages
function deleteMessage(key) {
    fetch(`${firebaseConfig.databaseURL}/loomChatApp/messages/global/${key}.json`, {
        method: 'DELETE',
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