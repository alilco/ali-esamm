// إعداد Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
    authDomain: "messengerapp-58f7a.firebaseapp.com",
    databaseURL: "https://messengerapp-58f7a-default-rtdb.firebaseio.com",
    projectId: "messengerapp-58f7a",
    storageBucket: "messengerapp-58f7a.firebasestorage.app",
    messagingSenderId: "46178168523",
    appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
};

const app = firebase.initializeApp(firebaseConfig);

// التعامل مع نموذج التسجيل
document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault(); // منع الإرسال التلقائي للنموذج

    // جمع البيانات من النموذج
    const fullName = document.getElementById('full-name').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (fullName && username && password) {
        // التسجيل باستخدام Firebase Auth
        firebase.auth().createUserWithEmailAndPassword(username + "@gmail.com", password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("تم التسجيل بنجاح:", user);

                // حفظ بيانات المستخدم في Firebase Database
                firebase.database().ref('users/' + user.uid).set({
                    fullName: fullName,
                    username: username,
                    bio: "",
                    profileImage: "default.png",
                    active: false,
                    lastSeen: ""
                }).then(() => {
                    // إعادة التوجيه بعد التسجيل الناجح
                    window.location.href = "profile.html";
                }).catch((error) => {
                    console.error("حدث خطأ أثناء حفظ البيانات:", error);
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("خطأ في التسجيل:", errorCode, errorMessage);
                alert("حدث خطأ أثناء التسجيل: " + errorMessage);
            });
    } else {
        alert("الرجاء ملء جميع الحقول.");
    }
});

// التعامل مع نموذج تسجيل الدخول
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // منع الإرسال التلقائي للنموذج

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        // تسجيل الدخول باستخدام Firebase Auth
        firebase.auth().signInWithEmailAndPassword(username + "@gmail.com", password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("تم تسجيل الدخول بنجاح:", user);
                window.location.href = "profile.html"; // تحويل إلى صفحة الملف الشخصي
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("خطأ في تسجيل الدخول:", errorCode, errorMessage);
                alert("حدث خطأ أثناء تسجيل الدخول: " + errorMessage);
            });
    } else {
        alert("الرجاء ملء جميع الحقول.");
    }
});
