import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

document.getElementById("signupBtn").addEventListener("click", () => {
  const displayName = document.getElementById("displayName").value;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      const user = userCredential.user;
      return updateProfile(user, { displayName }).then(() => {
        set(ref(db, "users/" + user.uid), {
          displayName,
          email,
          status: "نشط",
          lastSeen: new Date().toISOString(),
          profileImage: ""
        });
        sendEmailVerification(user);
        alert("تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني.");
        window.location.href = "login.html";
      });
    })
    .catch(error => alert("خطأ أثناء التسجيل: " + error.message));
});
