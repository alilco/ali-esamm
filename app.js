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
let currentChatId = null;
let currentChatUser = null;
let isTyping = false;
let typingTimeout = null;

// ========== وظائف المصادقة ==========
function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorElement = document.getElementById('auth-error');

  if (!email || !password) {
    showError(errorElement, 'الرجاء إدخال البريد الإلكتروني وكلمة السر');
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      loadUserData();
      showHome();
    })
    .catch((error) => {
      showError(errorElement, getAuthErrorMessage(error.code));
    });
}

function signUp() {
  const username = document.getElementById('username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const errorElement = document.getElementById('signup-error');

  if (!username || !email || !password) {
    showError(errorElement, 'الرجاء إدخال جميع الحقول');
    return;
  }

  if (password.length < 6) {
    showError(errorElement, 'كلمة السر يجب أن تكون 6 أحرف على الأقل');
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      return db.ref('users/' + currentUser.uid).set({
        username: username,
        email: email,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        status: 'متصل الآن'
      });
    })
    .then(() => {
      showLogin();
      alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول');
    })
    .catch((error) => {
      showError(errorElement, getAuthErrorMessage(error.code));
    });
}

function signOut() {
  if (currentUser) {
    // تحديث حالة المستخدم إلى غير متصل قبل تسجيل الخروج
    db.ref('users/' + currentUser.uid + '/status').set('غير متصل')
      .then(() => {
        auth.signOut();
      });
  } else {
    auth.signOut();
  }
}

function getAuthErrorMessage(errorCode) {
  const messages = {
    'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
    'auth/invalid-email': 'بريد إلكتروني غير صالح',
    'auth/weak-password': 'كلمة السر ضعيفة جداً',
    'auth/user-not-found': 'الحساب غير موجود',
    'auth/wrong-password': 'كلمة السر غير صحيحة'
  };
  return messages[errorCode] || 'حدث خطأ غير متوقع';
}

// ========== وظائف واجهة المستخدم ==========
function showLogin() {
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('signup-section').classList.add('hidden');
  document.getElementById('home-section').classList.add('hidden');
  clearErrors();
}

function showSignUp() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('signup-section').classList.remove('hidden');
  document.getElementById('home-section').classList.add('hidden');
  clearErrors();
}

function showHome() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('signup-section').classList.add('hidden');
  document.getElementById('home-section').classList.remove('hidden');
  document.getElementById('chat-section').classList.add('hidden');
  document.getElementById('profile-section').classList.add('hidden');
  
  loadConversations();
}

function showProfile() {
  document.getElementById('profile-section').classList.remove('hidden');
  loadProfileData();
}

function hideProfile() {
  document.getElementById('profile-section').classList.add('hidden');
}

function showChat(userId, username) {
  currentChatUser = { id: userId, name: username };
  currentChatId = [currentUser.uid, userId].sort().join('_');
  
  document.getElementById('chat-with-user').textContent = username;
  document.getElementById('chat-section').classList.remove('hidden');
  document.getElementById('conversations-list').classList.add('hidden');
  
  loadMessages();
  setupTypingListener();
}

function hideChat() {
  document.getElementById('chat-section').classList.add('hidden');
  document.getElementById('conversations-list').classList.remove('hidden');
  currentChatId = null;
  currentChatUser = null;
}

function showError(element, message) {
  element.textContent = message;
  element.classList.remove('hidden');
}

function clearErrors() {
  document.querySelectorAll('[id$="-error"]').forEach(el => {
    el.classList.add('hidden');
  });
}

// ========== وظائف البيانات ==========
function loadUserData() {
  db.ref('users/' + currentUser.uid).on('value', (snapshot) => {
    const userData = snapshot.val();
    if (userData) {
      document.getElementById('current-username').textContent = userData.username;
    }
  });
}

function loadProfileData() {
  db.ref('users/' + currentUser.uid).once('value').then((snapshot) => {
    const userData = snapshot.val();
    if (userData) {
      document.getElementById('profile-username').textContent = userData.username;
      document.getElementById('profile-email').textContent = userData.email;
      document.getElementById('fullname').value = userData.fullname || '';
      document.getElementById('status').value = userData.status || '';
    }
  });
}

function updateProfile() {
  const fullname = document.getElementById('fullname').value;
  const status = document.getElementById('status').value;
  
  db.ref('users/' + currentUser.uid).update({
    fullname: fullname,
    status: status
  }).then(() => {
    hideProfile();
    alert('تم تحديث الملف الشخصي بنجاح');
  });
}

