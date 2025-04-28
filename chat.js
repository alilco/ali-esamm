// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
  authDomain: "messengerapp-58f7a.firebaseapp.com",
  databaseURL: "https://messengerapp-58f7a-default-rtdb.firebaseio.com",
  projectId: "messengerapp-58f7a",
  storageBucket: "messengerapp-58f7a.appspot.com",
  messagingSenderId: "46178168523",
  appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// Send message function
window.sendMessage = function() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();

  if (message !== '') {
    const messagesRef = ref(database, 'messages');
    push(messagesRef, {
      text: message,
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      timestamp: Date.now()
    });
    messageInput.value = '';
  }
};

// Listen for new messages
const messagesDiv = document.getElementById('messages');
const messagesRef = ref(database, 'messages');

onChildAdded(messagesRef, (data) => {
  const message = data.val();
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');

  if (message.uid === auth.currentUser.uid) {
    messageElement.classList.add('my-message');
  } else {
    messageElement.classList.add('other-message');
  }

  messageElement.innerHTML = `<strong>${message.email}:</strong> ${message.text}`;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Logout
window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
}
