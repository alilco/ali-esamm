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
const auth = firebase.auth();

let currentUser = null;
let selectedFriend = null;

// التأكد من تسجيل الدخول
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadFriends();
  } else {
    window.location.href = "login.html";
  }
});

// تحميل الأصدقاء
function loadFriends() {
  const friendsList = document.getElementById("friendsList");
  friendsList.innerHTML = "";
  db.ref("users").once("value", snapshot => {
    snapshot.forEach(child => {
      const userData = child.val();
      if (userData.uid !== currentUser.uid) {
        const li = document.createElement("li");
        li.textContent = userData.displayName || userData.username;
        li.onclick = () => openChat(userData.uid, userData.username);
        friendsList.appendChild(li);
      }
    });
  });
}

// فتح المحادثة
function openChat(friendUid, friendUsername) {
  selectedFriend = friendUid;
  document.getElementById("chatWith").textContent = "الدردشة مع: " + friendUsername;
  listenToMessages();
}

// إرسال الرسالة
function sendMessage() {
  const msgInput = document.getElementById("messageInput");
  const message = msgInput.value.trim();
  if (!message || !selectedFriend) return;

  const encodedMessage = btoa(message); // تشفير بسيط
  const timestamp = Date.now();

  const chatId = createChatId(currentUser.uid, selectedFriend);
  const newMsgRef = db.ref(`chats/${chatId}`).push();
  newMsgRef.set({
    from: currentUser.uid,
    to: selectedFriend,
    message: encodedMessage,
    time: timestamp
  });

  msgInput.value = "";
}

// الاستماع للرسائل
function listenToMessages() {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";
  const chatId = createChatId(currentUser.uid, selectedFriend);
  db.ref(`chats/${chatId}`).on("value", snapshot => {
    messagesDiv.innerHTML = "";
    snapshot.forEach(child => {
      const data = child.val();
      const msg = document.createElement("div");
      msg.className = data.from === currentUser.uid ? "sent" : "received";
      msg.textContent = atob(data.message); // فك التشفير
      messagesDiv.appendChild(msg);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// إنشاء معرف محادثة ثابت بين شخصين
function createChatId(uid1, uid2) {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}

// تسجيل الخروج
function logout() {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}
