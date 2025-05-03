// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, orderBy, query } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

// Your web app's Firebase configuration
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
const db = getFirestore(app);

// إرسال رسالة
document.getElementById('send-button').addEventListener('click', async () => {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();

    if (messageText !== '') {
        try {
            await addDoc(collection(db, "messages"), {
                text: messageText,
                timestamp: new Date()
            });
            messageInput.value = ''; // مسح حقل الإدخال بعد الإرسال
            console.log("تم إرسال الرسالة: ", messageText);
        } catch (error) {
            console.error("خطأ في إرسال الرسالة: ", error);
        }
    }
});

// استقبال الرسائل
const messagesRef = query(collection(db, "messages"), orderBy("timestamp"));
onSnapshot(messagesRef, (snapshot) => {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = ''; // مسح الرسائل القديمة
    snapshot.forEach(doc => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');
        messageElement.textContent = doc.data().text;
        chatBox.appendChild(messageElement);
    });
});
