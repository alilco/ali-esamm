let currentUser = null;

function showScreen(login = true) {
  document.getElementById("login-screen").classList.toggle("hidden", !login);
  document.getElementById("chat-screen").classList.toggle("hidden", login);
}

function addUser() {
  const username = document.getElementById("username-input").value.trim();
  if (!username) return alert("Please enter a username.");

  window.usersRef.child(username).once("value", snapshot => {
    if (snapshot.exists()) {
      alert("User already exists!");
    } else {
      window.usersRef.child(username).set(true);
      alert("User added successfully!");
    }
  });
}

function login() {
  const username = document.getElementById("username-input").value.trim();
  if (!username) return alert("Please enter a username.");

  window.usersRef.child(username).once("value", snapshot => {
    if (snapshot.exists()) {
      currentUser = username;
      document.getElementById("display-username").textContent = username;
      showScreen(false);
      loadMessages();
    } else {
      alert("User not found. Please add the user first.");
    }
  });
}

function loadMessages() {
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";

  window.messagesRef.on("child_added", snapshot => {
    const msg = snapshot.val();
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.innerHTML = `<strong>${msg.username}</strong>: ${msg.text}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

document.getElementById("message-form").addEventListener("submit", e => {
  e.preventDefault();
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value.trim();

  if (!currentUser || !message) return;

  window.messagesRef.push({
    username: currentUser,
    text: message,
    timestamp: Date.now()
  });

  messageInput.value = "";
});
