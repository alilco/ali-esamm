import { auth, database } from './firebase-config.js';
import { ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// إنشاء حساب جديد
window.signup = function (event) {
  event.preventDefault();

  const fullName = document.getElementById("fullname").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const email = username + "@chatapp.com";

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const userId = userCredential.user.uid;
      set(ref(database, 'users/' + userId), {
        fullName: fullName,
        username: username,
        userId: userId,
        status: "نشط",
        lastSeen: new Date().toLocaleString(),
        bio: "",
        profileImage: "default.png"
      });

      localStorage.setItem("userId", userId);
      window.location.href = "chat.html";
    })
    .catch((error) => {
      alert("خطأ: " + error.message);
    });
};

// تسجيل الدخول
window.login = function (event) {
  event.preventDefault();

  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const email = username + "@chatapp.com";

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const userId = userCredential.user.uid;
      localStorage.setItem("userId", userId);
      window.location.href = "chat.html";
    })
    .catch((error) => {
      alert("فشل تسجيل الدخول: " + error.message);
    });
};

// فحص الجلسة عند فتح الصفحة
window.addEventListener("load", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      localStorage.setItem("userId", user.uid);
    } else {
      localStorage.removeItem("userId");
    }
  });
});
