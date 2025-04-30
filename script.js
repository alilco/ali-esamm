let currentUser = null;
let currentChatUid = null;

// Auth state check
window.addEventListener("load", () => {
  const path = window.location.pathname;

  firebase.auth().onAuthStateChanged(async user => {
    if (!user && !path.endsWith("index.html")) {
      window.location.href = "index.html";
    } else if (user && path.endsWith("index.html")) {
      window.location.href = "home.html";
    }

    if (user && path.endsWith("home.html")) {
      currentUser = user;
      await loadUserProfile();
      setupThemeToggle();
      listenForFriends();
    }
  });
});

// Sign In
function signIn() {
  const email = document.getElementById("email-login").value.trim();
  const password = document.getElementById("password-login").value.trim();

  if (!email || !password) return alert("Enter both email and password.");
  
  firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(e => alert("Login Failed: " + e.message));
}

// Sign Up
async function signUp() {
  const fullName = document.getElementById("fullname-register").value.trim();
  const username = document.getElementById("username-register").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  if (!fullName || !username || !email || !password) {
    alert("Please fill all registration fields.");
    return;
  }

  try {
    const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const uid = result.user.uid;

    await firebase.database().ref("users/" + uid).set({
      fullName,
      username,
      email,
      online: true,
      lastActive: Date.now()
    });

    alert("Registration successful!");
    window.location.href = "home.html";
  } catch (e) {
    alert(e.message);
  }
}

// Load User Info
async function loadUserProfile() {
  const uid = currentUser.uid;
  const snapshot = await firebase.database().ref("users/" + uid).once("value");
  const profile = snapshot.val();

  document.getElementById("chat-user").textContent = profile.fullName || profile.username;
  setupPresence();
}

// Add Friend by Username
async function addFriend() {
  const username = document.getElementById("search-friend").value.trim();
  if (!username) return alert("Enter a username.");

  const snapshot = await firebase.database().ref("users")
    .orderByChild("username")
    .equalTo(username)
    .once("value");

  if (!snapshot.exists()) {
    alert("User not found.");
    return;
  }

  const friendUid = Object.keys(snapshot.val())[0];
  const friendProfile = snapshot.val()[friendUid];

  // Save in friends list
  await firebase.database().ref(`users/${currentUser.uid}/friends`).push(friendUid);

  // Show chat with this user
  currentChatUid = friendUid;
  loadPrivateChat(currentUser.uid, friendUid);
}

// Load Private Chat
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

// Send Encrypted Message
function sendMessage() {
  if (!currentUser || !currentChatUid) return;

  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (!text) return;

  const chatId = [currentUser.uid, currentChatUid].sort().join("_");
  const encrypted = encryptMessage(text);

  // Save in both directions for security
  firebase.database().ref(`private_messages/${currentUser.uid}/${currentChatUid}`).push({
    sender: currentUser.uid,
    text: encrypted,
    timestamp: Date.now()
  });

  firebase.database().ref(`private_messages/${currentChatUid}/${currentUser.uid}`).push({
    sender: currentUser.uid,
    text: encrypted,
    timestamp: Date.now()
  });

  input.value = "";
}

// AES Encryption
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

// Presence Detection
function setupPresence() {
  const userRef = firebase.database().ref("users/" + currentUser.uid);
  userRef.update({ online: true, lastActive: Date.now() });

  setInterval(() => {
    userRef.update({ lastActive: Date.now() });
  }, 60000);

  firebase.database().ref(".info/connected").on("value", snap => {
    if (snap.val() === true) {
      userRef.onDisconnect().update({ online: false, lastActive: Date.now() });
    }
  });
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

// Search Friends
async function searchFriends() {
  const q = document.getElementById("search-friend").value.trim().toLowerCase();
  if (!q) return;

  const resultsDiv = document.getElementById("search-results");
  resultsDiv.innerHTML = "";

  const snapshot = await firebase.database().ref("users")
    .orderByChild("username")
    .startAt(q)
    .endAt(q + "\uf8ff")
    .once("value");

  if (snapshot.exists()) {
    Object.entries(snapshot.val()).forEach(([uid, profile]) => {
      if (uid !== currentUser.uid) {
        const el = document.createElement("div");
        el.textContent = `${profile.fullName} (${profile.username})`;
        el.onclick = () => loadPrivateChat(currentUser.uid, uid);
        resultsDiv.appendChild(el);
      }
    });
  }
}
