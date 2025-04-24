// إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
  authDomain: "messengerapp-58f7a.firebaseapp.com",
  databaseURL: "https://messengerapp-58f7a-default-rtdb.firebaseio.com",
  projectId: "messengerapp-58f7a",
  storageBucket: "messengerapp-58f7a.appspot.com",
  messagingSenderId: "46178168523",
  appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
};
firebase.initializeApp(firebaseConfig);

const db = firebase.database();

let currentUser = JSON.parse(localStorage.getItem("user"));
let selectedFriend = null;

// تحميل الأصدقاء
function loadFriends() {
  const friendsList = document.getElementById("friends");
  friendsList.innerHTML = "";
  if (!currentUser || !currentUser.friends) return;

  currentUser.friends.forEach((friendUsername) => {
    db.ref("users/" + friendUsername).once("value", (snapshot) => {
      const friend = snapshot.val();
      if (friend) {
        const li = document.createElement("li");
        li.textContent = friend.displayName + (friend.online ? " (نشط)" : "");
        li.onclick = () => openChat(friendUsername, friend.displayName);
        friendsList.appendChild(li);
      }
    });
  });
}

// فتح محادثة خاصة
function openChat(friendUsername, friendDisplayName) {
  selectedFriend = friendUsername;
  document.getElementById("chatHeader").textContent = "الدردشة مع: " + friendDisplayName;
  document.getElementById("messagesBox").innerHTML = "";
  const chatId = getChatId(currentUser.username, friendUsername);

  db.ref("chats/" + chatId).on("value", (snapshot) => {
    const messages = snapshot.val();
    const messagesBox = document.getElementById("messagesBox");
    messagesBox.innerHTML = "";
    for (let key in messages) {
      const msg = messages[key];
      const div = document.createElement("div");
      div.className = msg.sender === currentUser.username ? "message sent" : "message received";
      div.textContent = msg.text;
      messagesBox.appendChild(div);
    }
    messagesBox.scrollTop = messagesBox.scrollHeight;
  });
}

// إرسال رسالة
function sendMessage() {
  const text = document.getElementById("messageInput").value;
  if (!text || !selectedFriend) return;

  const chatId = getChatId(currentUser.username, selectedFriend);
  const msg = {
    sender: currentUser.username,
    text: text,
    timestamp: Date.now()
  };
  db.ref("chats/" + chatId).push(msg);
  document.getElementById("messageInput").value = "";
}

// حساب معرف المحادثة المشترك بين المستخدمين
function getChatId(user1, user2) {
  return [user1, user2].sort().join("_");
}

// تسجيل الخروج
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// البحث عن مستخدم وإضافته كصديق
function searchUser() {
  const username = document.getElementById("searchInput").value.trim();
  if (!username || username === currentUser.username) return alert("اسم غير صالح");

  db.ref("users/" + username).once("value", (snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      if (!currentUser.friends.includes(username)) {
        currentUser.friends.push(username);
        db.ref("users/" + currentUser.username + "/friends").set(currentUser.friends);
        localStorage.setItem("user", JSON.stringify(currentUser));
        alert("تمت الإضافة!");
        loadFriends();
      } else {
        alert("المستخدم مضاف مسبقًا");
      }
    } else {
      alert("المستخدم غير موجود");
    }
  });
}

window.onload = () => {
  if (!currentUser) {
    window.location.href = "login.html";
  } else {
    loadFriends();
    db.ref("users/" + currentUser.username + "/online").set(true);
    window.addEventListener("beforeunload", () => {
      db.ref("users/" + currentUser.username + "/online").set(false);
    });
  }
};
