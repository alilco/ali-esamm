import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
  authDomain: "messengerapp-58f7a.firebaseapp.com",
  databaseURL: "https://messengerapp-58f7a-default-rtdb.firebaseio.com",
  projectId: "messengerapp-58f7a",
  storageBucket: "messengerapp-58f7a.appspot.com",
  messagingSenderId: "46178168523",
  appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const user = JSON.parse(localStorage.getItem("currentUser"));
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("messageInput");
const chatRef = ref(db, `messages/global`);

window.sendMessage = function () {
  const text = input.value;
  if (!text) return;

  const message = {
    user: user.username,
    text: btoa(text), // تشفير Base64
    time: new Date().toLocaleTimeString()
  };

  push(chatRef, message);
  input.value = "";
};

onChildAdded(chatRef, (snapshot) => {
  const msg = snapshot.val();
  const div = document.createElement("div");
  const sender = msg.user === user.username ? "أنا" : msg.user;
  div.innerHTML = `<strong>${sender}:</strong> ${atob(msg.text)} <span style="font-size:10px">(${msg.time})</span>`;
  chatBox.appendChild(div);
});
