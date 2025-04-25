// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
  createUserWithEmailAndPassword, sendEmailVerification,
  sendPasswordResetEmail, deleteUser
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase, ref, set, get, child, onValue, update, remove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// تسجيل الدخول
window.loginUser = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("تم تسجيل الدخول");
    }).catch((error) => {
      alert("خطأ: " + error.message);
    });
}

// إنشاء حساب جديد
window.registerUser = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      sendEmailVerification(user);
      set(ref(db, "users/" + user.uid), {
        username: username,
        email: email,
        status: "نشط",
        lastSeen: Date.now()
      });
      alert("تم إنشاء الحساب، تحقق من بريدك الإلكتروني");
    }).catch((error) => {
      alert("خطأ: " + error.message);
    });
}

// تحقق الجلسة
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("مستخدم مسجل الدخول: ", user.email);
  }
});

// إعادة تعيين كلمة المرور
window.resetPassword = function () {
  const email = document.getElementById("email").value;
  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert("تم إرسال رابط إعادة التعيين");
    }).catch((error) => {
      alert("خطأ: " + error.message);
    });
}

// حذف الحساب
window.deleteAccount = function () {
  const user = auth.currentUser;
  deleteUser(user).then(() => {
    alert("تم حذف الحساب نهائياً");
  }).catch((error) => {
    alert("خطأ: " + error.message);
  });
}

// تسجيل الخروج
window.logoutUser = function () {
  signOut(auth).then(() => {
    alert("تم تسجيل الخروج");
  });
}
