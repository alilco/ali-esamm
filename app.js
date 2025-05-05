// تهيئة Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
  authDomain: "messengerapp-58f7a.firebaseapp.com",
  databaseURL: "https://messengerapp-58f7a-default-rtdb.firebaseio.com",
  projectId: "messengerapp-58f7a",
  storageBucket: "messengerapp-58f7a.firebasestorage.app",
  messagingSenderId: "46178168523",
  appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(app); // تأكد من استخدام auth بعد التهيئة
const db = firebase.database(app);

// متغيرات التطبيق
let currentUser = null;

// ========== وظائف المصادقة ==========
function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorElement = document.getElementById('auth-error');

  if (!email || !password) {
    showError(errorElement, 'الرجاء إدخال البريد الإلكتروني وكلمة السر');
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      showHome();
    })
    .catch((error) => {
      showError(errorElement, getAuthErrorMessage(error.code));
    });
}

function signUp() {
  const username = document.getElementById('username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const errorElement = document.getElementById('signup-error');

  if (!username || !email || !password) {
    showError(errorElement, 'الرجاء إدخال جميع الحقول');
    return;
  }

  if (password.length < 6) {
    showError(errorElement, 'كلمة السر يجب أن تكون 6 أحرف على الأقل');
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      return db.ref('users/' + currentUser.uid).set({
        username: username,
        email: email,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });
    })
    .then(() => {
      showLogin();
      alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول');
    })
    .catch((error) => {
      showError(errorElement, getAuthErrorMessage(error.code));
    });
}

function signOut() {
  auth.signOut().then(() => {
    currentUser = null;
    showLogin();
  }).catch((error) => {
    console.error('Error signing out:', error);
  });
}

function getAuthErrorMessage(errorCode) {
  const messages = {
    'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
    'auth/invalid-email': 'بريد إلكتروني غير صالح',
    'auth/weak-password': 'كلمة السر ضعيفة جداً',
    'auth/user-not-found': 'الحساب غير موجود',
    'auth/wrong-password': 'كلمة السر غير صحيحة'
  };
  return messages[errorCode] || 'حدث خطأ غير متوقع';
}

// ========== وظائف واجهة المستخدم ==========
function showLogin() {
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('signup-section').classList.add('hidden');
  document.getElementById('home-section').classList.add('hidden');
  clearErrors();
}

function showSignUp() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('signup-section').classList.remove('hidden');
  document.getElementById('home-section').classList.add('hidden');
  clearErrors();
}

function showHome() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('signup-section').classList.add('hidden');
  document.getElementById('home-section').classList.remove('hidden');
}

function showError(element, message) {
  element.textContent = message;
  element.classList.remove('hidden');
}

function clearErrors() {
  document.querySelectorAll('[id$="-error"]').forEach(el => {
    el.classList.add('hidden');
  });
}

// ========== إدارة الأحداث ==========
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    showHome();
  } else {
    currentUser = null;
    showLogin();
  }
});

// جعل الدوال متاحة عالمياً
window.signIn = signIn;
window.signUp = signUp;
window.signOut = signOut;
window.showSignUp = showSignUp;
window.showLogin = showLogin;
