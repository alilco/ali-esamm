let currentUser = null;

// Sign Up (with Profile)
async function signUp() {
  const username = document.getElementById("username-register").value;
  const password = document.getElementById("password-register").value;
  const fullname = document.getElementById("fullname-register").value;
  const bio = document.getElementById("bio-register").value;
  const avatarInput = document.getElementById("avatar-register");

  try {
    // Create user with email/password
    const result = await auth.createUserWithEmailAndPassword(username + "@example.com", password);
    const user = result.user;

    // Upload photo
    let avatarUrl = "";
    if (avatarInput.files.length > 0) {
      const file = avatarInput.files[0];
      const snapshot = await storage.ref(`avatars/${user.uid}`).put(file);
      avatarUrl = await snapshot.ref.getDownloadURL();
    }

    // Save user profile
    await db.ref("users/" + user.uid).set({
      username,
      fullname,
      bio,
      avatarUrl,
      lastActive: Date.now(),
      online: true
    });

    alert("Registration successful!");
    window.location.href = "home.html";
  } catch (e) {
    alert("Error: " + e.message);
  }
}

// Sign In
function signIn() {
  const username = document.getElementById("username-login").value;
  const password = document.getElementById("password-login").value;

  auth.signInWithEmailAndPassword(username + "@example.com", password)
    .then(() => {
      window.location.href = "home.html";
    })
    .catch(e => alert("Login failed: " + e.message));
}

// Load Friends
function loadFriends() {
  const userId = auth.currentUser.uid;
  db.ref("users").on("value", snap => {
    const users = snap.val();
    const friendsEl = document.getElementById("friends-list");
    friendsEl.innerHTML = "";

    Object.values(users).forEach(profile => {
      if (profile.username !== auth.currentUser.displayName) {
        const div = document.createElement("div");
        div.textContent = `${profile.fullname} (${profile.username})`;
        friendsEl.appendChild(div);
      }
    });
  });
}

// Send Message (Encrypted)
document.getElementById("message-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("message-input");
  const text = input.value.trim();
  const friendUsername = "some_friend_username"; // Replace dynamically

  const chatId = [currentUser.uid, friendUid].sort().join("_");
  const encryptedText = encryptMessage(text); // From crypto-lib.js

  db.ref("messages/" + chatId).push({
    sender: currentUser.uid,
    text: encryptedText,
    timestamp: Date.now()
  });

  input.value = "";
});
