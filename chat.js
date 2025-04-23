import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
  authDomain: "messengerapp-58f7a.firebaseapp.com",
  databaseURL: "https://messengerapp-58f7a-default-rtdb.firebaseio.com",
  projectId: "messengerapp-58f7a",
  storageBucket: "messengerapp-58f7a.appspot.com",
  messagingSenderId: "46178168523",
  appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
};

// تشغيل Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// عناصر الصفحة
const friendsList = document.getElementById("friendsList");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatWith = document.getElementById("chatWith");
const backBtn = document.getElementById("backBtn");

let currentUser = JSON.parse(localStorage.getItem("user"));
let selectedFriend = null;

// تحميل الأصدقاء
fetch("users.json")
  .then(res => res.json())
  .then(users => {
    users.forEach(user => {
      if (user.username !== currentUser.username) {
        const li = document.createElement("li");
        li.textContent = user.fullname;
        li.onclick = () => openChat(user);
        friendsList.appendChild(li);
      }
    });
  });

// فتح محادثة خاصة
function openChat(friend) {
  selectedFriend = friend;
  chatWith.textContent = `الدردشة مع ${friend.fullname}`;
  messagesDiv.innerHTML = "";
  const chatId = generateChatId(currentUser.username, friend.username);
  const messagesRef = ref(db, `messages/${chatId}`);

  onValue(messagesRef, snapshot => {
    messagesDiv.innerHTML = "";
    snapshot.forEach(child => {
      const data = child.val();
      const msg = decrypt(data.message);
      const div = document.createElement("div");
      div.className = data.sender === currentUser.username ? "my-msg" : "their-msg";
      div.textContent = msg;
      messagesDiv.appendChild(div);
    });
  });
}

// إرسال رسالة
sendBtn.onclick = () => {
  if (!selectedFriend || messageInput.value.trim() === "") return;
  const chatId = generateChatId(currentUser.username, selectedFriend.username);
  const msgRef = push(ref(db, `messages/${chatId}`));
  set(msgRef, {
    sender: currentUser.username,
    message: encrypt(messageInput.value.trim())
  });
  messageInput.value = "";
};

// زر الرجوع
backBtn.onclick = () => {
  location.href = "index.html";
};

// توليد معرف المحادثة
function generateChatId(user1, user2) {
  return [user1, user2].sort().join("_");
}

// تشفير بسيط (يمكن تغييره بخوارزمية أقوى)
function encrypt(msg) {
  return btoa(unescape(encodeURIComponent(msg)));
}
function decrypt(enc) {
  return decodeURIComponent(escape(atob(enc)));
}
