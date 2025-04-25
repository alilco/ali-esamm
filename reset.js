import { auth } from "./firebase.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.getElementById("resetBtn").addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  sendPasswordResetEmail(auth, email)
    .then(() => alert("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك."))
    .catch(error => alert("فشل إرسال الرابط: " + error.message));
});
