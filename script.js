let currentUser = null;
let currentChatUid = null;

// Check auth state
window.addEventListener("load", () => {
  const path = window.location.pathname;

  auth.onAuthStateChanged(async user => {
    if (!user && !path.endsWith("index.html")) {
      alert("You must log in first.");
      window.location.href = "index.html";
    } else if (user && path.endsWith("index.html")) {
      window.location.href = "home.html";
    }

    if (user && path.endsWith("home.html")) {
      currentUser = user;
      await loadUserProfile();
      setupPresence();
      listenForFriends();
    }
  });
});

// Login
function signIn() {
  const email = document.getElementById("email-login").value.trim();
  const password = document.getElementById("password-login").value.trim();

  if (!email || !password) return alert("Please enter both fields.");

  auth.signInWithEmailAndPassword(email, password)
    .then(() => console.log("Logged in"))
    .catch(e => alert("Login error: " + e.message));
}

// Register new user
async function signUp() {
  const fullName = document.getElementById("fullname-register").value.trim();
  const username = document.getElementById("username-register").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  if (!fullName || !username || !email || !password) {
    alert("Fill all fields.");
    return;
  }

  try {
    const result = await auth.createUserWithEmailAndPassword(email, password);
    const uid = result.user.uid;

    await db.ref("users/" + uid).set({
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

// Load User Info
async function loadUserProfile() {
  const snapshot = await db.ref("users/" + auth.currentUser.uid).once("value");
  const profile = snapshot.val();
  document.getElementById("chat-user").textContent = profile.fullName || profile.username;
}

// Add Friend by Username
async function addFriendByUsername() {
  const input = document.getElementById("search-friend").value.trim();
  if (!input) return alert("Enter a username.");

  const snapshot = await db.ref("users")
    .orderByChild("username")
    .equalTo(input)
    .once("value");

  if (!snapshot.exists()) return alert("User not found.");

  const friendUid = Object.keys(snapshot.val())[0];

  // Save as friend
  await db.ref(`users/${currentUser.uid}/friends`).push(friendUid);
  document.getElementById("search-friend").value = "";

  // Open chat
  currentChatUid = friendUid;
  loadPrivateMessages(currentUser.uid, friendUid);
}

// Load Private Messages
function loadPrivateMessages(uid1, uid2) {
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";

  db.ref(`private_messages/${uid1}/${uid2}`).on("child_added", snap => {
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
  if (!currentUser || !currentChatUid) return;

  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (!text) return;

  const encrypted = encryptMessage(text);

  db.ref(`private_messages/${currentUser.uid}/${currentChatUid}`).push({
    sender: currentUser.uid,
    text: encrypted,
    timestamp: Date.now()
  });

  db.ref(`private_messages/${currentChatUid}/${currentUser.uid}`).push({
    sender: currentUser.uid,
    text: encrypted,
    timestamp: Date.now()
  });

  input.value = "";
}

// Encrypt/Decrypt
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
  const userRef = db.ref("users/" + currentUser.uid);
  userRef.update({ online: true });

  setInterval(() => {
    userRef.update({ lastActive: Date.now() });
  }, 60000);

  db.ref(".info/connected").on("value", snap => {
    if (snap.val() === true) {
      userRef.onDisconnect().update({ online: false, lastActive: Date.now() });
    }
  });
}

// Logout
function logout() {
  if (!currentUser) return;

  db.ref("users/" + currentUser.uid).update({ online: false });
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}