function loadConversations() {
  const conversationsList = document.getElementById('conversations-list');
  conversationsList.innerHTML = '<div class="p-4 text-center text-gray-500">جاري تحميل المحادثات...</div>';
  
  db.ref('users').orderByChild('username').on('value', (snapshot) => {
    conversationsList.innerHTML = '';
    
    snapshot.forEach((childSnapshot) => {
      const user = childSnapshot.val();
      const userId = childSnapshot.key;
      
      if (userId !== currentUser.uid) {
        const conversationItem = document.createElement('div');
        conversationItem.className = 'p-3 border-b flex items-center hover:bg-gray-50 cursor-pointer';
        conversationItem.innerHTML = `
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl mr-3">
            ${user.username.charAt(0).toUpperCase()}
          </div>
          <div class="flex-1">
            <div class="font-bold">${user.username}</div>
            <div class="text-sm text-gray-500">${user.status || 'غير متصل'}</div>
          </div>
          <i class="fas fa-chevron-left text-gray-400"></i>
        `;
        conversationItem.addEventListener('click', () => showChat(userId, user.username));
        conversationsList.appendChild(conversationItem);
      }
    });
    
    if (conversationsList.children.length === 0) {
      conversationsList.innerHTML = '<div class="p-4 text-center text-gray-500">لا توجد محادثات بعد</div>';
    }
  });
}

function loadMessages() {
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.innerHTML = '<div class="text-center py-4 text-gray-500">جاري تحميل الرسائل...</div>';
  
  db.ref('chats/' + currentChatId).orderByChild('timestamp').on('value', (snapshot) => {
    chatMessages.innerHTML = '';
    
    if (!snapshot.exists()) {
      chatMessages.innerHTML = '<div class="text-center py-4 text-gray-500">ابدأ المحادثة الآن!</div>';
      return;
    }
    
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val();
      const isSent = message.sender === currentUser.uid;
      
      const messageDiv = document.createElement('div');
      messageDiv.className = `p-3 max-w-xs ${isSent ? 'ml-auto message-sent' : 'mr-auto message-received'}`;
      messageDiv.innerHTML = `
        <div>${message.text}</div>
        <div class="text-xs mt-1 ${isSent ? 'text-blue-100' : 'text-gray-500'}">
          ${new Date(message.timestamp).toLocaleTimeString()}
        </div>
      `;
      chatMessages.appendChild(messageDiv);
    });
    
    // التمرير للأسفل لرؤية أحدث الرسائل
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

function sendMessage() {
  const messageInput = document.getElementById('message-input');
  const message = messageInput.value.trim();
  
  if (!message || !currentChatId) return;
  
  // إرسال الرسالة
  db.ref('chats/' + currentChatId).push({
    text: message,
    sender: currentUser.uid,
    timestamp: Date.now()
  }).then(() => {
    messageInput.value = '';
  });
  
  // إعلام المستخدم الآخر أنك تكتب
  updateTypingStatus(false);
}

function setupTypingListener() {
  db.ref('users/' + currentChatUser.id + '/typing').on('value', (snapshot) => {
    const typingData = snapshot.val();
    const typingIndicator = document.getElementById('typing-indicator');
    
    if (typingData && typingData.isTyping && typingData.chatId === currentChatId) {
      document.getElementById('typing-user').textContent = currentChatUser.name;
      typingIndicator.classList.remove('hidden');
    } else {
      typingIndicator.classList.add('hidden');
    }
  });
}

function updateTypingStatus(isTyping) {
  if (!currentChatId) return;
  
  clearTimeout(typingTimeout);
  
  if (isTyping) {
    db.ref('users/' + currentUser.uid + '/typing').set({
      isTyping: true,
      chatId: currentChatId
    });
    
    typingTimeout = setTimeout(() => {
      updateTypingStatus(false);
    }, 2000);
  } else {
    db.ref('users/' + currentUser.uid + '/typing').set({
      isTyping: false,
      chatId: currentChatId
    });
  }
}

// ========== إدارة الأحداث ==========
document.getElementById('message-input').addEventListener('input', () => {
  if (!isTyping) {
    isTyping = true;
    updateTypingStatus(true);
  }
});

document.getElementById('message-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// مراقبة حالة المصادقة
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    loadUserData();
    showHome();
    
    // تحديث حالة المستخدم إلى متصل
    db.ref('users/' + currentUser.uid + '/status').set('متصل الآن');
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
window.showProfile = showProfile;
window.hideProfile = hideProfile;
window.updateProfile = updateProfile;
window.sendMessage = sendMessage;
