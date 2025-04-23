// chat.js
import { db, auth } from "./firebase-config.js";
import {
  ref,
  push,
  onChildAdded,
  set
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const uid = localStorage.getItem("uid");
const msgRef = ref(db, "messages");

onAuthStateChanged(auth, user => {
  if (!user) window.location.href = "index.html";
});

document.getElementById("imageInput").addEventListener("change", function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    sendMessage(reader.result, true);
  };
  reader.readAsDataURL(file);
});

window.sendMessage = () => {
  const text = document.getElementById("messageInput").value;
  if (text.trim() !== "") {
    sendMessage(text, false);
    document.getElementById("messageInput").value = "";
  }
};

function sendMessage(content, isImage) {
  push(msgRef, {
    sender: uid,
    content,
    isImage,
    time: new Date().toISOString()
  });
}

onChildAdded(msgRef, snapshot => {
  const msg = snapshot.val();
  const msgDiv = document.createElement("div");
  msgDiv.className = "msg";
  msgDiv.innerHTML = msg.isImage ? `<img src="${msg.content}" style="max-width: 200px;">` : msg.content;
  document.getElementById("messages").appendChild(msgDiv);
});
