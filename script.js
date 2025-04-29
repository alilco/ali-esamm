let currentUser = null;

// Auth state check on page load
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
        setupChatUI();
        setupMessageListener();
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

// Setup chat UI
function setupChatUI() {
  console.log("Chat UI loaded.");
}

// Listen for messages
function setupMessageListener() {
  const chatBox = document.getElementById("chat-box");
  firebase.database().ref("messages").limitToLast(50).on("child_added", snapshot => {
    const msg = snapshot.val();
    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = `<strong>${msg.username}</strong>: ${decryptMessage(msg.text)}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Send message
document.getElementById("message-form")?.addEventListener("submit", e => {
  e.preventDefault();
  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (!currentUser || !text) return;

  firebase.database().ref("messages").push({
    username: currentUser.email.split("@")[0],
    text: encryptMessage(text),
    timestamp: Date.now()
  });

  input.value = "";
});

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

// Navigation
function showRegister() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("register-screen").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("register-screen").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
}
