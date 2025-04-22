import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
  authDomain: "messengerapp-58f7a.firebaseapp.com",
  databaseURL: "https://messengerapp-58f7a-default-rtdb.firebaseio.com",
  projectId: "messengerapp-58f7a",
  storageBucket: "messengerapp-58f7a.firebasestorage.app",
  messagingSenderId: "46178168523",
  appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const username = localStorage.getItem("username");
if (username && document.getElementById("userDisplay")) {
  document.getElementById("userDisplay").innerText = username;
}

const sendBtn = document.getElementById("sendBtn");
if (sendBtn) {
  sendBtn.addEventListener("click", () => {
    const recipient = document.getElementById("recipientInput").value.trim();
    const message = document.getElementById("messageInput").value.trim();

    if (recipient && message) {
      push(ref(db, "messages"), {
        from: username,
        to: recipient,
        message: message,
        time: Date.now()
      });

      document.getElementById("messageInput").value = "";
    }
  });
}

const chatBox = document.getElementById("chatBox");
if (chatBox) {
  onChildAdded(ref(db, "messages"), (snapshot) => {
    const data = snapshot.val();
    if (data.to === username || data.from === username) {
      const msg = `[${data.from} → ${data.to}]: ${data.message}`;
      const li = document.createElement("li");
      li.textContent = msg;
      chatBox.appendChild(li);
    }
  });
}
