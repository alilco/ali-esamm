
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  set,
  serverTimestamp,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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

const username = localStorage.getItem("username");
const receiver = localStorage.getItem("receiver");

const chatRef = ref(db, `chats/${username}_${receiver}`);
const reverseChatRef = ref(db, `chats/${receiver}_${username}`);
const messagesDiv = document.getElementById("messages");

document.getElementById("sendButton").onclick = () => {
  const message = document.getElementById("messageInput").value;
  if (message.trim() !== "") {
    const newMsg = {
      sender: username,
      message: message,
      timestamp: serverTimestamp()
    };
    push(chatRef, newMsg);
    push(reverseChatRef, newMsg);
    document.getElementById("messageInput").value = "";
  }
};

onChildAdded(chatRef, (data) => {
  const msg = data.val();
  const msgElement = document.createElement("div");
  msgElement.className = msg.sender === username ? "msg-sent" : "msg-received";
  msgElement.textContent = `${msg.sender}: ${msg.message}`;
  messagesDiv.appendChild(msgElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// تحديث آخر ظهور
const userStatusRef = ref(db, `users/${username}`);
update(userStatusRef, { lastSeen: new Date().toLocaleString() });

// عرض آخر ظهور للمستقبل
const receiverStatusRef = ref(db, `users/${receiver}/lastSeen`);
onValue(receiverStatusRef, (snapshot) => {
  document.getElementById("lastSeen").innerText = "آخر ظهور: " + snapshot.val();
});
