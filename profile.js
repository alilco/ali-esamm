// تأكد من تحميل Firebase
const auth = firebase.auth();
const database = firebase.database();

const displayNameInput = document.getElementById('displayName');
const statusInput = document.getElementById('status');
const profileImageInput = document.getElementById('profileImage');
const saveBtn = document.getElementById('saveBtn');
const message = document.getElementById('message');

// تحميل بيانات المستخدم الحالي وعرضها
auth.onAuthStateChanged(user => {
  if (user) {
    database.ref('users/' + user.uid).once('value').then(snapshot => {
      const data = snapshot.val();
      if (data) {
        displayNameInput.value = data.displayName || '';
        statusInput.value = data.status || '';
      }
    });
  } else {
    window.location.href = "index.html"; // إعادة توجيه إذا لم يكن مسجل دخول
  }
});

// حفظ التعديلات
saveBtn.addEventListener('click', () => {
  const user = auth.currentUser;
  if (user) {
    const updates = {
      displayName: displayNameInput.value,
      status: statusInput.value
    };

    // رفع صورة جديدة إذا اختار
    const file = profileImageInput.files[0];
    if (file) {
      const storageRef = firebase.storage().ref('profileImages/' + user.uid);
      storageRef.put(file).then(snapshot => {
        snapshot.ref.getDownloadURL().then(url => {
          updates.profileImage = url;
          updateUser(user.uid, updates);
        });
      }).catch(error => {
        message.innerText = 'فشل رفع الصورة: ' + error.message;
      });
    } else {
      updateUser(user.uid, updates);
    }
  }
});

// تحديث بيانات المستخدم
function updateUser(uid, updates) {
  database.ref('users/' + uid).update(updates)
    .then(() => {
      message.innerText = 'تم حفظ التعديلات بنجاح!';
    })
    .catch(error => {
      message.innerText = 'حدث خطأ أثناء الحفظ: ' + error.message;
    });
}
