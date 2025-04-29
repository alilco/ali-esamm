let currentUser = null;
let currentChatUid = null;

// Check auth state on load
window.addEventListener("load", () => {
  const path = window.location.pathname;

  firebase.auth().onAuthStateChanged(async user => {
    if (path.endsWith("index.html")) {
      if (user) window.location.href = "home.html";
    } else if (path.endsWith("home.html")) {
      if (!user) {
        alert("You must log in first.");
        window.location.href = "index.html";
      } else {
        currentUser = user;
        await loadUserProfile();
        setupPresence();
        setupThemeToggle();
      }
    }
  });
});

// Register new user
async function signUp() {
  const username = document.getElementById("username-register").value.trim();
  const password = document.getElementById("password-register").value.trim();
  const fullname = document.getElementById("fullname-register").value.trim();
  const bio = document.getElementById("bio-register").value.trim();
  const avatarInput = document.getElementById("avatar-register");

  if (!username || !password || !fullname) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    const email = `${username}@example.com`;
    const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const uid = result.user.uid;

    let avatarUrl = "";
    if (avatarInput.files.length > 0) {
      const file = avatarInput.files[0];
      const snapshot = await firebase.storage().ref(`avatars/${uid}`).put(file);
      avatarUrl = await snapshot.ref.getDownloadURL();
    }

    await firebase.database().ref("users/" + uid).set({
      username,
      fullname,
      bio,
      avatarUrl,
      friends: {},
      lastActive: Date.now(),
      online: true
    });

    alert("Registration successful!");
    window.location.href = "home.html";
  } catch (e) {
    alert(e.message);
  }
}

// Login existing user
function signIn() {
  const username = document.getElementById("username-login").value.trim();
  const password = document.getElementById("password-login").value.trim();

  if (!username || !password) {
    alert("Enter both fields.");
    return;
  }

  const email = `${username}@example.com`;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(e => alert("Login failed: " + e.message));
}

// Logout
function logout() {
  if (!currentUser) return;

  firebase.database().ref("users/" + currentUser.uid).update({ online: false, lastActive: Date.now() });

  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
}

// Load user profile
async function loadUserProfile() {
  const uid = currentUser.uid;
  const snapshot = await firebase.database().ref("users/" + uid).once("value");
  const profile = snapshot.val();
  document.getElementById("user-fullname").textContent = profile.fullname || profile.username;
}

// Search and add friend
async function addFriend() {
  const username = document.getElementById("search-username").value.trim();
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

  // Show chat UI
  document.getElementById("chat-with").textContent = `Chatting with ${friendProfile.fullname || friendProfile.username}`;
  currentChatUid = friendUid;
  loadPrivateMessages(currentUser.uid, friendUid);
}

// Load encrypted messages
function loadPrivateMessages(uid1, uid2) {
  const chatId = [uid1, uid2].sort().join("_");
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";

  firebase.database().ref("private_messages/" + chatId).on("child_added", snapshot => {
    const msg = snapshot.val();
    const decrypted = decryptMessage(msg.text);

    const div = document.createElement("div");
    div.textContent = `${msg.sender === uid1 ? "You" : "Friend"}: ${decrypted}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Send encrypted message
function sendMessage() {
  if (!currentUser || !currentChatUid) return;

  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (!text) return;

  const chatId = [currentUser.uid, currentChatUid].sort().join("_");
  const encrypted = encryptMessage(text);

  firebase.database().ref("private_messages/" + chatId).push({
    sender: currentUser.uid,
    text: encrypted,
    timestamp: Date.now()
  });

  input.value = "";
}

// Presence system
function setupPresence() {
  if (!currentUser) return;

  const userRef = firebase.database().ref("users/" + currentUser.uid);
  userRef.update({ online: true });

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

// Navigation
function showRegister() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("register-screen").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("register-screen").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
}

// Encryption functions
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
