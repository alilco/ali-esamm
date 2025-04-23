// تحقق من تسجيل الدخول
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    const currentUser = user.displayName || user.email.split('@')[0];
    document.getElementById("chatWith").innerText = "مرحبًا، " + currentUser;

    // جلب المستخدمين
    fetch('users.json')
      .then(res => res.json())
      .then(data => {
        const usersList = document.getElementById("usersList");
        for (let username in data) {
          if (username !== currentUser) {
            const li = document.createElement("li");
            li.textContent = data[username].fullName;
            li.addEventListener("click", () => openChatWith(username, data[username].fullName));
            usersList.appendChild(li);
          }
        }
      });
  }
});

let currentChatUser = null;

function openChatWith(username, fullName) {
  currentChatUser = username;
  document.getElementById("chatWith").innerText = "الدردشة مع: " + fullName;
  document.getElementById("messages").innerHTML = "";

  const currentUser = firebase.auth().currentUser.displayName || firebase.auth().currentUser.email.split('@')[0];
  const chatId = getChatId(currentUser, username);

  firebase.database().ref("chats/" + chatId).on("value", (snapshot) => {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";
    snapshot.forEach((msg) => {
      const p = document.createElement("p");
      p.textContent = atob(msg.val().text);
      messagesDiv.appendChild(p);
    });
  });
}

// إرسال الرسائل
document.getElementById("sendBtn").addEventListener("click", () => {
  const text = document.getElementById("messageInput").value.trim();
  if (text && currentChatUser) {
    const currentUser = firebase.auth().currentUser.displayName || firebase.auth().currentUser.email.split('@')[0];
    const chatId = getChatId(currentUser, currentChatUser);
    const newMsg = {
      sender: currentUser,
      text: btoa(text),
      time: Date.now()
    };
    firebase.database().ref("chats/" + chatId).push(newMsg);
    document.getElementById("messageInput").value = "";
  }
});

// توليد معرف فريد للمحادثة بين المستخدمين
function getChatId(user1, user2) {
  return [user1, user2].sort().join("_");
}
