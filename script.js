import { auth, database, signInWithEmailAndPassword, createUserWithEmailAndPassword, ref, set, push, onValue } from './firebase-config.js';

let currentUser = null;

// Elements
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesDiv = document.getElementById('messages');

// Login
loginBtn.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      authContainer.style.display = 'none';
      chatContainer.style.display = 'block';
      loadMessages();
    })
    .catch((error) => {
      alert("خطأ في تسجيل الدخول: " + error.message);
    });
});

// Register
registerBtn.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      alert("تم إنشاء الحساب بنجاح!");
    })
    .catch((error) => {
      alert("خطأ في إنشاء الحساب: " + error.message);
    });
});

// Send Message
sendBtn.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (!message) return;

  const newMessageRef = push(ref(database, 'messages'));
  set(newMessageRef, {
    uid: currentUser.uid,
    email: currentUser.email,
    message: message,
    timestamp: Date.now()
  });

  messageInput.value = '';
});

// Load Messages
function loadMessages() {
  const messagesRef = ref(database, 'messages');
  onValue(messagesRef, (snapshot) => {
    messagesDiv.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
      const messageData = childSnapshot.val();
      const messageElement = document.createElement('div');
      messageElement.textContent = `${messageData.email}: ${messageData.message}`;
      messagesDiv.appendChild(messageElement);
    });
  });
}
