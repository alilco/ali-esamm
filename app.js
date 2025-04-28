import { db } from './firebase-config.js';
import { getDatabase, ref, get, push, set } from "firebase/database";

// تحميل البيانات عند فتح الصفحة
window.onload = function() {
    loadUserProfile("UserID"); // ضع هنا معرف المستخدم
    loadMessages();
    loadFriends("UserID"); // ضع هنا معرف المستخدم
}

// تحميل البيانات الخاصة بالمستخدم (الصورة والاسم)
function loadUserProfile(userId) {
    const userRef = ref(db, 'users/' + userId);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            document.getElementById('profile-image').src = userData.profileImage;
            document.getElementById('username').textContent = userData.username;
        } else {
            console.log("User data not found");
        }
    });
}

// جلب الرسائل من Firebase وعرضها
function loadMessages() {
    const messagesRef = ref(db, 'messages/');
    get(messagesRef).then((snapshot) => {
        if (snapshot.exists()) {
            const messages = snapshot.val();
            displayMessages(messages);
        } else {
            console.log("No messages data found");
        }
    });
}

// عرض الرسائل
function displayMessages(messages) {
    const messagesList = document.getElementById('messages-list');
    messagesList.innerHTML = ''; // مسح الرسائل القديمة

    for (let key in messages) {
        const msg = messages[key];
        const li = document.createElement('li');
        li.textContent = `${msg.sender}: ${msg.message}`;
        messagesList.appendChild(li);
    }
}

// إرسال رسالة جديدة
document.getElementById('send-message').addEventListener('click', function() {
    const messageText = document.getElementById('message-input').value;
    if (messageText.trim() !== '') {
        const messageRef = push(ref(db, 'messages/'));
        set(messageRef, {
            sender: "UserID", // استخدم معرف المستخدم هنا
            message: messageText,
            timestamp: Date.now()
        });
        document.getElementById('message-input').value = ''; // مسح المدخل
    }
});

// جلب الأصدقاء من Firebase وعرضهم
function loadFriends(userId) {
    const userRef = ref(db, 'users/' + userId + '/friends');
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const friends = snapshot.val();
            displayFriends(friends);
        } else {
            console.log("No friends data found");
        }
    });
}

// عرض الأصدقاء
function displayFriends(friends) {
    const friendsList = document.getElementById('friends-list');
    friendsList.innerHTML = ''; // مسح القائمة القديمة

    for (let key in friends) {
        const friend = friends[key];
        const li = document.createElement('li');
        li.textContent = friend.name;
        friendsList.appendChild(li);
    }
}
