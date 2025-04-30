// Global Vars
let currentUser = null;
let currentChatUid = null;

// Wait for page load
window.addEventListener("load", () => {
  const path = window.location.pathname;

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user && !path.endsWith("index.html")) {
      alert("You must log in first.");
      window.location.href = "index.html";
    } else if (user && path.endsWith("index.html")) {
      // Redirect user to home after login
      window.location.href = "home.html";
    } else if (user && path.endsWith("home.html")) {
      currentUser = user;
      await loadUserProfile();
      setupThemeToggle();
      listenForFriends();
      setupPresence();
    }
  });
});

// Handle Login (Button No Longer Broken)
function handleLogin() {
  const email = document.getElementById("email-login").value.trim();
  const password = document.getElementById("password-login").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      console.log("Redirecting to home...");
    })
    .catch((error) => {
      alert("Login failed: " + error.message);
    });
}

// Register New User
async function handleSignUp() {
  const fullName = document.getElementById("fullname-register").value.trim();
  const username = document.getElementById("username-register").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  if (!fullName || !username || !email || !password) {
    alert("Fill all fields before submitting.");
    return;
  }

  try {
    const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const uid = result.user.uid;

    // Save extra info to database
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

  // Prevent adding yourself
  if (friendUid === currentUser.uid) {
    return alert("You can't add yourself as a friend.");
  }

  // Store in your friends list
  await firebase.database().ref(`users/${currentUser.uid}/friends`).push(friendUid);

  // Load chat UI
  currentChatUid = friendUid;
  loadPrivateChat(currentUser.uid, friendUid);
}

// Load Private Chat
function loadPrivateChat(uid1, uid2) {
  currentChatUid = uid2;
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";

  const chatRef = firebase.database().ref(`private_messages/${uid1}/${uid2}`);

  chatRef.on("child_added", snap => {
    const msg = snap.val();
    const decrypted = decryptMessage(msg.text);

    const bubble = document.createElement("div");
    bubble.classList.add("message-bubble");
    bubble.classList.add(msg.sender === uid1 ? "sender" : "receiver");

    bubble.textContent = decrypted;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // Load reverse direction too
  const reverseRef = firebase.database().ref(`private_messages/${uid2}/${uid1}`);
  reverseRef.off(); // Remove duplicate listeners
  reverseRef.on("child_added", snap => {
    const msg = snap.val();
    const decrypted = decryptMessage(msg.text);

    const bubble = document.createElement("div");
    bubble.classList.add("message-bubble");
    bubble.classList.add("receiver"); // always received from others
    bubble.textContent = decrypted;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Send Message
function sendMessage() {
  if (!currentUser || !currentChatUid) {
    return alert("Select a friend to start chatting.");
  }

  const input = document.getElementById("message-input");
  const text = input.value.trim();

  if (!text) return;

  const encrypted = encryptMessage(text);
  const chatPath = `private_messages/${currentUser.uid}/${currentChatUid}`;

  firebase.database().ref(chatPath).push({
    sender: currentUser.uid,
    text: encrypted,
    timestamp: Date.now()
  });

  input.value = "";
}

// Encrypt/Decrypt Messages
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

// Logout
function logout() {
  if (!currentUser) return;

  firebase.database().ref("users/" + currentUser.uid).update({ online: false, lastActive: Date.now() });
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
}
