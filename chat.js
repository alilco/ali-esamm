document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  if (!username) return (window.location.href = "login.html");

  document.getElementById("usernameDisplay").textContent = username;

  fetch("/users")
    .then(res => res.json())
    .then(users => {
      const currentUser = users.find(u => u.username === username);
      const friendsList = document.getElementById("friendsList");
      currentUser.friends.forEach(friend => {
        const li = document.createElement("li");
        li.textContent = friend;
        li.onclick = () => {
          localStorage.setItem("chatWith", friend);
          window.location.href = "private-chat.html";
        };
        friendsList.appendChild(li);
      });
    });
});

function searchUser() {
  const query = document.getElementById("searchUserInput").value.trim();
  if (!query) return;

  fetch("/users")
    .then(res => res.json())
    .then(users => {
      const match = users.find(u => u.username === query);
      const resultDiv = document.getElementById("searchResults");
      resultDiv.innerHTML = "";

      if (match) {
        const btn = document.createElement("button");
        btn.textContent = `أضف ${match.username}`;
        btn.onclick = () => addFriend(match.username);
        resultDiv.appendChild(btn);
      } else {
        resultDiv.textContent = "لم يتم العثور على المستخدم.";
      }
    });
}

function addFriend(friendUsername) {
  const currentUsername = localStorage.getItem("username");
  fetch("/add-friend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentUsername, friendUsername })
  })
  .then(res => res.json())
  .then(result => {
    if (result.success) {
      alert("تمت إضافة الصديق!");
      window.location.reload();
    } else {
      alert(result.message || "خطأ.");
    }
  });
}
