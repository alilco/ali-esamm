// تسجيل الدخول
function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  firebase.database().ref("users").orderByChild("username").equalTo(username).once("value", snapshot => {
    if (snapshot.exists()) {
      snapshot.forEach(child => {
        if (child.val().password === password) {
          localStorage.setItem("loggedInUser", JSON.stringify(child.val()));
          window.location.href = "chat.html";
        } else {
          alert("كلمة المرور غير صحيحة");
        }
      });
    } else {
      alert("اسم المستخدم غير موجود");
    }
  });
}

// تسجيل الخروج
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

// تحميل بيانات المستخدم
function loadUserData() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) return;

  document.getElementById("displayName").textContent = user.displayName;
  document.getElementById("profileImage").src = user.profileImage;
}

// إرسال رسالة
function sendMessage() {
  const msgInput = document.getElementById("msg");
  const msg = msgInput.value.trim();
  if (msg === "") return;

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const chatRef = firebase.database().ref("chats").push();

  chatRef.set({
    username: user.username,
    displayName: user.displayName,
    message: msg,
    time: new Date().toLocaleString()
  });

  msgInput.value = "";
}
