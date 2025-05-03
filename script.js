// إعدادات Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
    authDomain: "messengerapp-58f7a.firebaseapp.com",
    projectId: "messengerapp-58f7a",
    storageBucket: "messengerapp-58f7a.appspot.com",
    messagingSenderId: "46178168523",
    appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// تسجيل الدخول
document.getElementById('register-button').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // حفظ اسم المستخدم في Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            username: username
        });

        // التحويل إلى صفحة الدردشة
        window.location.href = 'chat.html?uid=' + userCredential.user.uid;
    } catch (error) {
        console.error("خطأ في التسجيل: ", error);
    }
});
