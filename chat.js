// إعدادات Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, orderBy, query, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
    authDomain: "messengerapp-58f7a.firebaseapp.com",
    projectId: "messengerapp-58f7a",
    storageBucket: "messengerapp-58f7a.appspot.com",
    messagingSenderId: "46178168523",
    appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// الحصول على معرف المستخدم من URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('uid');

// عرض اسم المستخدم
async function displayUsername() {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
        document.getElementById('username-display').textContent = userDoc.data().username;
    }
}

displayUsername();

// إرسال رسالة
document.getElementById('send-button').addEventListener('click', async () => {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value;

    if (messageText.trim() !== '') {
        try {
            await addDoc(collection(db, "messages"), {
                text: messageText,
                userId: userId,
                timestamp: new Date()
            });
            messageInput.value = '';  // مسح حقل الإدخال بعد الإرسال
        } catch (error) {
            console.error("خطأ في إرسال الرسالة: ", error);
        }
    }
});

// استقبال الرسائل
const messagesRef = query(collection(db, "messages"), orderBy("timestamp"));
onSnapshot(messagesRef, (snapshot) => {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = '';  // مسح الرسائل الحالية
    snapshot.forEach(doc => {
        const messageElement = document.createElement('div');
        messageElement.textContent = doc.data().text;
        chatBox.appendChild(messageElement);
    });
});
