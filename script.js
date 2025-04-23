// script.js

const db = firebase.database();

// تسجيل مستخدم جديد
function register(fullName, username, password) {
  db.ref("users/" + username).once("value").then(snapshot => {
    if (snapshot.exists()) {
      alert("اسم المستخدم موجود بالفعل");
    } else {
      db.ref("users/" + username).set({
        fullName,
        username,
        password,
        active: true,
        lastSeen: new Date().toISOString(),
        bio: "",
        profileImage: "default.png",
        friends: {}
      }).then(() => {
        localStorage.setItem("username", username);
        window.location.href = "chat.html";
      });
    }
  });
}

// تسجيل الدخول
function login(username, password) {
  db.ref("users/" + username).once("value").then(snapshot => {
    if (snapshot.exists() && snapshot.val().password === password) {
      localStorage.setItem("username", username);
      db.ref("users/" + username + "/active").set(true);
      window.location.href = "chat.html";
    } else {
      alert("بيانات الدخول غير صحيحة");
    }
  });
}

// إضافة صديق
function addFriend(friendUsername) {
  const myUsername = localStorage.getItem("username");
  if (myUsername === friendUsername) return alert("لا يمكنك إضافة نفسك!");

  db.ref("users/" + friendUsername).once("value").then(snapshot => {
    if (snapshot.exists()) {
      // إضافة كل واحد لقائمة أصدقاء الآخر
      db.ref("users/" + myUsername + "/friends/" + friendUsername).set(true);
      db.ref("users/" + friendUsername + "/friends/" + myUsername).set(true);
      window.location.href = "chat.html?user=" + friendUsername;
    } else {
      alert("المستخدم غير موجود");
    }
  });
}

// جلب بيانات المستخدم في الملف الشخصي
function loadProfile() {
  const username = localStorage.getItem("username");
  if (!username) return;

  db.ref("users/" + username).once("value").then(snapshot => {
    const user = snapshot.val();
    document.getElementById("username").innerText = user.username;
    document.getElementById("fullname").innerText = user.fullName;
    document.getElementById("bio").innerText = user.bio;
    document.getElementById("profile-image").src = user.profileImage;
  });
}

// تعديل الملف الشخصي
function updateProfile(fullName, bio, imageUrl) {
  const username = localStorage.getItem("username");
  db.ref("users/" + username).update({
    fullName,
    bio,
    profileImage: imageUrl
  }).then(() => {
    alert("تم حفظ التعديلات");
    window.location.href = "profile.html";
  });
}

// تحديث آخر ظهور
function updateLastSeen() {
  const username = localStorage.getItem("username");
  db.ref("users/" + username + "/lastSeen").set(new Date().toISOString());
}

// تشفير الرسائل (بسيط للتجربة فقط)
function encryptMessage(text) {
  return btoa(text); // base64
}

function decryptMessage(encoded) {
  return atob(encoded);
}
