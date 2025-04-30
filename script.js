let currentUser = null;
let currentChatUid = null;

// On page load
window.addEventListener("load", () => {
  const path = window.location.pathname;

  firebase.auth().onAuthStateChanged(async user => {
    if (!user && !path.endsWith("index.html")) {
      alert("Redirecting to login...");
      window.location.href = "index.html";
    } else if (user && path.endsWith("index.html")) {
      window.location.href = "home.html";
    } else if (user && path.endsWith("home.html")) {
      currentUser = user;
      await loadUserProfile();
      listenForFriends();
      setupThemeToggle();
      setupPresence();
    }
  });
});

// Handle Login
function handleLogin() {
  const email = document.getElementById("email-login").value.trim();
  const password = document.getElementById("password-login").value.trim();

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      console.log("Logged in successfully.");
    })
    .catch(error => {
      alert("Login failed: " + error.message);
    });
}

// Handle Registration
async function handleSignUp() {
  const fullName = document.getElementById("fullname-register").value.trim();
  const username = document.getElementById("username-register").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  if (!fullName || !username || !email || !password) {
    alert("Please fill all fields.");
    return;
  }

  try {
    const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const uid = result.user.uid;

    // Save extra info to DB
    await firebase.database().ref(`users/${uid}`).set({
      fullName,
      username,
      email,
      online: true,
      lastActive: Date.now()
    });

    alert("Registration successful!");
    window.location.href = "home.html";
  } catch (e) {
    alert("Error: " + e.message);
  }
}

// Load User Profile
async function loadUserProfile() {
  const uid = firebase.auth().currentUser?.uid;
  if (!uid) return;

  const snapshot = await firebase.database().ref("users/" + uid).once("value");
  const profile = snapshot.val();
  document.getElementById("chat-user").textContent = profile.fullName || profile.username;
}

// Add Friend by Username
async function addFriendByUsername() {
  const input = document.getElementById("search-friend").value.trim();
  if (!input) return alert("Enter a username.");

  const snapshot = await firebase.database().ref("users")
    .orderByChild("username")
    .equalTo(input)
    .once("value");

  if (!snapshot.exists()) {
    return alert("User not found.");
  }

  const friendUid = Object.keys(snapshot.val())[0];

  if (friendUid === currentUser.uid) {
    return alert("You cannot add yourself.");
  }

  // Save in local friends
  await firebase.database().ref(`users/${currentUser.uid}/friends`).push(friendUid);

  // Open chat
  loadPrivateChat(currentUser.uid, friendUid);
}

// Load Private Message History
function loadPrivateChat(uid1, uid2) {
  currentChatUid = uid2;
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";

  firebase.database().ref(`private_messages/${uid1}/${uid2}`).on("child_added", snap => {
    const msg = snap.val();
    const decrypted = decryptMessage(msg.text);

    const bubble = document.createElement("div");
    bubble.classList.add("message-bubble");
    bubble.classList.add(msg.sender === uid1 ? "sender" : "receiver");
    bubble.textContent = decrypted;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Send Message
function sendMessage() {
  if (!currentUser || !currentChatUid) return alert("Select a friend first.");

  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (!text) return;

  const encryptedText = encryptMessage(text);

  firebase.database().ref(`private_messages/${currentUser.uid}/${currentChatUid}`).push({
    sender: currentUser.uid,
    text: encryptedText,
    timestamp: Date.now()
  });

  input.value = "";
}

// Encryption Functions
function encryptMessage(message) {
  const key = CryptoJS.enc.Utf8.parse('1234567890123456');
  return CryptoJS.AES.encrypt(message, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
}

function decryptMessage(cipherText) {
  const key = CryptoJS.enc.Utf8.parse('1234567890123456');
  const bytes = CryptoJS.AES.decrypt(cipherText, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Theme Toggle
function setupThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  const body = document.body;

  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    body.classList.add("dark");
    toggle.checked = true;
  }

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

// Presence System
function setupPresence() {
  if (!currentUser) return;

  const ref = firebase.database().ref("users/" + currentUser.uid);
  ref.update({ online: true, lastActive: Date.now() });

  setInterval(() => {
    ref.update({ lastActive: Date.now() });
  }, 60000);

  firebase.database().ref(".info/connected").on("value", snap => {
    if (snap.val() === true) {
      ref.onDisconnect().update({ online: false, lastActive: Date.now() });
    }
  });
}

// Logout
function logout() {
  if (!currentUser) return;

  firebase.database().ref("users/" + currentUser.uid).update({ online: false });
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
}

// Search Friends
async function searchFriends() {
  const q = document.getElementById("search-friend").value.trim().toLowerCase();
  if (!q) return;

  const snapshot = await firebase.database().ref("users")
    .orderByChild("username")
    .startAt(q)
    .endAt(q + "\uf8ff")
    .once("value");

  const resultsDiv = document.getElementById("friends-list");
  resultsDiv.innerHTML = "";

  if (snapshot.exists()) {
    Object.entries(snapshot.val()).forEach(([uid, data]) => {
      if (uid !== currentUser?.uid) {
        const el = document.createElement("li");
        el.textContent = `${data.fullName} (${data.username})`;
        el.onclick = () => {
          currentChatUid = uid;
          loadPrivateChat(currentUser.uid, uid);
        };
        resultsDiv.appendChild(el);
      }
    });
  }
}
