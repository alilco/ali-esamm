// ========================
// Global Variables
// ========================
let currentUser = null;

// ========================
// Initialize on Load
// ========================
window.addEventListener("load", () => {
  const path = window.location.pathname;

  // Check auth state to control access
  firebase.auth().onAuthStateChanged(async (user) => {
    if (path.endsWith("home.html")) {
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

    if (path.endsWith("index.html")) {
      if (user) {
        window.location.href = "home.html";
      }
    }
  });
});

// ========================
// Authentication Functions
// ========================

// Sign Up with Profile
async function signUp() {
  const username = document.getElementById("username-register").value.trim();
  const password = document.getElementById("password-register").value.trim();
  const fullname = document.getElementById("fullname-register").value.trim();
  const bio = document.getElementById("bio-register").value.trim();
  const avatarInput = document.getElementById("avatar-register");

  if (!username || !password || !fullname) {
    alert("Please fill in all required fields.");
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
    alert("Error: " + e.message);
  }
}

// Login with Username
function signIn() {
  const username = document.getElementById("username-login").value.trim();
  const password = document.getElementById("password-login").value.trim();

  if (!username || !password) {
    alert("Please enter both username and password.");
    return;
  }

  const email = `${username}@example.com`;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(e => alert("Login failed: " + e.message));
}

// Logout
function logout() {
  if (!currentUser) return;

  // Set user offline before logout
  firebase.database().ref("users/" + currentUser.uid).update({
    online: false,
    lastActive: Date.now()
  });

  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
}

// ========================
// Home Page Setup
// ========================

// Load user display name
async function loadUserProfile() {
  const uid = currentUser.uid;
  const snapshot = await firebase.database().ref("users/" + uid).once("value");
  const profile = snapshot.val();
  if (profile) {
    document.getElementById("user-fullname").textContent = profile.fullname || profile.username;
  }
}

// Dummy chat UI setup
function setupChatUI() {
  console.log("Chat UI loaded.");
}

// Real-time message listener (Placeholder for now)
function setupMessageListener() {
  console.log("Message listener ready.");
}

// Online presence system
function setupPresence() {
  if (!currentUser) return;

  const userRef = firebase.database().ref("users/" + currentUser.uid);

  // Set online when signed in
  userRef.update({ online: true });

  // Update last active every minute
  setInterval(() => {
    userRef.update({ lastActive: Date.now() });
  }, 60000);

  // Optional: On disconnect, mark as offline
  firebase.database().ref(".info/connected").on("value", snap => {
    if (snap.val() === true) {
      userRef.onDisconnect().update({ online: false, lastActive: Date.now() });
    }
  });
}

// ========================
// Chat Encryption (Basic AES)
// ========================
function encryptMessage(message) {
  const key = CryptoJS.enc.Utf8.parse('1234567890123456'); // 16-byte key
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

// ========================
// UI Helpers
// ========================

// Show register screen
function showRegister() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("register-screen").classList.remove("hidden");
}

// Show login screen
function showLogin() {
  document.getElementById("register-screen").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
}

// Theme Toggle
function setupThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  const body = document.body;

  // Check saved preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.remove("light");
    body.classList.add("dark");
    toggle.checked = true;
  }

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      body.classList.remove("light");
      body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("dark");
      body.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  });
}
