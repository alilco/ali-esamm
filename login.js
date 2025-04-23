// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
  authDomain: "messengerapp-58f7a.firebaseapp.com",
  databaseURL: "https://messengerapp-58f7a-default-rtdb.firebaseio.com",
  projectId: "messengerapp-58f7a",
  storageBucket: "messengerapp-58f7a.appspot.com",
  messagingSenderId: "46178168523",
  appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
};

// بدء Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// زر تسجيل الدخول
document.getElementById("loginBtn").addEventListener("click", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("يرجى إدخال اسم المستخدم وكلمة المرور");
    return;
  }

  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, `users/${username}`));
    if (snapshot.exists()) {
      const userData = snapshot.val();
      if (userData.password === password) {
        // حفظ الجلسة
        sessionStorage.setItem("user", JSON.stringify(userData));
        window.location.href = "chat.html";
      } else {
        alert("كلمة المرور غير صحيحة");
      }
    } else {
      alert("اسم المستخدم غير موجود");
    }
  } catch (error) {
    console.error(error);
    alert("حدث خطأ أثناء تسجيل الدخول");
  }
});
