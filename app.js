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
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

// تسجيل الدخول
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then(user => {
            showChat(user.user);
        })
        .catch(error => alert(error.message));
}

// إنشاء حساب
function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(user => {
            showChat(user.user);
        })
        .catch(error => alert(error.message));
}

// تسجيل الخروج
function logout() {
    auth.signOut().then(() => {
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('chat-section').style.display = 'none';
    });
}

// عرض الدردشة
function showChat(user) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('chat-section').style.display = 'block';
    document.getElementById('user-email').innerText = user.email;
    loadMessages();
}

// إرسال رسالة
function sendMessage() {
    const message = document.getElementById('message-input').value;
    const user = auth.currentUser;
    if (message !== "") {
        database.ref('messages').push({
            text: message,
            sender: user.email,
            timestamp: Date.now()
        });
        document.getElementById('message-input').value = '';
    }
}

// تحميل الرسائل
function loadMessages() {
    database.ref('messages').on('child_added', (snapshot) => {
        const messageData = snapshot.val();
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerText = ${messageData.sender}: ${messageData.text};
        document.getElementById('messages').appendChild(messageElement);
    });
}

// متابعة تسجيل الدخول التلقائي
auth.onAuthStateChanged(user => {
    if (user) {
        showChat(user);
    }
});
