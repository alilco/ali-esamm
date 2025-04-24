function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

function searchAndAddFriend() {
  const input = document.getElementById("searchFriendInput").value.trim();
  const message = document.getElementById("friendMessage");
  message.innerText = "";

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
  let friends = JSON.parse(localStorage.getItem(`${currentUser.username}_friends`) || "[]");

  if (!input) {
    message.innerText = "يرجى إدخال اسم مستخدم.";
    return;
  }

  if (input === currentUser.username) {
    message.innerText = "لا يمكنك إضافة نفسك.";
    return;
  }

  const foundUser = users.find(u => u.username === input);

  if (!foundUser) {
    message.innerText = "المستخدم غير موجود.";
    return;
  }

  if (friends.includes(input)) {
    message.innerText = "الصديق موجود مسبقًا.";
    return;
  }

  friends.push(input);
  localStorage.setItem(`${currentUser.username}_friends`, JSON.stringify(friends));
  message.innerText = "تمت إضافة الصديق بنجاح!";
  renderFriendsList();
}

function renderFriendsList() {
  const list = document.getElementById("friendsList");
  list.innerHTML = "";

  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const friends = JSON.parse(localStorage.getItem(`${currentUser.username}_friends`) || "[]");

  friends.forEach(friendUsername => {
    const li = document.createElement("li");
    li.innerHTML = `<button onclick="openPrivateChat('${friendUsername}')">${friendUsername}</button>`;
    list.appendChild(li);
  });
}

function openPrivateChat(friendUsername) {
  localStorage.setItem("chatWith", friendUsername);
  window.location.href = "private-chat.html";
}

window.onload = () => {
  renderFriendsList();
};
