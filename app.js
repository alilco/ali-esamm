// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js";
import { getDatabase, ref, push, onValue, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js";

// تكوين Firebase الخاص بك
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// عرض الحاوية المناسبة بناءً على حالة المستخدم
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("chat-container").style.display = "block";
    loadMessages();
  } else {
    document.getElementById("auth-container").style.display = "block";
    document.getElementById("chat-container").style.display = "none";
  }
});

// تسجيل الدخول
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .catch((error) => {
      alert("فشل تسجيل الدخول: " + error.message);
    });
}

// إنشاء حساب
function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .catch((error) => {
      alert("فشل إنشاء الحساب: " + error.message);
    });
}

// إرسال رسالة
function sendMessage() {
  const input = document.getElementById("message-input");
  const message = input.value.trim();

  if (!message) return;

  const messagesRef = ref(db, "messages/");
  push(messagesRef, {
    text: message,
    user: auth.currentUser.email,
    timestamp: Date.now()
  });

  input.value = "";
}

// تحميل الرسائل
function loadMessages() {
  const messagesRef = ref(db, "messages/");
  onValue(messagesRef, (snapshot) => {
    const messages = [];
    snapshot.forEach(childSnapshot => {
      messages.push(childSnapshot.val());
    });
    displayMessages(messages);
  });
}

// عرض الرسائل
function displayMessages(messages) {
  const container = document.getElementById("messages");
  container.innerHTML = "";
  messages.sort((a, b) => a.timestamp - b.timestamp).forEach(msg => {
    const div = document.createElement("div");
    div.textContent = `${msg.user}: ${msg.text}`;
    container.appendChild(div);
  });
  container.scrollTop = container.scrollHeight;
}

// تسجيل الخروج
function logout() {
  signOut(auth);
}
