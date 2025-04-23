import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  child,
  update
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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
const db = getDatabase(app);

// الحصول على اسم المستخدم الحالي من localStorage
const currentUsername = localStorage.getItem("username");

// دالة لإضافة صديق
window.addFriend = async function () {
  const friendUsername = document.getElementById("friendUsername").value.trim();

  if (!friendUsername || friendUsername === currentUsername) {
    alert("اسم المستخدم غير صالح.");
    return;
  }

  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, `users/${friendUsername}`));
    if (snapshot.exists()) {
      const userFriendsRef = ref(db, `friends/${currentUsername}/${friendUsername}`);
      await update(userFriendsRef, {
        username: friendUsername,
        addedAt: new Date().toISOString()
      });
      alert("تمت إضافة الصديق بنجاح!");
      location.reload();
    } else {
      alert("المستخدم غير موجود.");
    }
  } catch (error) {
    console.error("خطأ في الإضافة:", error);
    alert("حدث خطأ أثناء إضافة الصديق.");
  }
};

// عرض قائمة الأصدقاء
async function showFriends() {
  const list = document.getElementById("friendsList");
  const snapshot = await get(ref(db, `friends/${currentUsername}`));
  if (snapshot.exists()) {
    const friends = snapshot.val();
    list.innerHTML = "";
    for (const key in friends) {
      const li = document.createElement("li");
      li.textContent = key;
      list.appendChild(li);
    }
  } else {
    list.innerHTML = "<li>لا يوجد أصدقاء بعد</li>";
  }
}

if (document.getElementById("friendsList")) {
  showFriends();
}
