// تسجيل دخول
function loginUser() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  if (!username || !password) {
    document.getElementById("loginError").innerText = "يرجى ملء جميع الحقول.";
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    window.location.href = "chat.html";
  } else {
    document.getElementById("loginError").innerText = "بيانات الدخول غير صحيحة.";
  }
}

// إنشاء حساب
function signupUser() {
  const username = document.getElementById("signupUsername").value;
  const displayName = document.getElementById("signupDisplayName").value;
  const password = document.getElementById("signupPassword").value;

  if (!username || !password || !displayName) {
    document.getElementById("signupError").innerText = "يرجى ملء جميع الحقول.";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users") || "[]");

  if (users.find(u => u.username === username)) {
    document.getElementById("signupError").innerText = "اسم المستخدم موجود مسبقًا.";
    return;
  }

  const newUser = {
    username,
    displayName,
    password,
    lastSeen: new Date().toISOString(),
    active: true
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("loggedInUser", JSON.stringify(newUser));
  window.location.href = "chat.html";
}
