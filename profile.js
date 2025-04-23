import { db } from "./firebase-config.js";
import {
  ref,
  get
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const user = JSON.parse(localStorage.getItem("currentUser"));
if (!user) window.location.href = "login.html";

const usernameEl = document.getElementById("username");
const displayNameEl = document.getElementById("displayName");
const userImage = document.getElementById("userImage");
const lastSeen = document.getElementById("lastSeen");

get(ref(db, "users/" + user.username)).then((snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.val();
    usernameEl.textContent = user.username;
    displayNameEl.textContent = data.displayName || "بدون اسم";
    userImage.src = data.profileImage || "default.png";
    lastSeen.textContent = data.lastSeen || "غير متاح";
  }
});