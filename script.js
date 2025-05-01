import { auth, database, signInWithEmailAndPassword, createUserWithEmailAndPassword, ref, set, push, onValue } from './firebase-config.js';

let currentUser = null;

// Elements
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const usernameInput = document.getElementById('username');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesDiv = document.getElementById('messages');

// Login Button
loginBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    return alert("يرجى إدخال البريد الإلكتروني وكلمة المرور!");
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      console.log("User logged in:", currentUser);
      authContainer.style.display = 'none';
      chatContainer.style.display = 'block';
      loadMessages();
    })
    .catch((error) => {
      console.error("Error during login:", error.message);
      alert("خطأ في تسجيل الدخول: " + error.message);
    });
});

// Register Button
registerBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const username = usernameInput.value.trim();

  if (!email || !password || !username) {
    return alert("يرجى إدخال البريد الإلكتروني، كلمة المرور، واسم المستخدم!");
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      console.log("User registered:", currentUser);

      // Save username to database
      set(ref(database, `users/${currentUser.uid}`), { username })
        .then(() => {
          alert("تم إنشاء الحساب بنجاح!");
        })
        .catch((error) => {
          console.error("Error saving username:", error.message);
          alert("خطأ أثناء حفظ اسم المستخدم: " + error.message);
        });
    })
    .catch((error) => {
      console.error("Error during registration:", error.message);
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
      messageElement.classList.add('message');

      // Fetch username
      const userRef = ref(database, `users/${messageData.uid}`);
      onValue(userRef, (userSnapshot) => {
        const userData = userSnapshot.val();
        const username = userData?.username || "Unknown";
        messageElement.innerHTML = `
          <span class="username">${username}:</span> ${messageData.message}
        `;
      });

      messagesDiv.appendChild(messageElement);
    });
  });
}
