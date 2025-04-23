// Firebase إعداد
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue, set, push, get, child } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

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

// المتغيرات
let currentUser = JSON.parse(localStorage.getItem("currentUser"));
let currentChatUser = null;

// إظهار المستخدمين
function searchUsers() {
  const search = document.getElementById("searchUser").value.toLowerCase();
  const usersRef = ref(db, "users");
  get(usersRef).then(snapshot => {
    const usersList = document.getElementById("usersList");
    usersList.innerHTML = "";
    snapshot.forEach(child => {
      const user = child.val();
      if (user.username.toLowerCase().includes(search) && user.username !== currentUser.username) {
        const li = document.createElement("li");
        li.textContent = user.username;
        li.onclick = () => startChat(user.username);
        usersList.appendChild(li);
      }
    });
  });
}

// بدء محادثة
function startChat(username) {
  currentChatUser = username;
  document.getElementById("chatWith").innerText = `الدردشة مع ${username}`;
  loadMessages();
}

// تحميل الرسائل
function loadMessages() {
  const messagesRef = ref(db, `messages/${getChatId(currentUser.username, currentChatUser)}`);
  onValue(messagesRef, snapshot => {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";
    snapshot.forEach(child => {
      const msg = child.val();
      const div = document.createElement("div");
      div.className = msg.sender === currentUser.username ? "message sent" : "message received";
      div.innerText = msg.text;
      messagesDiv.appendChild(div);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// إرسال رسالة
function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (text && currentChatUser) {
    const msgRef = ref(db, `messages/${getChatId(currentUser.username, currentChatUser)}`);
    push(msgRef, {
      sender: currentUser.username,
      text: text,
      timestamp: Date.now()
    });
    input.value = "";
  }
}

// معرف المحادثة بين مستخدمين
function getChatId(user1, user2) {
  return [user1, user2].sort().join("_");
}

// تسجيل الخروج
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

window.sendMessage = sendMessage;
window.searchUsers = searchUsers;
window.logout = logout;
