// حفظ معلومات المستخدم الحالي
let currentUser = null;

// التحقق من تسجيل الدخول
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    if (window.location.pathname.includes("login") || window.location.pathname.includes("signup")) {
      window.location.href = "chat.html";
    }
    loadProfileData();
  } else {
    if (!window.location.pathname.includes("login") && !window.location.pathname.includes("signup")) {
      window.location.href = "login.html";
    }
  }
});

// تسجيل الدخول
document.getElementById("loginForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "chat.html")
    .catch(error => alert("فشل تسجيل الدخول: " + error.message));
});

// إنشاء حساب
document.getElementById("signupForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(user => {
      const userId = user.user.uid;
      const username = e.target.username.value;
      firebase.database().ref("users/" + userId).set({
        username: username,
        displayName: "",
        profileImage: "",
        bio: "",
        lastSeen: new Date().toISOString()
      });
      window.location.href = "chat.html";
    })
    .catch(error => alert("فشل إنشاء الحساب: " + error.message));
});

// تسجيل الخروج
function logout() {
  firebase.auth().signOut();
}

// تحميل الملف الشخصي
function loadProfileData() {
  if (!currentUser) return;
  firebase.database().ref("users/" + currentUser.uid).once("value", snapshot => {
    const data = snapshot.val();
    if (document.getElementById("displayName")) document.getElementById("displayName").value = data.displayName || "";
    if (document.getElementById("bio")) document.getElementById("bio").value = data.bio || "";
    if (document.getElementById("profileImage")) document.getElementById("profileImage").value = data.profileImage || "";
  });
}

// حفظ الملف الشخصي
document.getElementById("editProfileForm")?.addEventListener("submit", e => {
  e.preventDefault();
  firebase.database().ref("users/" + currentUser.uid).update({
    displayName: e.target.displayName.value,
    bio: e.target.bio.value,
    profileImage: e.target.profileImage.value
  }).then(() => alert("تم حفظ التغييرات"));
});

// البحث عن مستخدمين
function searchUsers(query) {
  firebase.database().ref("users").once("value", snapshot => {
    const users = snapshot.val();
    const results = [];
    for (let id in users) {
      if (users[id].username.includes(query) && id !== currentUser.uid) {
        results.push({ id, ...users[id] });
      }
    }
    displaySearchResults(results);
  });
}

// عرض نتائج البحث
function displaySearchResults(results) {
  const container = document.getElementById("searchResults");
  if (!container) return;
  container.innerHTML = "";
  results.forEach(user => {
    const card = document.createElement("div");
    card.innerHTML = `
      <img src="${user.profileImage}" width="40" height="40" style="border-radius:50%">
      <strong>${user.displayName}</strong>
      <button onclick="startPrivateChat('${user.id}', '${user.username}')">مراسلة</button>
    `;
    container.appendChild(card);
  });
}

// بدء محادثة خاصة
function startPrivateChat(friendId, username) {
  firebase.database().ref(`chats/${currentUser.uid}/${friendId}`).set({ started: true });
  firebase.database().ref(`chats/${friendId}/${currentUser.uid}`).set({ started: true });
  localStorage.setItem("chatWith", friendId);
  window.location.href = "private-chat.html";
}

// عرض الأصدقاء
function loadFriends() {
  const container = document.getElementById("friendsList");
  if (!container || !currentUser) return;

  firebase.database().ref("chats/" + currentUser.uid).once("value", snapshot => {
    container.innerHTML = "";
    const friends = snapshot.val() || {};
    Object.keys(friends).forEach(friendId => {
      firebase.database().ref("users/" + friendId).once("value", snap => {
        const friend = snap.val();
        const div = document.createElement("div");
        div.innerHTML = `
          <img src="${friend.profileImage}" width="30" height="30" style="border-radius:50%">
          ${friend.displayName} - ${getLastSeen(friend.lastSeen)}
          <button onclick="startPrivateChat('${friendId}', '${friend.username}')">فتح</button>
        `;
        container.appendChild(div);
      });
    });
  });
}

// حساب آخر ظهور
function getLastSeen(time) {
  if (!time) return "غير متصل";
  const diff = Date.now() - new Date(time).getTime();
  if (diff < 60000) return "نشط الآن";
  else if (diff < 3600000) return "آخر ظهور منذ " + Math.floor(diff / 60000) + " دقيقة";
  else return "آخر ظهور منذ " + Math.floor(diff / 3600000) + " ساعة";
}

// زر العودة
function goBack() {
  window.history.back();
}
