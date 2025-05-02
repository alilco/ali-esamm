// app.js
import {
  messagesRef,
  push,
  onValue,
  set,
  remove,
  auth,
  signInAnonymously,
  onAuthStateChanged
} from './firebase.js';

const chatBox = document.getElementById('chat-box');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const darkModeBtn = document.getElementById('darkModeToggle');

let username = localStorage.getItem('username') || 'مستخدم';
let currentUser = null;

// الانتظار حتى يتم تسجيل الدخول
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    console.log("المستخدم مسجل دخول:", user.uid);
    loadMessages();
  } else {
    await signInAnonymously(auth).catch(console.error);
  }
});

// تحميل الرسائل
function loadMessages() {
  onValue(messagesRef, (snapshot) => {
    chatBox.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
      const msg = childSnapshot.val();
      addMessageToChat(msg.text, msg.sender, msg.time, childSnapshot.key, msg.uid);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// إرسال رسالة جديدة
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser) {
    alert("جارٍ تسجيل الدخول... انتظر لحظة");
    return;
  }

  const text = messageInput.value.trim();
  if (text !== '') {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // إذا كان الإنترنت متوفرًا → أرسل إلى Firebase
    if (navigator.onLine) {
      const newMsgRef = push(messagesRef);
      set(newMsgRef, {
        text,
        sender: username,
        time,
        uid: currentUser.uid
      });
    } else {
      // غير متصل؟ احفظ محليًا
      saveLocalMessage(text);
      alert("أنت غير متصل. سيتم حفظ رسالتك وسيتم إرسالها تلقائيًا عند استعادة الاتصال.");
    }

    messageInput.value = '';
  }
});

// عرض الرسائل في الشات
function addMessageToChat(text, sender, time, key, uid) {
  const div = document.createElement('div');
  div.className = 'message';
  if (sender === username) {
    div.classList.add('user');
  }

  div.innerHTML = `
    <strong>${sender}</strong><br/>
    ${text}<br/>
    <small>${time}</small>
    ${uid === currentUser?.uid ? `<button onclick="deleteMessage('${key}')">🗑️ حذف</button>` : ''}
  `;
  chatBox.appendChild(div);
}

// حذف رسالة (للمستخدم فقط)
window.deleteMessage = (key) => {
  remove(ref(getDatabase(), 'messages/' + key));
};

// تخزين الرسائل محليًا عند انقطاع الإنترنت
function saveLocalMessage(text) {
  const offlineMsgs = JSON.parse(localStorage.getItem('offlineMessages') || '[]');
  offlineMsgs.push({ text, time: new Date().toLocaleTimeString() });
  localStorage.setItem('offlineMessages', JSON.stringify(offlineMsgs));
}

// إعادة إرسال الرسائل غير المرسلة عند العودة للإنترنت
function sendOfflineMessages() {
  const offlineMsgs = JSON.parse(localStorage.getItem('offlineMessages') || '[]');
  if (offlineMsgs.length > 0) {
    offlineMsgs.forEach(msg => {
      const newMsgRef = push(messagesRef);
      set(newMsgRef, {
        text: msg.text,
        sender: username,
        time: msg.time,
        uid: currentUser?.uid
      });
    });
    localStorage.removeItem('offlineMessages');
  }
}

// الاستماع لتغيير حالة الاتصال
window.addEventListener('online', () => {
  alert("تم استعادة الاتصال. جارٍ إرسال الرسائل غير المرسلة...");
  sendOfflineMessages();
});

// وضع ليلي / Dark Mode
darkModeBtn.onclick = () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
};

if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}
