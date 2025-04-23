// فحص إذا كان هناك مستخدم مسجل دخوله
if (window.location.pathname.includes("chat.html") || window.location.pathname.includes("profile.html") || window.location.pathname.includes("friends.html")) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "login.html";
  }
}

// إنشاء حساب
function signup() {
  const fullName = document.getElementById("signupFullName").value.trim();
  const username = document.getElementById("signupUsername").value.trim().toLowerCase();
  const password = document.getElementById("signupPassword").value;

  if (!fullName || !username || !password) {
    alert("يرجى ملء جميع الحقول.");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || {};
  if (users[username]) {
    alert("اسم المستخدم موجود بالفعل.");
    return;
  }

  users[username] = {
    username,
    fullName,
    password,
    bio: "",
    profileImage: "",
    friends: [],
    lastSeen: new Date().toISOString(),
    active: true
  };

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(users[username]));
  alert("تم إنشاء الحساب بنجاح!");
  window.location.href = "chat.html";
}

// تسجيل الدخول
function login() {
  const username = document.getElementById("loginUsername").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  let users = JSON.parse(localStorage.getItem("users")) || {};
  const user = users[username];

  if (!user || user.password !== password) {
    alert("اسم المستخدم أو كلمة المرور غير صحيحة.");
    return;
  }

  user.lastSeen = new Date().toISOString();
  user.active = true;
  users[username] = user;
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(user));

  alert("تم تسجيل الدخول!");
  window.location.href = "chat.html";
}

// تسجيل الخروج
function logout() {
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    let users = JSON.parse(localStorage.getItem("users")) || {};
    currentUser.active = false;
    currentUser.lastSeen = new Date().toISOString();
    users[currentUser.username] = currentUser;
    localStorage.setItem("users", JSON.stringify(users));
  }

  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}
