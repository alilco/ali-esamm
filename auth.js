// auth.js
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

window.signup = async function () {
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCred.user, { displayName: name });

  await set(ref(db, "users/" + userCred.user.uid), {
    name,
    email,
    uid: userCred.user.uid,
    lastSeen: new Date().toISOString()
  });

  localStorage.setItem("uid", userCred.user.uid);
  window.location.href = "chat.html";
};

window.login = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const userCred = await signInWithEmailAndPassword(auth, email, password);
  localStorage.setItem("uid", userCred.user.uid);
  window.location.href = "chat.html";
};

window.logout = function () {
  localStorage.removeItem("uid");
  window.location.href = "index.html";
};
