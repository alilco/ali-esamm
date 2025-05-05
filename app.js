// تهيئة Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
  authDomain: "messengerapp-58f7a.firebaseapp.com",
  databaseURL: "https://messengerapp-58f7a-default-rtdb.firebaseio.com",
  projectId: "messengerapp-58f7a",
  storageBucket: "messengerapp-58f7a.firebasestorage.app",
  messagingSenderId: "46178168523",
  appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// متغيرات التطبيق
let currentUser = null;
let selectedUserId = null;
let selectedUsername = null;

// ========== وظائف المصادقة ==========

// تسجيل الدخول
function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorElement = document.getElementById('auth-error');

  // التحقق من المدخلات
  if (!email || !password) {
    errorElement.textContent = 'الرجاء إدخال البريد الإلكتروني وكلمة السر';
    errorElement.classList.remove('hidden');
    return;
  }

  errorElement.classList.add('hidden');

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      loadUserProfile();
      showHome();
    })
    .catch((error) => {
      let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'البريد الإلكتروني غير مسجل';
          break;
        case 'auth/wrong-password':
          errorMessage = 'كلمة السر غير صحيحة';
          break;
        case 'auth/invalid-email':
          errorMessage = 'بريد إلكتروني غير صالح';
          break;
      }
      errorElement.textContent = errorMessage;
      errorElement.classList.remove('hidden');
    });
}

// إنشاء حساب جديد
function signUp() {
  const username = document.getElementById('username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const errorElement = document.getElementById('signup-error');

  // التحقق من المدخلات
  if (!username || !email || !password) {
    errorElement.textContent = 'الرجاء إدخال جميع الحقول المطلوبة';
    errorElement.classList.remove('hidden');
    return;
  }

  if (password.length < 6) {
    errorElement.textContent = 'كلمة السر يجب أن تكون 6 أحرف على الأقل';
    errorElement.classList.remove('hidden');
    return;
  }

  errorElement.classList.add('hidden');

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      
      // حفظ معلومات المستخدم في قاعدة البيانات
      return db.ref('users/' + currentUser.uid).set({
        username: username,
        email: email,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });
    })
    .then(() => {
      showLogin();
      document.getElementById('signup-error').classList.add('hidden');
      alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول');
    })
    .catch((error) => {
      let errorMessage = 'حدث خطأ أثناء إنشاء الحساب';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
          break;
        case 'auth/invalid-email':
          errorMessage = 'بريد إلكتروني غير صالح';
          break;
        case 'auth/weak-password':
          errorMessage = 'كلمة السر ضعيفة جداً';
          break;
      }
      errorElement.textContent = errorMessage;
      errorElement.classList.remove('hidden');
    });
}

// تسجيل الخروج
function signOut() {
  auth.signOut().then(() => {
    currentUser = null;
    selectedUserId = null;
    showLogin();
  }).catch((error) => {
    console.error('Error signing out:', error);
  });
}

// ========== وظائف واجهة المستخدم ==========

// عرض شاشة تسجيل الدخول
function showLogin() {
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('signup-section').classList.add('hidden');
  document.getElementById('home-section').classList.add('hidden');
  
  // مسح حقول الإدخال
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  document.getElementById('auth-error').classList.add('hidden');
}

// عرض شاشة إنشاء حساب
function showSignUp() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('signup-section').classList.remove('hidden');
  document.getElementById('home-section').classList.add('hidden');
  
  // مسح حقول الإدخال
  document.getElementById('username').value = '';
  document.getElementById('signup-email').value = '';
  document.getElementById('signup-password').value = '';
  document.getElementById('signup-error').classList.add('hidden');
}

// عرض الشاشة الرئيسية
function showHome() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('signup-section').classList.add('hidden');
  document.getElementById('home-section').classList.remove('hidden');
  
  // تحميل قائمة المستخدمين
  loadUsers();
}

// عرض شاشة إضافة مستخدم
function showAddUser() {
  document.getElementById('add-user-section').classList.remove('hidden');
  document.getElementById('add-username').value = '';
  document.getElementById('add-user-error').classList.add('hidden');
}

