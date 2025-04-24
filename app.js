// بيانات المستخدمين المخزنة
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let messages = JSON.parse(localStorage.getItem("messages")) || {};

function saveToStorage() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("messages", JSON.stringify(messages));
}

// تسجيل الدخول
function login(username, password) {
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    location.href = "chat.html";
  } else {
    alert("اسم المستخدم أو كلمة المرور غير صحيحة.");
  }
}

// إنشاء حساب
function signup(username, password) {
  if (users.find(u => u.username === username)) {
    alert("اسم المستخدم مستخدم بالفعل.");
    return;
  }
  const newUser = { username, password, friends: [], lastSeen: new Date().toISOString() };
  users.push(newUser);
  saveToStorage();
  alert("تم إنشاء الحساب! يمكنك تسجيل الدخول الآن.");
  location.href = "login.html";
}

// تسجيل الخروج
function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  location.href = "login.html";
}

// إضافة صديق
function addFriend(friendUsername) {
  const friend = users.find(u => u.username === friendUsername);
  if (!friend) {
    alert("المستخدم غير موجود.");
    return;
  }
  if (!currentUser.friends.includes(friendUsername)) {
    currentUser.friends.push(friendUsername);
    friend.friends.push(currentUser.username);
    saveToStorage();
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    alert("تمت إضافة الصديق.");
  } else {
    alert("الصديق موجود مسبقاً.");
  }
}

// إرسال رسالة
function sendMessage(to, text) {
  const key = [currentUser.username, to].sort().join("_");
  if (!messages[key]) messages[key] = [];
  messages[key].push({ from: currentUser.username, text, time: new Date().toLocaleString() });
  saveToStorage();
  loadMessages(to);
}

// تحميل الرسائل
function loadMessages(withUser) {
  const key = [currentUser.username, withUser].sort().join("_");
  const chatBox = document.getElementById("chat-messages");
  chatBox.innerHTML = "";

  (messages[key] || []).forEach(msg => {
    const div = document.createElement("div");
    div.className = "message";
    div.textContent = `${msg.from === currentUser.username ? "أنت" : withUser}: ${msg.text}`;
    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

// عرض قائمة الأصدقاء
function showFriends() {
  const list = document.getElementById("friends-list");
  list.innerHTML = "";
  currentUser.friends.forEach(friendName => {
    const div = document.createElement("div");
    div.textContent = friendName;
    div.className = "user-item";
    div.onclick = () => openChat(friendName);
    list.appendChild(div);
  });
}

// فتح دردشة مع صديق
function openChat(friendName) {
  document.getElementById("chat-header").textContent = `الدردشة مع: ${friendName}`;
  document.getElementById("send-btn").onclick = () => {
    const msg = document.getElementById("msg").value;
    if (msg) {
      sendMessage(friendName, msg);
      document.getElementById("msg").value = "";
    }
  };
  loadMessages(friendName);
}

// البحث عن مستخدم
function searchUsers(query) {
  const resultBox = document.getElementById("search-results");
  resultBox.innerHTML = "";
  users.filter(u => u.username.includes(query) && u.username !== currentUser.username)
    .forEach(user => {
      const div = document.createElement("div");
      div.textContent = user.username;
      div.className = "user-item";
      div.onclick = () => addFriend(user.username);
      resultBox.appendChild(div);
    });
}
