import app from './firebase-config.js';
import { getAuth, onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const auth = getAuth(app);

window.updateProfileName = function () {
  const newName = document.getElementById("newDisplayName").value;
  updateProfile(auth.currentUser, { displayName: newName }).then(() => {
    alert("Display name updated!");
  });
};

window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
});
