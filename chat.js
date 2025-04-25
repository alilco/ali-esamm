// chat.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// إعداد Firebase
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

// اسم المستخدم الحالي والصديق
const currentUser = localStorage.getItem("currentUser");
const friend = localStorage.getItem("chatWith");
document.getElementById("friendName").textContent = friend;

// مرجع المحادثة بين المستخدمين
const chatId = currentUser < friend ? `${currentUser}_${friend}` : `${friend}_${currentUser}`;
const chatRef = ref(db, "chats/" + chatId);

// إرسال رسالة
window.sendMessage = function () {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (text !== "") {
    push(chatRef, {
      from: currentUser,
      message: text,
      timestamp: Date.now()
    });
    input.value = "";
  }
};

// استقبال الرسائل وعرضها
const chatBox = document.getElementById("chat-box");
onChildAdded(chatRef, (data) => {
  const msg = data.val();
  const div = document.createElement("div");
  div.className = "message " + (msg.from === currentUser ? "me" : "friend");
  div.textContent = msg.message;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});