// إخفاء شاشة إضافة مستخدم
function hideAddUser() {
  document.getElementById('add-user-section').classList.add('hidden');
}

// عرض شاشة المحادثة
function showChat(userId, username) {
  selectedUserId = userId;
  selectedUsername = username;
  
  document.getElementById('chat-with').textContent = username;
  document.getElementById('chat-section').classList.remove('hidden');
  document.getElementById('chat-input').value = '';
  
  // تحميل الرسائل
  loadMessages();
}

// إخفاء شاشة المحادثة
function hideChat() {
  document.getElementById('chat-section').classList.add('hidden');
  selectedUserId = null;
  selectedUsername = null;
}

// عرض شاشة المعلومات الشخصية
function showProfile() {
  document.getElementById('profile-section').classList.remove('hidden');
  
  // تعبئة البيانات الحالية
  db.ref('users/' + currentUser.uid).once('value').then((snapshot) => {
    const userData = snapshot.val();
    document.getElementById('profile-username').value = userData.username || '';
    document.getElementById('profile-email').value = userData.email || currentUser.email;
  });
}

// إخفاء شاشة المعلومات الشخصية
function hideProfile() {
  document.getElementById('profile-section').classList.add('hidden');
  document.getElementById('profile-error').classList.add('hidden');
}

// ========== وظائف قاعدة البيانات ==========

// تحميل بيانات المستخدم الشخصية
function loadUserProfile() {
  return db.ref('users/' + currentUser.uid).once('value').then((snapshot) => {
    const userData = snapshot.val();
    if (!userData) {
      // إذا لم يكن للمستخدم بيانات، ننشئها
      return db.ref('users/' + currentUser.uid).set({
        username: currentUser.email.split('@')[0],
        email: currentUser.email,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });
    }
    return Promise.resolve();
  });
}

// تحميل قائمة المستخدمين
function loadUsers() {
  const usersList = document.getElementById('users');
  usersList.innerHTML = '<li class="text-center py-2 text-gray-500">جاري التحميل...</li>';
  
  db.ref('users').orderByChild('username').on('value', (snapshot) => {
    usersList.innerHTML = '';
    
    snapshot.forEach((childSnapshot) => {
      const user = childSnapshot.val();
      const userId = childSnapshot.key;
      
      // لا نعرض المستخدم الحالي في القائمة
      if (userId !== currentUser.uid) {
        const li = document.createElement('li');
        li.className = 'user-item flex items-center p-3 rounded-lg';
        li.innerHTML = `
          <div class="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
            ${user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div class="font-semibold">${user.username}</div>
            <div class="text-sm text-gray-500">${user.email}</div>
          </div>
        `;
        li.addEventListener('click', () => showChat(userId, user.username));
        usersList.appendChild(li);
      }
    });
    
    if (usersList.children.length === 0) {
      usersList.innerHTML = '<li class="text-center py-2 text-gray-500">لا يوجد مستخدمون آخرون</li>';
    }
  });
}

// إضافة مستخدم جديد
function addUser() {
  const username = document.getElementById('add-username').value.trim();
  const errorElement = document.getElementById('add-user-error');
  
  if (!username) {
    errorElement.textContent = 'الرجاء إدخال اسم المستخدم';
    errorElement.classList.remove('hidden');
    return;
  }
  
  // البحث عن المستخدم بالاسم
  db.ref('users').orderByChild('username').equalTo(username).once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        // المستخدم موجود، نضيفه إلى قائمة الأصدقاء
        snapshot.forEach((childSnapshot) => {
          const userId = childSnapshot.key;
          const userData = childSnapshot.val();
          
          // نتحقق من عدم وجود صداقة مسبقاً
          return db.ref('friends/' + currentUser.uid + '/' + userId).once('value')
            .then((friendSnapshot) => {
              if (!friendSnapshot.exists()) {
                // ننشئ صداقة جديدة
                return db.ref('friends/' + currentUser.uid + '/' + userId).set({
                  username: userData.username,
                  email: userData.email,
                  addedAt: firebase.database.ServerValue.TIMESTAMP
                });
              }
              return Promise.resolve();
            });
        }).then(() => {
          hideAddUser();
          alert(`تمت إضافة ${username} بنجاح`);
        });
      } else {
        errorElement.textContent = 'اسم المستخدم غير موجود';
        errorElement.classList.remove('hidden');
      }
    })
    .catch((error) => {
      errorElement.textContent = 'حدث خطأ أثناء البحث عن المستخدم';
      errorElement.classList.remove('hidden');
      console.error('Error adding user:', error);
    });
}

