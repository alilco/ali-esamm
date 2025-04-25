import { auth, db } from "./firebase.js";
import {
  deleteUser,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  ref,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

onAuthStateChanged(auth, user => {
  if (!user) return window.location.href = "login.html";

  document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "login.html");
  });

  document.getElementById("deleteAccountBtn").addEventListener("click", () => {
    if (confirm("هل أنت متأكد أنك تريد حذف الحساب نهائيًا؟")) {
      remove(ref(db, "users/" + user.uid))
        .then(() => deleteUser(user))
        .then(() => {
          alert("تم حذف الحساب.");
          window.location.href = "signup.html";
        })
        .catch(error => alert("خطأ: " + error.message));
    }
  });
});
