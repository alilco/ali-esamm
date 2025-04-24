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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// حفظ الجلسة
function saveSession(username) {
  localStorage.setItem("loggedInUser", username);
}

// التحقق من الجلسة المحفوظة
function checkSession() {
  const user = localStorage.getItem("loggedInUser");
  if (user) {
    window.location.href = "chat.html";
  }
}

// إنشاء حساب جديد
function signup(fullName, username, password) {
  if (!fullName || !username || !password) {
    alert("يرجى تعبئة جميع الحقول");
    return;
  }

  db.ref("users/" + username).once("value", snapshot => {
    if (snapshot.exists()) {
      alert("اسم المستخدم مستخدم مسبقًا");
    } else {
      db.ref("users/" + username).set({
        fullName,
        password,
        status: "نشط",
        lastSeen: new Date().toISOString(),
        messages: {}
      });

      saveSession(username);
      window.location.href = "chat.html";
    }
  });
}

// تسجيل الدخول
function login(username, password) {
  if (!username || !password) {
    alert("يرجى إدخال اسم المستخدم وكلمة المرور");
    return;
  }

  db.ref("users/" + username).once("value", snapshot => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      if (userData.password === password) {
        saveSession(username);
        window.location.href = "chat.html";
      } else {
        alert("كلمة المرور غير صحيحة");
      }
    } else {
      alert("المستخدم غير موجود");
    }
  });
}

// تسجيل الخروج
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}
