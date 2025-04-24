let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

function login(username, password) {
  fetch('/users')
    .then(res => res.json())
    .then(users => {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'chat.html';
      } else {
        alert('بيانات غير صحيحة');
      }
    });
}

function signup(username, password, displayName) {
  fetch('/users')
    .then(res => res.json())
    .then(users => {
      if (users.some(u => u.username === username)) {
        alert('اسم المستخدم موجود بالفعل');
        return;
      }

      const newUser = {
        username,
        password,
        displayName,
        profileImage: 'default.png',
        lastSeen: new Date().toISOString(),
        status: 'متصل'
      };

      users.push(newUser);

      fetch('/users', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(users)
      }).then(() => {
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        window.location.href = 'chat.html';
      });
    });
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

function toggleDarkMode() {
  document.body.classList.toggle('dark');
}

// المزيد من الوظائف سيتم إضافتها لاحقًا هنا كالدردشة والبحث وإضافة الأصدقاء...
