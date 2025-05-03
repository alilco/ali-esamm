// إعدادات Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

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

// التعامل مع زر تسجيل الدخول أو تسجيل جديد
document.getElementById('auth-button').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;

    const feedbackElement = document.getElementById('feedback');
    feedbackElement.textContent = ""; // مسح الرسالة السابقة

    const isRegistering = document.getElementById('username').style.display !== "none";
    
    try {
        if (isRegistering) {
            // إنشاء حساب جديد
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // حفظ اسم المستخدم في Firestore
            await setDoc(doc(db, "users", userCredential.user.uid), {
                username: username
            });
            
            // عرض رسالة نجاح
            feedbackElement.textContent = "تم تسجيل الحساب بنجاح!";
            
            // الانتقال إلى صفحة الدردشة
            window.location.href = 'chat.html?uid=' + userCredential.user.uid;
        } else {
            // تسجيل دخول المستخدم
            await signInWithEmailAndPassword(auth, email, password);
            feedbackElement.textContent = "تم تسجيل الدخول بنجاح!";
            window.location.href = 'chat.html?uid=' + auth.currentUser.uid;
        }
    } catch (error) {
        // معالجة الأخطاء
        if (error.code === 'auth/invalid-email') {
            feedbackElement.textContent = "البريد الإلكتروني غير صالح.";
        } else if (error.code === 'auth/user-not-found') {
            feedbackElement.textContent = "لا يوجد حساب مرتبط بهذا البريد الإلكتروني.";
        } else if (error.code === 'auth/wrong-password') {
            feedbackElement.textContent = "كلمة مرور خاطئة.";
        } else {
            feedbackElement.textContent = "حدث خطأ: " + error.message;
        }
    }
});

// التبديل بين تسجيل الدخول و إنشاء حساب
document.getElementById('toggle-link').addEventListener('click', () => {
    const currentFormTitle = document.getElementById('form-title');
    const usernameInput = document.getElementById('username');
    const updateUsernameContainer = document.getElementById('update-username-container');

    if (usernameInput.style.display === "none") {
        // إذا كان المستخدم لا يزال في وضع تسجيل الدخول، قم بالتبديل إلى التسجيل
        usernameInput.style.display = "block";
        currentFormTitle.innerText = "تسجيل جديد";
        document.getElementById('auth-button').innerText = "سجل الآن";
        document.getElementById('toggle-link').innerText = "لديك حساب؟ تسجيل الدخول";
        updateUsernameContainer.style.display = "none"; // إخفاء تحديث اسم المستخدم
    } else {
        // إذا كان المستخدم في وضع التسجيل، قم بالتبديل إلى تسجيل الدخول
        usernameInput.style.display = "none";
        currentFormTitle.innerText = "تسجيل دخول";
        document.getElementById('auth-button').innerText = "تسجيل دخول";
        document.getElementById('toggle-link').innerText = "ليس لديك حساب؟ سجل الآن!";
    }
});

// تحديث اسم المستخدم
document.getElementById('update-button').addEventListener('click', async () => {
    const newUsername = document.getElementById('new-username').value;
    const userId = auth.currentUser.uid; // الحصول على معرف المستخدم الحالي
    const updateFeedbackElement = document.getElementById('update-feedback');

    if (newUsername.trim() !== '') {
        try {
            await updateDoc(doc(db, "users", userId), {
                username: newUsername
            });
            updateFeedbackElement.textContent = "تم تحديث اسم المستخدم بنجاح!";
        } catch (error) {
            updateFeedbackElement.textContent = "حدث خطأ أثناء تحديث اسم المستخدم: " + error.message;
        }
    } else {
        updateFeedbackElement.textContent = "يرجى إدخال اسم مستخدم جديد.";
    }
});
