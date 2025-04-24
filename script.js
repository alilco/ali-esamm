// تسجيل دخول
function login() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  fetch('users.json')
    .then(res => res.json())
    .then(users => {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        window.location.href = "chat.html";
      } else {
        alert("اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    });
}

// تسجيل خروج
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

// التأكد من تسجيل الدخول
function checkLogin() {
  const user = localStorage.getItem("currentUser");
  if (!user) {
    window.location.href = "login.html";
  }
}
