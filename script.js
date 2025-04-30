let currentUser = null;
let currentFriendUid = null;

// On Page Load
window.addEventListener("load", () => {
  const path = window.location.pathname;

  auth.onAuthStateChanged(async user => {
    if (!user && path.endsWith("home.html")) {
      alert("You must log in first.");
      window.location.href = "index.html";
    }

    if (user && path.endsWith("index.html")) {
      document.getElementById("login-screen").classList.add("hidden");
      document.getElementById("register-screen").classList.add("hidden");
    }

    if (user && path.endsWith("home.html")) {
      currentUser = user;
      await loadUserProfile();
      setupThemeToggle();
      listenForFriends();
    }
  });
});

// Firebase Sign In
function signIn() {
  const email = document.getElementById("email-login").value.trim();
  const password = document.getElementById("password-login").value.trim();

  if (!email || !password) return alert("Enter both email and password.");

  auth.signInWithEmailAndPassword(email, password)
    .catch(err => alert("Login Failed: " + err.message));
}

// Firebase Sign Up
async function signUp() {
  const fullName = document.getElementById("fullname-register").value.trim();
  const username = document.getElementById("username-register").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  if (!fullName || !username || !email || !password) {
    alert("Please fill all fields.");
    return;
  }

  try {
    const result = await auth.createUserWithEmailAndPassword(email, password);
    const uid = result.user.uid;

    await db.ref("users/" + uid).set({
      fullName,
      username,
      email,
      lastActive: Date.now(),
      online: true,
      friends: {}
    });

    alert("Registration successful!");
    window.location.href = "home.html";
  } catch (e) {
    alert(e.message);
  }
}

// Show User Profile
async function loadUserProfile() {
  const uid = currentUser.uid;
  const snapshot = await db.ref("users/" + uid).once("value");
  const profile = snapshot.val();
  document.getElementById("chat-user").textContent = profile.fullName || "User";
}

// Add Friend by Username
async function addFriend() {
  const searchInput = document.getElementById("search-friend").value.trim();
  if (!searchInput) return alert("Enter a username or email.");

  let query = db.ref("users").orderByChild("username").equalTo(searchInput);
  let snapshot = await query.once("value");

  if (!snapshot.exists()) {
    query = db.ref("users").orderByChild("email").equalTo(searchInput);
    snapshot = await query.once("value");
  }

  if (snapshot.exists()) {
    const friendUid = Object.keys(snapshot.val())[0];
    const friendProfile = snapshot.val()[friendUid];

    // Save in friends
    await db.ref(`users/${currentUser.uid}/friends`).push(friendUid);

    // Display Friend
    const friendEl = document.createElement("li");
    friendEl.textContent = `${friendProfile.fullName} (${friendProfile.username})`;
    friendEl.dataset.uid = friendUid;
    friendEl.onclick = () => loadPrivateChat(currentUser.uid, friendUid);
    document.getElementById("friends-list").appendChild(friendEl);
    document.getElementById("search-friend").value = "";
  } else {
    alert("User not found.");
  }
}

// Load Private Chat
function loadPrivateChat(uid1, friendUid) {
  currentFriendUid = friendUid;
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";

  const chatId = [uid1, friendUid].sort().join("_");

  db.ref("private_messages/" + chatId).on("child_added", snap => {
    const msg = snap.val();
    const decrypted = decryptMessage(msg.text);
    const bubble = document.createElement("div");
    bubble.classList.add("message-bubble");
    bubble.classList.add(msg.sender === uid1 ? "sender" : "receiver");
    bubble.innerText = decrypted;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Send Message (Encrypted)
function sendMessage() {
  if (!currentUser || !currentFriendUid) return alert("Select a friend first.");

  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (!text) return;

  const chatId = [currentUser.uid, currentFriendUid].sort().join("_");
  const encrypted = encryptMessage(text);

  db.ref("private_messages/" + chatId).push({
    sender: currentUser.uid,
    text: encrypted,
    timestamp: Date.now()
  });

  input.value = "";
}

// Encrypt Message
function encryptMessage(message) {
  const key = CryptoJS.enc.Utf8.parse('1234567890123456');
  return CryptoJS.AES.encrypt(message, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
}

// Decrypt Message
function decryptMessage(cipherText) {
  const key = CryptoJS.enc.Utf8.parse('1234567890123456');
  const bytes = CryptoJS.AES.decrypt(cipherText, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Presence System
auth.onAuthStateChanged(user => {
  if (!user) return;
  const ref = db.ref("users/" + user.uid);
  ref.update({ online: true, lastActive: Date.now() });

  setInterval(() => {
    ref.update({ lastActive: Date.now() });
  }, 60000);

  db.ref(".info/connected").on("value", snap => {
    if (snap.val() === true) {
      ref.onDisconnect().update({ online: false, lastActive: Date.now() });
    }
  });
});

// Theme Toggle
function setupThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  const body = document.body;

  const saved = localStorage.getItem("theme");
  if (saved === "dark") body.classList.add("dark");

  toggle.checked = saved === "dark";

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  });
}

// Logout
function logout() {
  if (!currentUser) return;

  db.ref("users/" + currentUser.uid).update({ online: false, lastActive: Date.now() });
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}

// Search Friends Live
function searchFriends() {
  const q = document.getElementById("search-friend").value.trim().toLowerCase();
  if (!q) return;

  db.ref("users")
    .orderByChild("username")
    .startAt(q)
    .endAt(q + "\uf8ff")
    .on("value", snapshot => {
      const users = snapshot.val();
      const list = document.getElementById("friends-list");
      list.innerHTML = "";

      if (users) {
        Object.entries(users).forEach(([uid, data]) => {
          if (uid !== currentUser?.uid) {
            const el = document.createElement("li");
            el.textContent = `${data.fullName} (${data.username})`;
            el.dataset.uid = uid;
            el.onclick = () => loadPrivateChat(currentUser.uid, uid);
            list.appendChild(el);
          }
        });
      }
    });
}
