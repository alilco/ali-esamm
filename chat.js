import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  ref,
  push,
  onChildAdded,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// استخرج معرف الصديق من الرابط
const urlParams = new URLSearchParams(window.location.search);
const friendId = urlParams.get("id");

onAuthStateChanged(auth, async user => {
  if (!user) return (window.location.href = "login.html");

  const myId = user.uid;
  const chatId = myId < friendId ? myId + "_" + friendId : friendId + "_" + myId;

  // جلب معلومات الصديق
  const friendSnap = await get(child(ref(db), "users/" + friendId));
  if (friendSnap.exists()) {
    const data = friendSnap.val();
    document.getElementById("friendName").textContent = data.displayName;
    document.getElementById("friendStatus").textContent = data.status || "غير متصل";
    document.getElementById("friendImage").src = data.profileImage || "assets/default.png";
  }

  // إرسال رسالة
  document.getElementById("sendBtn").addEventListener("click", () => {
    const message = document.getElementById("messageInput").value.trim();
    if (message === "") return;

    const msgRef = ref(db, "messages/" + chatId);
    push(msgRef, {
      sender: myId,
      text: message,
      time: new Date().toISOString()
    });

    document.getElementById("messageInput").value = "";
  });

  // عرض الرسائل
  const chatBox = document.getElementById("chatBox");
  const msgRef = ref(db, "messages/" + chatId);
  onChildAdded(msgRef, snapshot => {
    const msg = snapshot.val();
    const div = document.createElement("div");
    div.className = msg.sender === myId ? "message sent" : "message received";
    div.innerHTML = `<p>${msg.text}</p>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
});
