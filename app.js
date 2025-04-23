// Firebase App (the core Firebase SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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

// تسجيل حساب
window.signup = function () {
  const fullName = document.getElementById("fullName").value;
  const username = document.getElementById("signupUsername").value;
  const password = document.getElementById("signupPassword").value;

  if (!fullName || !username || !password) return alert("يرجى ملء جميع الحقول");

  set(ref(db, "users/" + username), {
    fullName,
    username,
    password,
    status: "متصل الآن",
    lastSeen: new Date().toLocaleString(),
    bio: "",
    profileImage: ""
  }).then(() => {
    alert("تم إنشاء الحساب بنجاح");
    window.location.href = "login.html";
  }).catch((error) => {
    alert("حدث خطأ أثناء التسجيل: " + error.message);
  });
};

// تسجيل دخول
window.login = function () {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  if (!username || !password) return alert("يرجى إدخال اسم المستخدم وكلمة السر");

  const dbRef = ref(db);
  get(child(dbRef, `users/${username}`)).then((snapshot) => {
    if (snapshot.exists()) {
      const user = snapshot.val();
      if (user.password === password) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        alert("تم تسجيل الدخول بنجاح");
        window.location.href = "chat.html";
      } else {
        alert("كلمة المرور غير صحيحة");
      }
    } else {
      alert("المستخدم غير موجود");
    }
  });
};
