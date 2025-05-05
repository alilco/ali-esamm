import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// تهيئة Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
  authDomain: "messengerapp-58f7a.firebaseapp.com",
  databaseURL: "https://messengerapp-58f7a-default-rtdb.firebaseio.com",
  projectId: "messengerapp-58f7a",
  storageBucket: "messengerapp-58f7a.firebasestorage.app",
  messagingSenderId: "46178168523",
  appId: "1:46178168523:web:cba8a71de3d7cc5910f54e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// عناصر DOM
const authSection = document.getElementById("auth-section");
const signupSection = document.getElementById("signup-section");
const homeSection = document.getElementById("home-section");
const usersList = document.getElementById("users-list");
const addUserSection = document.getElementById("add-user-section");
const chatSection = document.getElementById("chat-section");
const profileSection = document.getElementById("profile-section");
const currentUserElement = document.getElementById("current-user");
const usersElement = document.getElementById("users");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatWithElement = document.getElementById("chat-with");

let currentUser = null;
let selectedUserId = null;

// تسجيل الدخول
function signIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      showHome();
    })
    .catch((error) => {
      alert("خطأ: " + error.message);
    });
}

// إنشاء حساب
function signUp() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      set(ref(db, `users/${user.uid}`), { username, email });
      showLogin();
    })
    .catch((error) => {
      alert("خطأ: " + error.message);
    });
}

// تسجيل الخروج
function signOut() {
  signOut(auth).then(() => {
    currentUser = null;
    showLogin();
  });
}

// عرض الشاشات
function showLogin() {
  authSection.classList.remove("hidden");
  signupSection.classList.add("hidden");
  homeSection.classList.add("hidden");
}

function showSignUp() {
  authSection.classList.add("hidden");
  signupSection.classList.remove("hidden");
  homeSection.classList.add("hidden");
}

function showHome() {
  authSection.classList.add("hidden");
  signupSection.classList.add("hidden");
  homeSection.classList.remove("hidden");
  currentUserElement.textContent = currentUser.email;
  loadUsers();
}

function showAddUser() {
  addUserSection.classList.remove("hidden");
}

function hideAddUser() {
  addUserSection.classList.add("hidden");
}

function showChat(userId, username) {
  selectedUserId = userId;
  chatWithElement.textContent = username;
  chatSection.classList.remove("hidden");
  loadMessages();
}

function hideChat() {
  chatSection.classList.add("hidden");
}

function showProfile() {
  profileSection.classList.remove("hidden");
}

function hideProfile() {
  profileSection.classList.add("hidden");
}

// إضافة مستخدم
function addUser() {
  const username = document.getElementById("add-username").value;
  const userRef = ref(db, `users/${username}`);
  set(userRef, { username }).then(() => {
    alert("تمت إضافة المستخدم بنجاح");
    hideAddUser();
  });
}

// تحميل المستخدمين
function loadUsers() {
  const usersRef = ref(db, "users");
  onValue(usersRef, (snapshot) => {
    usersElement.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
      const user = childSnapshot.val();
      const li = document.createElement("li");
      li.textContent = user.username;
      li.onclick = () => showChat(childSnapshot.key, user.username);
      usersElement.appendChild(li);
    });
  });
}

// تحميل الرسائل
function loadMessages() {
  const chatId = [currentUser.uid, selectedUserId].sort().join("_");
  const messagesRef = ref(db, `chats/${chatId}`);
  onValue(messagesRef, (snapshot) => {
    chatMessages.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val();
      const div = document.createElement("div");
      div.classList.add("chat-message", "mb-2", "p-2", "bg-gray-200", "rounded");
      div.textContent = `${message.sender === currentUser.uid ? "أنت" : "هم"}: ${message.text}`;
      chatMessages.appendChild(div);
    });
  });
}

// إرسال رسالة
function sendMessage() {
  const chatId = [currentUser.uid, selectedUserId].sort().join("_");
  const message = chatInput.value;
  const messageRef = ref(db, `chats/${chatId}`);
  push(messageRef, {
    sender: currentUser.uid,
    text: message,
    timestamp: Date.now(),
  });
  chatInput.value = "";
}

// تحديث المعلومات الشخصية
function updateProfile() {
  const username = document.getElementById("profile-username").value;
  const email = document.getElementById("profile-email").value;
  const userRef = ref(db, `users/${currentUser.uid}`);
  set(userRef, { username, email }).then(() => {
    alert("تم تحديث المعلومات بنجاح");
    hideProfile();
  });
}
