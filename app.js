import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, onValue } from "firebase/database";

// Firebase initialization
const firebaseConfig = {
    // Add your firebaseConfig here
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// تسجيل الدخول
document.getElementById("loginBtn").onclick = () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert('تم تسجيل الدخول');
            document.getElementById('auth').style.display = 'none';
            document.getElementById('chat').style.display = 'block';
            loadMessages();
        })
        .catch((error) => {
            alert('خطأ في تسجيل الدخول: ' + error.message);
        });
};

// إنشاء حساب
document.getElementById("registerBtn").onclick = () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            alert('تم إنشاء الحساب');
        })
        .catch((error) => {
            alert('خطأ في إنشاء الحساب: ' + error.message);
        });
};

// إرسال رسالة
document.getElementById("sendMessageBtn").onclick = () => {
    const message = document.getElementById("messageInput").value;
    const userId = auth.currentUser.uid;

    const messageRef = ref(db, 'messages/' + Date.now());
    set(messageRef, {
        userId,
        message,
        timestamp: Date.now()
    });

    document.getElementById("messageInput").value = '';
};

// التحميل واستعراض الرسائل
function loadMessages() {
    const messagesRef = ref(db, 'messages/');
    onValue(messagesRef, (snapshot) => {
        const messages = snapshot.val();
        const messagesDiv = document.getElementById("messages");
        messagesDiv.innerHTML = '';
        for (const key in messages) {
            const msg = messages[key];
            messagesDiv.innerHTML += `<div>${msg.userId}: ${msg.message}</div>`;
        }
    });
}

// إضافة مستخدم جديد (انتبه لأمان التطبيق عند توفير هذه الميزة)
document.getElementById("addUserBtn").onclick = () => {
    const username = prompt("أدخل اسم المستخدم:");

    const usersRef = ref(db, 'users/' + username);
    set(usersRef, {
        username
    }).then(() => {
        alert("تم إضافة المستخدم!");
    }).catch((error) => {
        alert("خطأ: " + error.message);
    });
};
