import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  set
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

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
const friend = localStorage.getItem("chatWith");
const room = [user.username, friend].sort().join("_");

const chatRef = ref(db, "chats/" + room);
const input = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");
const imageInput = document.getElementById("imageInput");

function sendMessage() {
  const message = input.value.trim();
  const file = imageInput.files[0];
  if (!message && !file) return;

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      push(chatRef, {
        sender: user.username,
        image: e.target.result,
        timestamp: Date.now()
      });
    };
    reader.readAsDataURL(file);
  }

  if (message) {
    push(chatRef, {
      sender: user.username,
      message: message,
      timestamp: Date.now()
    });
    input.value = "";
  }

  set(ref(db, "users/" + user.username + "/lastSeen"), new Date().toISOString());
}

onChildAdded(chatRef, (data) => {
  const msg = data.val();
  const div = document.createElement("div");
  div.style.margin = "10px";
  div.innerHTML = `<strong>${msg.sender}:</strong> ${msg.message || ''}`;
  if (msg.image) {
    const img = document.createElement("img");
    img.src = msg.image;
    img.style.maxWidth = "200px";
    div.appendChild(img);
  }
  chatBox.appendChild(div);
});