// إعداد Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

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

// زر إنشاء الحساب
const signupBtn = document.getElementById("signupBtn");
signupBtn.addEventListener("click", () => {
  const fullName = document.getElementById("fullName").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!fullName || !username || !password) {
    alert("يرجى ملء جميع الحقول");
    return;
  }

  const usersRef = ref(db, "users/" + username);
  get(usersRef).then(snapshot => {
    if (snapshot.exists()) {
      alert("اسم المستخدم مستخدم بالفعل");
    } else {
      set(usersRef, {
        fullName: fullName,
        username: username,
        password: password,
        bio: "",
        profileImage: "",
        lastSeen: Date.now(),
        online: true,
        friends: []
      }).then(() => {
        alert("تم إنشاء الحساب بنجاح");
        window.location.href = "login.html";
      }).catch(error => {
        console.error("فشل في إنشاء الحساب:", error);
        alert("حدث خطأ أثناء إنشاء الحساب");
      });
    }
  });
});
