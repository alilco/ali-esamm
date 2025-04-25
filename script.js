// script.js
import { auth, database } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  deleteUser,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import {
  ref,
  set,
  get,
  onValue,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// حفظ الجلسة
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadProfile(user);
    loadFriends(user.uid);
  } else {
    // إعادة توجيه لتسجيل الدخول
    console.log("User not logged in");
  }
});

// تسجيل حساب جديد
window.signup = () => {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const username = document.getElementById("signupUsername").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      const user = cred.user;
      set(ref(database, "users/" + user.uid), {
        email: email,
        username: username,
        status: "نشط",
        lastSeen: Date.now(),
        profileImage: "default.png"
      });
      alert("تم إنشاء الحساب بنجاح");
    })
    .catch((err) => alert(err.message));
};

// تسجيل دخول
window.login = () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("تم تسجيل الدخول");
    })
    .catch((err) => alert(err.message));
};

// تسجيل خروج
window.logout = () => {
  signOut(auth).then(() => alert("تم تسجيل الخروج"));
};

// تعديل الملف الشخصي
window.updateProfileData = () => {
  const user = auth.currentUser;
  const username = document.getElementById("editUsername").value;
  const status = document.getElementById("editStatus").value;
  const image = document.getElementById("editImage").value;

  update(ref(database, "users/" + user.uid), {
    username: username,
    status: status,
    profileImage: image
  }).then(() => alert("تم تحديث الملف الشخصي"));
};

// إرسال رسالة
window.sendMessage = () => {
  const user = auth.currentUser;
  const friendId = document.getElementById("chatFriendId").value;
  const message = document.getElementById("chatMessage").value;

  const messageRef = ref(database, `messages/${user.uid}_${friendId}`);
  const msgId = Date.now();
  set(ref(database, `messages/${user.uid}_${friendId}/${msgId}`), {
    from: user.uid,
    to: friendId,
    text: message,
    time: msgId
  });
};

// تحميل الملف الشخصي
function loadProfile(user) {
  get(ref(database, "users/" + user.uid)).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      document.getElementById("usernameDisplay").innerText = data.username;
      document.getElementById("statusDisplay").innerText = data.status;
      document.getElementById("profileImage").src = data.profileImage;
    }
  });
}

// إضافة صديق
window.addFriend = () => {
  const user = auth.currentUser;
  const friendUsername = document.getElementById("addFriendUsername").value;

  get(ref(database, "users")).then((snapshot) => {
    let found = false;
    snapshot.forEach((child) => {
      if (child.val().username === friendUsername) {
        const friendId = child.key;
        set(ref(database, `friends/${user.uid}/${friendId}`), true);
        set(ref(database, `friends/${friendId}/${user.uid}`), true);
        alert("تم إضافة الصديق");
        found = true;
      }
    });
    if (!found) alert("المستخدم غير موجود");
  });
};

// تحميل الأصدقاء
function loadFriends(uid) {
  const friendsRef = ref(database, "friends/" + uid);
  onValue(friendsRef, (snapshot) => {
    const list = document.getElementById("friendsList");
    list.innerHTML = "";
    snapshot.forEach((child) => {
      const friendId = child.key;
      get(ref(database, "users/" + friendId)).then((snap) => {
        if (snap.exists()) {
          const data = snap.val();
          const li = document.createElement("li");
          li.innerText = `${data.username} (${data.status})`;
          list.appendChild(li);
        }
      });
    });
  });
}

// إعادة تعيين كلمة المرور
window.resetPassword = () => {
  const email = document.getElementById("resetEmail").value;
  sendPasswordResetEmail(auth, email)
    .then(() => alert("تم إرسال رابط إعادة التعيين إلى بريدك"))
    .catch((err) => alert(err.message));
};

// حذف الحساب
window.deleteAccount = () => {
  const user = auth.currentUser;
  deleteUser(user)
    .then(() => alert("تم حذف الحساب"))
    .catch((err) => alert(err.message));
};
