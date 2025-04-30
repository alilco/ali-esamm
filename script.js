let currentUser = null;
let currentFriendUid = null;

// On page load, check auth state
window.addEventListener("load", () => {
  const path = window.location.pathname;

  firebase.auth().onAuthStateChanged(async user => {
    if (!user && !path.endsWith("index.html")) {
      alert("Redirecting to login...");
      window.location.href = "index.html";
    }

    if (user) {
      currentUser = user;
      await loadUserProfile();

      // Only in home.html
      if (document.getElementById("chat-box")) {
        setupThemeToggle();
        listenForFriends();
      }
    }
  });
});

// Load profile name/email from DB
async function loadUserProfile() {
  const uid = currentUser.uid;
  const snapshot = await firebase.database().ref("users/" + uid).once("value");
  const profile = snapshot.val();

  if (profile) {
    document.getElementById("chat-user").textContent = profile.fullName || profile.username;
  }
}

// Sign In
function signIn() {
  const email = document.getElementById("email-login").value.trim();
  const password = document.getElementById("password-login").value.trim();

  if (!email || !password) return alert("Enter both fields.");
  
  firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(e => alert("Login failed: " + e.message));
}

// Register User
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

    // Save user info to Firebase Realtime DB
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

// Add Friend
async function addFriend() {
  const searchInput = document.getElementById("search-friend").value.trim();
  if (!searchInput) return alert("Enter a username or email.");

  let query = firebase.database().ref("users").orderByChild("username").equalTo(searchInput);
  let snapshot = await query.once("value");

  if (!snapshot.exists()) {
    query = firebase.database().ref("users").orderByChild("email").equalTo(searchInput);
    snapshot = await query.once("value");
  }

  if (snapshot.exists()) {
    const friendUid = Object.keys(snapshot.val())[0];
    const friendProfile = snapshot.val()[friendUid];

    if (friendUid === currentUser.uid) {
      alert("You cannot chat with yourself.");
      return;
    }

    // Save to local friends list
    await firebase.database().ref(`users/${currentUser.uid}/friends`).push(friendUid);

    // Create DOM element for sidebar
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

// Load Messages Between Users
function loadPrivateChat(uid1, uid2) {
  currentFriendUid = uid2;
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";

  const chatRef = firebase.database().ref(`private_messages/${uid1}/${uid2}`);

  chatRef.on("child_added", async snap => {
    const msg = snap.val();
    const decrypted = decryptMessage(msg.text);

    const bubble = document.createElement("div");
    bubble.classList.add("message-bubble");
    bubble.classList.add(msg.sender === uid1 ? "sender" : "receiver");
    bubble.innerText = decrypted;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // Also listen under reverse structure (for when other user sends message)
  const reverseChatRef = firebase.database().ref(`private_messages/${uid2}/${uid1}`);
  reverseChatRef.off(); // Avoid duplicate listeners
  reverseChatRef.on("child_added", snap => {
    const msg = snap.val();
    const decrypted = decryptMessage(msg.text);

    const bubble = document.createElement("div");
    bubble.classList.add("message-bubble");
    bubble.classList.add("receiver"); // you're receiving
    bubble.innerText = decrypted;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}
