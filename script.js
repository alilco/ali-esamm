// script.js
import { auth, database } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  deleteUser,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  ref,
  set,
  get,
  update,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// حفظ الجلسة
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadUser(user);
  } else {
    showLoginForm();
  }
});

// تسجيل مستخدم جديد
window.signup = async function () {
  const email = emailInput.value;
  const password = passwordInput.value;
  const username = usernameInput.value;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await set(ref(database, 'users/' + cred.user.uid), {
      username: username,
      email: email,
      profileImage: '',
      status: 'online',
      lastSeen: Date.now()
    });
    await sendEmailVerification(cred.user);
    alert("تم إنشاء الحساب. تحقق من بريدك الإلكتروني.");
  } catch (err) {
    alert(err.message);
  }
}

// تسجيل الدخول
window.login = async function () {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    await update(ref(database, 'users/' + userCred.user.uid), {
      status: 'online'
    });
    loadUser(userCred.user);
  } catch (err) {
    alert(err.message);
  }
}

// تسجيل الخروج
window.logout = async function () {
  const user = auth.currentUser;
  if (user) {
    await update(ref(database, 'users/' + user.uid), {
      status: 'offline',
      lastSeen: Date.now()
    });
  }
  await signOut(auth);
}

// إرسال إعادة تعيين كلمة المرور
window.resetPassword = function () {
  const email = prompt("أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور:");
  if (email) {
    sendPasswordResetEmail(auth, email)
      .then(() => alert("تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني."))
      .catch(err => alert(err.message));
  }
}

// حذف الحساب
window.deleteAccount = async function () {
  const user = auth.currentUser;
  if (confirm("هل أنت متأكد من حذف حسابك؟")) {
    await remove(ref(database, 'users/' + user.uid));
    await deleteUser(user);
    alert("تم حذف الحساب.");
  }
}

// تعديل الملف الشخصي
window.updateProfileInfo = async function () {
  const user = auth.currentUser;
  const displayName = document.getElementById('displayName').value;
  const profileImage = document.getElementById('profileImage').value;

  await update(ref(database, 'users/' + user.uid), {
    username: displayName,
    profileImage: profileImage
  });

  await updateProfile(user, {
    displayName: displayName,
    photoURL: profileImage
  });

  alert("تم تعديل الملف الشخصي.");
}

// تحميل بيانات المستخدم
function loadUser(user) {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('chat-section').style.display = 'block';
  const userRef = ref(database, 'users/' + user.uid);
  onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    document.getElementById('usernameDisplay').innerText = data.username;
    document.getElementById('statusDisplay').innerText = data.status;
    document.getElementById('profilePic').src = data.profileImage || 'default.png';
  });
}

// عرض نموذج الدخول
function showLoginForm() {
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('chat-section').style.display = 'none';
}
