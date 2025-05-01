// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
  authDomain: "messengerapp-58f7a.firebaseapp.com",
  databaseURL: "https://messengerapp-58f7a-default-rtdb.firebaseio.com",
  projectId: "messengerapp-58f7a",
  storageBucket: "messengerapp-58f7a.firebasestorage.app",
  messagingSenderId: "46178168523",
  appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const chatInterface = document.getElementById("chatInterface");
const messagesDiv = document.getElementById("messages");
const newMessageInput = document.getElementById("newMessage");
const sendMessageButton = document.getElementById("sendMessage");

let currentUser = null;

// Switch between Login and Register forms
document.getElementById("switchToRegister").addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
});

document.getElementById("switchToLogin").addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
});

// Login Form Submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert("Logged in successfully!");
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

// Register Form Submission
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("registerUsername").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Save user details in Firestore
    await db.collection("users").doc(user.uid).set({ username, email });

    alert("Registered successfully!");
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

// Show Chat Interface
function showChat() {
  loginForm.classList.add("hidden");
  registerForm.classList.add("hidden");
  chatInterface.classList.remove("hidden");
  loadMessages();
}

// Load Messages from Firestore
function loadMessages() {
  if (!currentUser) return;

  const q = db.collection("messages").where("participants", "array-contains", currentUser.uid);

  q.onSnapshot((snapshot) => {
    messagesDiv.innerHTML = "";
    snapshot.forEach((doc) => {
      const message = doc.data();
      const messageElement = document.createElement("div");
      messageElement.textContent = message.text;
      messagesDiv.appendChild(messageElement);
    });
  });
}

// Send Message
sendMessageButton.addEventListener("click", async () => {
  const text = newMessageInput.value.trim();
  if (!text) return;

  try {
    await db.collection("messages").add({
      text,
      participants: [currentUser.uid], // Add more participants later
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    newMessageInput.value = "";
  } catch (error) {
    alert(error.message);
  }
});

// Listen for Auth State Changes
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    showChat();
  } else {
    currentUser = null;
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    chatInterface.classList.add("hidden");
  }
});
