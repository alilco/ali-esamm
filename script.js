// التحقق من حالة تسجيل الدخول
window.onload = function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "login.html";
  } else {
    loadFriends();
  }
};

// تحميل الأصدقاء من users.json
function loadFriends() {
  fetch("users.json")
    .then((res) => res.json())
    .then((users) => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const friends = users.filter(user => user.username !== currentUser.username);
      const list = document.getElementById("friendsList");
      list.innerHTML = "";

      friends.forEach(friend => {
        const friendDiv = document.createElement("div");
        friendDiv.className = "friend";
        friendDiv.innerHTML = `
          <p>${friend.displayName}</p>
          <button onclick="openChat('${friend.username}')">مراسلة</button>
        `;
        list.appendChild(friendDiv);
      });
    });
}

// تسجيل الخروج
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

// الذهاب للإعدادات
function goToSettings() {
  window.location.href = "settings.html";
}

// البحث عن صديق
function searchFriend() {
  const username = document.getElementById("searchUser").value.trim();
  if (!username) return;

  fetch("users.json")
    .then(res => res.json())
    .then(users => {
      const user = users.find(u => u.username === username);
      if (user) {
        openChat(user.username);
      } else {
        alert("المستخدم غير موجود");
      }
    });
}

// فتح صفحة دردشة خاصة
function openChat(username) {
  localStorage.setItem("chatWith", username);
  window.location.href = "private-chat.html";
}
