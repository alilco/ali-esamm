// مثال بسيط لتسجيل الدخول
function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  if (username && password) {
    // تحقق من وجود المستخدم (بشكل بسيط)
    localStorage.setItem("user", username);
    window.location.href = "chat.html";
  } else {
    alert("يرجى إدخال اسم المستخدم وكلمة المرور");
  }
}
function signup() {
  const fullname = document.getElementById("fullname").value;
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;
  if (fullname && username && password) {
    localStorage.setItem("user", username);
    window.location.href = "chat.html";
  } else {
    alert("يرجى ملء جميع الحقول");
  }
}
function sendMessage() {
  const input = document.getElementById("messageInput");
  const msg = input.value;
  if (msg.trim()) {
    const messages = document.getElementById("messages");
    const div = document.createElement("div");
    div.textContent = msg;
    messages.appendChild(div);
    input.value = "";
  }
}
function sendImage(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = document.createElement("img");
      img.src = event.target.result;
      img.style.maxWidth = "100px";
      document.getElementById("messages").appendChild(img);
    };
    reader.readAsDataURL(file);
  }
}
