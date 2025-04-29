let currentUser = null;

auth.onAuthStateChanged(async user => {
  if (!user) return;

  const uid = user.uid;
  const snapshot = await db.ref("users/" + uid).once("value");
  const profile = snapshot.val();

  if (!profile) {
    // User exists in Auth but not in DB
    await db.ref("users/" + uid).set({
      fullName: "",
      email: user.email,
      online: true,
      lastActive: Date.now()
    });
  }

  currentUser = user;
});

function signIn() {
  const email = document.getElementById("email-login").value.trim();
  const password = document.getElementById("password-login").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .catch(err => alert("Login failed: " + err.message));
}

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
      online: true
    });

    alert("Registration successful!");
    window.location.href = "home.html";
  } catch (e) {
    alert(e.message);
  }
}

function showRegister() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("register-screen").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("register-screen").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
}

async function addFriend() {
  const searchInput = document.getElementById("search-friend").value.trim();
  if (!searchInput) return alert("Enter username or email.");

  let query = db.ref("users").orderByChild("username").equalTo(searchInput);
  let snapshot = await query.once("value");

  if (!snapshot.exists()) {
    query = db.ref("users").orderByChild("email").equalTo(searchInput);
    snapshot = await query.once("value");
  }

  if (snapshot.exists()) {
    const friendUid = Object.keys(snapshot.val())[0];
    const friendProfile = snapshot.val()[friendUid];

    const friendElement = document.createElement("li");
    friendElement.textContent = `${friendProfile.fullName} (${friendProfile.username})`;
    friendElement.onclick = () => loadPrivateChat(currentUser.uid, friendUid);

    document.getElementById("friends-list").appendChild(friendElement);

    await db.ref("users/" + currentUser.uid + "/friends/" + friendUid).set(true);
    alert("Friend added!");
  } else {
    alert("User not found.");
  }
}

function loadPrivateChat(uid1, uid2) {
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";

  const chatId = [uid1, uid2].sort().join("_");
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

function sendMessage() {
  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (!currentUser || !text) return;

  const chatWith = document.querySelector(".selected-friend")?.dataset.uid;
  if (!chatWith) return alert("Select a friend first.");

  const chatId = [currentUser.uid, chatWith].sort().join("_");
  const encrypted = encryptMessage(text);

  db.ref("private_messages/" + chatId).push({
    sender: currentUser.uid,
    text: encrypted,
    timestamp: Date.now()
  });

  input.value = "";
}

function setupThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  const body = document.body;

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
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

function logout() {
  if (!currentUser) return;

  db.ref("users/" + currentUser.uid).update({ online: false, lastActive: Date.now() });
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}

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
