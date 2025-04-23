import app from './firebase-config.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const auth = getAuth(app);
const db = getDatabase(app);
const chatBox = document.getElementById("chat-box");

onAuthStateChanged(auth, (user) => {
  if (user) {
    const messagesRef = ref(db, 'messages');
    onChildAdded(messagesRef, (data) => {
      const msg = data.val();
      const msgEl = document.createElement("div");
      msgEl.textContent = msg.name + ": " + (msg.imageURL || msg.text);
      chatBox.appendChild(msgEl);
    });

    window.sendMessage = function () {
      const message = document.getElementById("messageInput").value;
      const fileInput = document.getElementById("imageInput");

      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          push(messagesRef, { name: user.email, imageURL: reader.result });
        };
        reader.readAsDataURL(file);
      } else {
        push(messagesRef, { name: user.email, text: message });
      }
      document.getElementById("messageInput").value = "";
      fileInput.value = "";
    };
  } else {
    window.location.href = "index.html";
  }
};
