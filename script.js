// Firebase config والتهيئة
const firebaseConfig = {
  apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
  authDomain: "messengerapp-58f7a.firebaseapp.com",
  databaseURL: "https://messengerapp-58f7a-default-rtdb.firebaseio.com",
  projectId: "messengerapp-58f7a",
  storageBucket: "messengerapp-58f7a.appspot.com",
  messagingSenderId: "46178168523",
  appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const user = JSON.parse(localStorage.getItem("currentUser"));
if (!user) location.href = "login.html";

const friendsList = document.getElementById("friendsList");
const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const inputArea = document.getElementById("inputArea");
const chatWith = document.getElementById("chatWith");

let currentChatUser = null;

// عرض قائمة الأصدقاء
function loadFriends() {
  db.ref("users").once("value", snapshot => {
    friendsList.innerHTML = "";
    snapshot.forEach(child => {
      const friend = child.val();
      if (friend.username !== user.username) {
        const li = document.createElement("li");
        li.textContent = friend.fullName;
        li.onclick = () => startChat(friend);
        friendsList.appendChild(li);
      }
    });
  });
}

loadFriends();

// بدء المحادثة
function startChat(friend) {
  currentChatUser = friend;
  chatWith.innerText = "الدردشة مع: " + friend.fullName;
  inputArea.style.display = "flex";
  loadMessages();
}

// تحميل الرسائل
function loadMessages() {
  const chatId = getChatId(user.username, currentChatUser.username);
  db.ref("chats/" + chatId).off();
  db.ref("chats/" + chatId).on("value", snapshot => {
    messages.innerHTML = "";
    snapshot.forEach(msgSnap => {
      const msg = msgSnap.val();
      const div = document.createElement("div");
      div.textContent = msg.sender + ": " + msg.text;
      div.className = msg.sender === user.username ? "my-msg" : "their-msg";
      messages.appendChild(div);
    });
    messages.scrollTop = messages.scrollHeight;
  });
}

// إرسال رسالة
sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (text === "") return;

  const chatId = getChatId(user.username, currentChatUser.username);
  const msg = {
    sender: user.username,
    text: text,
    timestamp: Date.now()
  };
  db.ref("chats/" + chatId).push(msg);
  messageInput.value = "";
};

// إنشاء معرف موحد للمحادثة بين المستخدمين
function getChatId(u1, u2) {
  return u1 < u2 ? `${u1}_${u2}` : `${u2}_${u1}`;
}

// تسجيل الخروج
function logout() {
  localStorage.removeItem("currentUser");
  location.href = "login.html";
}
