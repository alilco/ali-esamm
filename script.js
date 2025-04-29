document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("message-form");
  const chatBox = document.getElementById("chat-box");
  const usernameInput = document.getElementById("username");
  const messageInput = document.getElementById("message");

  // Listen for new messages
  window.messagesRef.on("child_added", snapshot => {
    const msg = snapshot.val();
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.innerHTML = `<strong>${msg.username}</strong>: ${msg.text}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // Submit message
  form.addEventListener("submit", e => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();

    if (username && message) {
      window.messagesRef.push({
        username,
        text: message,
        timestamp: Date.now()
      });
      messageInput.value = "";
    }
  });
});
