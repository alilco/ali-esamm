function saveSession(username) {
  localStorage.setItem("username", username);
}

function getSession() {
  return localStorage.getItem("username");
}

function logout() {
  localStorage.removeItem("username");
  window.location.href = "login.html";
}

function addFriend(friendUsername) {
  const currentUser = getSession();
  if (!currentUser || !friendUsername) return;

  fetch("users.json")
    .then((res) => res.json())
    .then((users) => {
      const current = users.find((u) => u.username === currentUser);
      const friend = users.find((u) => u.username === friendUsername);

      if (!friend) {
        alert("المستخدم غير موجود.");
        return;
      }

      if (!current.friends.includes(friendUsername)) {
        current.friends.push(friendUsername);
        friend.friends.push(currentUser);

        // تحديث البيانات (مثال فقط – تحتاج خادم يدعم الكتابة)
        console.log("تمت إضافة الصديق بنجاح.");
      } else {
        alert("الصديق موجود بالفعل.");
      }
    });
}

function searchUsers(keyword) {
  fetch("users.json")
    .then((res) => res.json())
    .then((users) => {
      const results = users.filter((user) =>
        user.username.includes(keyword.toLowerCase())
      );
      displaySearchResults(results);
    });
}

function displaySearchResults(users) {
  const resultDiv = document.getElementById("searchResults");
  resultDiv.innerHTML = "";
  users.forEach((user) => {
    const userDiv = document.createElement("div");
    userDiv.className = "user-result";
    userDiv.innerHTML = `
      <p>${user.displayName} (@${user.username})</p>
      <button onclick="startChat('${user.username}')">مراسلة</button>
    `;
    resultDiv.appendChild(userDiv);
  });
}

function startChat(friendUsername) {
  window.location.href = `private-chat.html?user=${friendUsername}`;
}