// تحميل الرسائل
function loadMessages() {
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.innerHTML = '<div class="text-center py-4 text-gray-500">جاري تحميل الرسائل...</div>';
  
  // إنشاء معرف المحادثة (فرز IDs لتكون دائماً نفسها بغض النظر عن الترتيب)
  const chatId = [currentUser.uid, selectedUserId].sort().join('_');
  
  db.ref('chats/' + chatId).orderByChild('timestamp').on('value', (snapshot) => {
    chatMessages.innerHTML = '';
    
    if (!snapshot.exists()) {
      chatMessages.innerHTML = '<div class="text-center py-4 text-gray-500">لا توجد رسائل بعد. ابدأ المحادثة الآن!</div>';
      return;
    }
    
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val();
      const isSent = message.sender === currentUser.uid;
      
      const messageDiv = document.createElement('div');
      messageDiv.className = `p-3 rounded-lg ${isSent ? 'message-sent' : 'message-received'}`;
      messageDiv.textContent = message.text;
      
      chatMessages.appendChild(messageDiv);
    });
    
    // التمرير إلى آخر رسالة
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

// إرسال رسالة
function sendMessage() {
  const messageInput = document.getElementById('chat-input');
  const message = messageInput.value.trim();
  
  if (!message) return;
  
  // إنشاء معرف المحادثة
  const chatId = [currentUser.uid, selectedUserId].sort().join('_');
  
  // إرسال الرسالة
  db.ref('chats/' + chatId).push({
    text: message,
    sender: currentUser.uid,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  })
  .then(() => {
    messageInput.value = '';
  })
  .catch((error) => {
    console.error('Error sending message:', error);
    alert('حدث خطأ أثناء إرسال الرسالة');
  });
}

// تحديث المعلومات الشخصية
function updateProfile() {
  const username = document.getElementById('profile-username').value.trim();
  const email = document.getElementById('profile-email').value.trim();
  const errorElement = document.getElementById('profile-error');
  
  if (!username || !email) {
    errorElement.textContent = 'الرجاء إدخال جميع الحقول المطلوبة';
    errorElement.classList.remove('hidden');
    return;
  }
  
  // تحديث البيانات في قاعدة البيانات
  db.ref('users/' + currentUser.uid).update({
    username: username,
    email: email
  })
  .then(() => {
    hideProfile();
    alert('تم تحديث المعلومات بنجاح');
  })
  .catch((error) => {
    errorElement.textContent = 'حدث خطأ أثناء تحديث المعلومات';
    errorElement.classList.remove('hidden');
    console.error('Error updating profile:', error);
  });
}

// ========== إدارة حالة المصادقة ==========

// مراقبة حالة المصادقة
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    loadUserProfile().then(() => {
      if (!document.getElementById('home-section').classList.contains('hidden')) {
        loadUsers();
      }
    });
  } else {
    currentUser = null;
    showLogin();
  }
});

// جعل الدوال متاحة عالمياً
window.signIn = signIn;
window.signUp = signUp;
window.signOut = signOut;
window.showSignUp = showSignUp;
window.showLogin = showLogin;
window.showAddUser = showAddUser;
window.hideAddUser = hideAddUser;
window.addUser = addUser;
window.showChat = showChat;
window.hideChat = hideChat;
window.sendMessage = sendMessage;
window.showProfile = showProfile;
window.hideProfile = hideProfile;
window.updateProfile = updateProfile;

// السماح بإرسال الرسالة بالضغط على Enter
document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});
