// إعداد Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

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

// زر تسجيل الدخول
const loginBtn = document.getElementById("loginBtn");
loginBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("يرجى إدخال اسم المستخدم وكلمة المرور");
    return;
  }

  const userRef = ref(db, "users/" + username);
  get(userRef).then(snapshot => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      if (userData.password === password) {
        // تسجيل الدخول ناجح
        sessionStorage.setItem("username", username);
        update(userRef, { online: true, lastSeen: Date.now() });
        window.location.href = "chat.html";
      } else {
        alert("كلمة المرور غير صحيحة");
      }
    } else {
      alert("المستخدم غير موجود");
    }
  }).catch(error => {
    console.error("خطأ في تسجيل الدخول:", error);
    alert("حدث خطأ أثناء تسجيل الدخول");
  });
});
