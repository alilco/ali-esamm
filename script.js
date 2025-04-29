// DOM Elements
const loginScreen = document.getElementById("login-screen");
const registerScreen = document.getElementById("register-screen");
const chatScreen = document.getElementById("chat-screen");
const userEmailSpan = document.getElementById("user-email");

let currentUser = null;

// Navigation
function showLogin() {
  loginScreen.classList.remove("hidden");
  registerScreen.classList.add("hidden");
  chatScreen.classList.add("hidden");
}

function showRegister() {
  registerScreen.classList.remove("hidden");
  loginScreen.classList.add("hidden");
  chatScreen.classList.add("hidden");
}

// Login
function signIn() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      currentUser = userCredential.user;
      userEmailSpan.textContent = currentUser.email;
      loadMessages();
      loginScreen.classList.add("hidden");
      chatScreen.classList.remove("hidden");
    })
    .catch(error => {
      alert("Login Failed: " + error.message);
    });
}

// Register
function signUp() {
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      currentUser = userCredential.user;
      userEmailSpan.textContent = currentUser.email;
      loadMessages();
      registerScreen.classList.add("hidden");
      chatScreen.classList.remove("hidden");
    })
    .catch(error => {
      alert("Registration Failed: " + error.message);
    });
}

// Logout
function signOut() {
  auth.signOut().then(() => {
    currentUser = null;
    showLogin();
  });
}

// Load Messages
function loadMessages() {
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";

  db.ref("messages").on("child_added", snapshot => {
    const msg = snapshot.val();
    const messageEl = document.createElement("div");
    messageEl.classList.add("message");
    messageEl.innerHTML = `<strong>${msg.username}</strong>: ${msg.text}`;
    chatBox.appendChild(messageEl);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Send Message
document.getElementById("message-form").addEventListener("submit", e => {
  e.preventDefault();
  const input = document.getElementById("message-input");
  const text = input.value.trim();

  if (!currentUser || !text) return;

  db.ref("messages").push({
    username: currentUser.email,
    text: text,
    timestamp: Date.now()
  });

  input.value = "";
});
