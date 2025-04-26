const auth = firebase.auth();
const database = firebase.database();
const logoutBtn = document.getElementById('logoutBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const settingsMessage = document.getElementById('settingsMessage');

// تسجيل الخروج
logoutBtn.addEventListener('click', () => {
  auth.signOut()
    .then(() => {
      window.location.href = "index.html";
    })
    .catch(error => {
      settingsMessage.innerText = "خطأ أثناء تسجيل الخروج: " + error.message;
    });
});

// حذف الحساب نهائيا
deleteAccountBtn.addEventListener('click', () => {
  const user = auth.currentUser;
  if (user) {
    // حذف بيانات المستخدم من قاعدة البيانات
    database.ref('users/' + user.uid).remove()
      .then(() => {
        // ثم حذف الحساب من المصادقة
        return user.delete();
      })
      .then(() => {
        settingsMessage.innerText = "تم حذف الحساب بنجاح.";
        window.location.href = "index.html";
      })
      .catch(error => {
        settingsMessage.innerText = "خطأ أثناء حذف الحساب: " + error.message;
      });
  }
});

// تفعيل الوضع الليلي
darkModeToggle.addEventListener('change', () => {
  if (darkModeToggle.checked) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
  }
});

// تحميل حالة الوضع الليلي
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
  darkModeToggle.checked = true;
}
