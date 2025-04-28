// استيراد الوظائف اللازمة من مكتبات Firebase
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, update } from "firebase/database";

// إعدادات Firebase الخاصة بك
const firebaseConfig = {
  apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
  authDomain: "messengerapp-58f7a.firebaseapp.com",
  databaseURL: "https://messengerapp-58f7a-default-rtdb.firebaseio.com",
  projectId: "messengerapp-58f7a",
  storageBucket: "messengerapp-58f7a.appspot.com",
  messagingSenderId: "46178168523",
  appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ربط صفحة تسجيل الدخول `login.html`
const loginButton = document.getElementById("loginButton");
loginButton.addEventListener("click", (e) => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // حفظ بيانات المستخدم عند تسجيل الدخول
            window.location.href = "chat.html"; // توجيه المستخدم إلى صفحة المحادثة
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert("خطأ في تسجيل الدخول: " + errorMessage);
        });
});

// ربط صفحة إنشاء الحساب `signup.html`
const signupButton = document.getElementById("signupButton");
signupButton.addEventListener("click", (e) => {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // حفظ بيانات المستخدم عند إنشاء الحساب
            window.location.href = "login.html"; // توجيه المستخدم إلى صفحة تسجيل الدخول بعد إنشاء الحساب
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert("خطأ في إنشاء الحساب: " + errorMessage);
        });
});

// التحقق من حالة المستخدم وتوجيهه إلى صفحة الدردشة مباشرة إذا كان قد سجل الدخول مسبقاً
onAuthStateChanged(auth, (user) => {
    if (user) {
        // إذا كان المستخدم مسجلاً دخوله، توجيه مباشرة إلى صفحة الدردشة
        window.location.href = "chat.html";
    }
});

// إضافة ميزة تعديل الملف الشخصي في `profile.html`
const editProfileButton = document.getElementById("editProfileButton");
editProfileButton.addEventListener("click", (e) => {
    const user = auth.currentUser;
    const username = document.getElementById("username").value;
    const bio = document.getElementById("bio").value;
    const profileImage = document.getElementById("profileImage").files[0];
    
    if (user) {
        // تحديث بيانات المستخدم في Firebase
        const userRef = ref(db, 'users/' + user.uid);
        update(userRef, {
            username: username,
            bio: bio,
            profileImage: profileImage ? profileImage.name : ''
        }).then(() => {
            alert("تم تحديث الملف الشخصي");
            window.location.href = "profile.html";
        }).catch((error) => {
            alert("حدث خطأ أثناء تحديث الملف الشخصي: " + error.message);
        });
    }
});

// تفعيل الوضع الليلي في `darkmode`
const darkModeButton = document.getElementById("darkModeButton");
darkModeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    // حفظ حالة الوضع في Firebase إذا لزم الأمر
    const user = auth.currentUser;
    if (user) {
        const userRef = ref(db, 'users/' + user.uid);
        update(userRef, {
            darkMode: document.body.classList.contains("dark-mode")
        });
    }
});

// إضافة ميزة آخر ظهور `lastseen`
const updateLastSeen = () => {
    const user = auth.currentUser;
    if (user) {
        const lastSeenRef = ref(db, 'users/' + user.uid + '/lastSeen');
        update(lastSeenRef, {
            lastSeen: new Date().toISOString()
        });
    }
};

// تحديث آخر ظهور عند تحميل الصفحة أو عند التفاعل
window.addEventListener("load", updateLastSeen);
window.addEventListener("click", updateLastSeen);

// إضافة ميزة إضافة الأصدقاء في `friends.html`
const addFriendButton = document.getElementById("addFriendButton");
addFriendButton.addEventListener("click", (e) => {
    const friendUsername = document.getElementById("friendUsername").value;
    const user = auth.currentUser;

    if (user && friendUsername) {
        // إضافة صديق في Firebase
        const userRef = ref(db, 'users/' + user.uid + '/friends');
        set(userRef, {
            [friendUsername]: true
        }).then(() => {
            alert("تم إضافة الصديق");
            window.location.href = "friends.html"; // توجيه المستخدم إلى صفحة الأصدقاء
        }).catch((error) => {
            alert("خطأ في إضافة الصديق: " + error.message);
        });
    }
});

// إرسال الرسائل في `chat.html`
const sendMessageButton = document.getElementById("sendMessageButton");
sendMessageButton.addEventListener("click", () => {
    const message = document.getElementById("messageInput").value;
    const user = auth.currentUser;

    if (user && message) {
        const messagesRef = ref(db, 'messages/');
        const newMessageRef = messagesRef.push();
        set(newMessageRef, {
            sender: user.uid,
            message: message,
            timestamp: new Date().toISOString()
        }).then(() => {
            alert("تم إرسال الرسالة");
            document.getElementById("messageInput").value = ""; // مسح النص بعد الإرسال
        }).catch((error) => {
            alert("حدث خطأ أثناء إرسال الرسالة: " + error.message);
        });
    }
});
