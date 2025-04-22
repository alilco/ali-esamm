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

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const username = localStorage.getItem('username');
if (!username) window.location.href = "index.html";

document.getElementById('userDisplay').textContent = username;

// تسجيل المستخدم في قاعدة البيانات
db.ref('users/' + username).set(true);

// تحميل قائمة المستخدمين
db.ref('users').on('value', snapshot => {
  const users = snapshot.val();
  const select = document.getElementById('receiverSelect');
  select.innerHTML = '<option disabled selected>اختر مستخدم للمراسلة</option>';

  for (let user in users) {
    if (user !== username) {
      const option = document.createElement('option');
      option.value = user;
      option.textContent = user;
      select.appendChild(option);
    }
  }
});

// إرسال رسالة
function sendMessage() {
  const receiver = document.getElementById('receiverSelect').value;
  const message = document.getElementById('messageInput').value.trim();
  if (!receiver || !message) return;

  const chatId = username < receiver ? ${username}_${receiver} : ${receiver}_${username};
  const messageData = {
    sender: username,
    receiver: receiver,
    message: message,
    timestamp: Date.now()
  };

  db.ref('chats/' + chatId).push(messageData);
  document.getElementById('messageInput').value = '';
}

// عرض الرسائل
document.getElementById('receiverSelect').addEventListener('change', function () {
  const receiver = this.value;
  const chatId = username < receiver ? ${username}_${receiver} : ${receiver}_${username};
  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML = '...تحميل الرسائل';

  db.ref('chats/' + chatId).off(); // تنظيف المستمع القديم

  db.ref('chats/' + chatId).on('value', snapshot => {
    const messages = snapshot.val();
    messagesDiv.innerHTML = '';
    for (let key in messages) {
      const msg = messages[key];
      const div = document.createElement('div');
      div.textContent = ${msg.sender}: ${msg.message};
      div.style.textAlign = msg.sender === username ? 'right' : 'left';
      messagesDiv.appendChild(div);
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
});