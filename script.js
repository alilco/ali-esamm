// حفظ المستخدم الحالي
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// تسجيل الخروج
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

// تحميل الأصدقاء
function loadFriends() {
  const list = document.getElementById("friendsList");
  list.innerHTML = "";
  if (!currentUser) return;

  database.ref("users/" + currentUser.username + "/friends").once("value", (snapshot) => {
    snapshot.forEach(child => {
      const friend = child.val();
      const li = document.createElement("li");
      li.innerHTML = `<a href="private-chat.html?user=${friend.username}">${friend.displayName}</a>`;
      list.appendChild(li);
    });
  });
}

// البحث عن مستخدمين
function searchUsers() {
  const query = document.getElementById("searchUser").value.toLowerCase();
  const resultList = document.getElementById("searchResults");
  resultList.innerHTML = "";

  database.ref("users").once("value", (snapshot) => {
    snapshot.forEach((child) => {
      const user = child.val();
      if (user.username !== currentUser.username && user.username.includes(query)) {
        const li = document.createElement("li");
        li.innerHTML = `${user.displayName} (${user.username}) <button onclick="addFriend('${user.username}')">إضافة</button>`;
        resultList.appendChild(li);
      }
    });
  });
}

// إضافة صديق
function addFriend(username) {
  database.ref("users/" + username).once("value", (snapshot) => {
    const friend = snapshot.val();
    if (!friend) return;

    const myRef = database.ref("users/" + currentUser.username + "/friends/" + friend.username);
    myRef.set({
      username: friend.username,
      displayName: friend.displayName
    }).then(() => {
      alert("تمت إضافة الصديق!");
    });
  });
}

// تحميل الدردشة الخاصة
function loadPrivateChat() {
  const urlParams = new URLSearchParams(window.location.search);
  const user = urlParams.get("user");
  const chatBox = document.getElementById("privateMessages");

  document.getElementById("chatWithName").innerText = `الدردشة مع ${user}`;
  database.ref("privateChats/" + createChatId(currentUser.username, user)).on("value", (snapshot) => {
    chatBox.innerHTML = "";
    snapshot.forEach(child => {
      const msg = child.val();
      const p = document.createElement("p");
      p.textContent = `${msg.from}: ${msg.text}`;
      chatBox.appendChild(p);
    });
  });
}

// إرسال رسالة خاصة
function sendPrivateMessage() {
  const urlParams = new URLSearchParams(window.location.search);
  const to = urlParams.get("user");
  const msgInput = document.getElementById("privateMsg");
  const msg = msgInput.value;

  if (msg.trim() === "") return;
  const chatId = createChatId(currentUser.username, to);
  database.ref("privateChats/" + chatId).push({
    from: currentUser.username,
    text: msg,
    time: Date.now()
  });

  msgInput.value = "";
}

// إنشاء معرف دردشة خاص
function createChatId(user1, user2) {
  return [user1, user2].sort().join("_");
}

// الوضع الليلي
function toggleMode() {
  document.body.classList.toggle("dark-mode");
}
