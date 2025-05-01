import { auth, database, signInWithEmailAndPassword, createUserWithEmailAndPassword, ref, set, push, onValue } from './firebase-config.js';

let currentUser = null;

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    // Redirect to chat page if not already there
    if (!window.location.href.includes("chat.html")) {
      window.location.href = "chat.html";
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const usernameInput = document.getElementById("username");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        alert("يرجى إدخال البريد وكلمة المرور");
        return;
      }

      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          console.log("تم تسجيل الدخول");
        })
        .catch((error) => {
          alert("خطأ في تسجيل الدخول: " + error.message);
        });
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      const username = usernameInput.value.trim();

      if (!email || !password || !username) {
        alert("يرجى إدخال جميع البيانات");
        return;
      }

      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          currentUser = userCredential.user;
          // Save username
          set(ref(database, "users/" + currentUser.uid), { username });
          alert("تم التسجيل بنجاح!");
        })
        .catch((error) => {
          alert("خطأ في التسجيل: " + error.message);
        });
    });
  }

  // Chat Page Logic
  const sendBtn = document.getElementById("send-btn");
  const messageInput = document.getElementById("message-input");
  const messagesDiv = document.getElementById("messages");

  if (sendBtn && messageInput && messagesDiv) {
    sendBtn.addEventListener("click", () => {
      const message = messageInput.value.trim();
      if (!message) return;

      const newMessageRef = push(ref(database, "messages"));
      set(newMessageRef, {
        uid: currentUser.uid,
        message: message,
        timestamp: Date.now(),
      });

      messageInput.value = "";
    });

    function loadMessages() {
      const messagesRef = ref(database, "messages");
      onValue(messagesRef, (snapshot) => {
        messagesDiv.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
          const msg = childSnapshot.val();
          const msgDiv = document.createElement("div");
          msgDiv.className = "message";

          const userRef = ref(database, "users/" + msg.uid);
          onValue(userRef, (userSnapshot) => {
            const userData = userSnapshot.val();
            const username = userData?.username || "مستخدم";
            msgDiv.textContent = `${username}: ${msg.message}`;
          });

          messagesDiv.appendChild(msgDiv);
        });
      });
    }

    loadMessages();
  }
});
