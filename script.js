// إعدادات Firebase (ضع معلومات مشروعك هنا)
const firebaseConfig = {
  apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
  authDomain: "messengerapp-58f7a.firebaseapp.com",
  databaseURL: "https://messengerapp-58f7a-default-rtdb.firebaseio.com",
  projectId: "messengerapp-58f7a",
  storageBucket: "messengerapp-58f7a.firebasestorage.app",
  messagingSenderId: "46178168523",
  appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
};

// بدء Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// جلب اسم المستخدم
const username = localStorage.getItem("username");
document.getElementById("userDisplay").innerText = username;

// زر الإرسال
document.getElementById("sendBtn").addEventListener("click", () => {
  const recipient = document.getElementById("recipientInput").value.trim();
  const message = document.getElementById("messageInput").value.trim();

  if (recipient && message) {
    const msgData = {
      from: username,
      to: recipient,
      message: message,
      time: Date.now()
    };

    db.ref("messages").push(msgData);
    document.getElementById("messageInput").value = "";
  }
});

// عرض الرسائل
db.ref("messages").on("child_added", (snapshot) => {
  const data = snapshot.val();
  if ((data.to === username || data.from === username)) {
    const msg = [${data.from} إلى ${data.to}]: ${data.message};
    const li = document.createElement("li");
    li.textContent = msg;
    document.getElementById("chatBox").appendChild(li);
  }
});
