let currentUser = null;
let currentChatUid = null;

// Auth state check on load
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
  const fullName = document.getElementById("fullname-register").value.trim();
  const email = document.getElementById("email-register").value.trim();
  const password = document.getElementById("password-register").value.trim();

  if (!fullName || !email || !password) {
    alert("Please fill all fields.");
    return;
  }

  try {
    const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const uid = result.user.uid;

    await firebase.database().ref("users/" + uid).set({
      fullName,
      email,
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
  const email = document.getElementById("email-login").value.trim();
  const password = document.getElementById("password-login").value.trim();

  if (!email || !password) {
    alert("Enter both email and password.");
    return;
  }

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log("Signed in:", userCredential.user);
      window.location.href = "home.html";
    })
    .catch(error => {
      console.error("Login error:", error.code, error.message);
      alert("Login failed: " + error.message);
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

// Load user profile
async function loadUserProfile() {
  const uid = currentUser.uid;
  const snapshot = await firebase.database().ref("users/" + uid).once("value");
  const profile = snapshot.val();
  document.getElementById("user-fullname").textContent = profile.fullName || "User";
}

// Search and add friend
async function addFriend() {
  const email = document.getElementById("search-email").value.trim();
  if (!email) return alert("Enter an email.");

  const snapshot = await firebase.database().ref("users")
    .orderByChild("email")
    .equalTo(email)
    .once("value");

  if (!snapshot.exists()) {
    alert("User not found.");
    return;
  }

  const friendUid = Object.keys(snapshot.val())[0];
  const friendProfile = snapshot.val()[friendUid];

  // Show chat UI
  document.getElementById("chat-with").textContent = `Chatting with ${friendProfile.fullName}`;
  currentChatUid = friendUid;
  loadPrivateMessages(currentUser.uid, friendUid);
}

// Load private messages
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
