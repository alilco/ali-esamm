let currentUser = null;

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    window.location.href = "home.html";
  }
});

function showLogin() {
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("register-screen").classList.add("hidden");
}

function showRegister() {
  document.getElementById("register-screen").classList.remove("hidden");
  document.getElementById("login-screen").classList.add("hidden");
}

async function signUp() {
  const username = document.getElementById("username-register").value.trim();
  const password = document.getElementById("password-register").value.trim();
  const fullname = document.getElementById("fullname-register").value.trim();
  const bio = document.getElementById("bio-register").value.trim();
  const avatarInput = document.getElementById("avatar-register");

  try {
    const email = `${username}@example.com`;
    const result = await auth.createUserWithEmailAndPassword(email, password);
    const uid = result.user.uid;

    let avatarUrl = "";
    if (avatarInput.files.length > 0) {
      const file = avatarInput.files[0];
      const snapshot = await storage.ref(`avatars/${uid}`).put(file);
      avatarUrl = await snapshot.ref.getDownloadURL();
    }

    await db.ref("users/" + uid).set({
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

function signIn() {
  const username = document.getElementById("username-login").value.trim();
  const password = document.getElementById("password-login").value.trim();

  const email = `${username}@example.com`;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      console.log("Logged in");
    })
    .catch(e => alert("Login failed: " + e.message));
}

function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}
