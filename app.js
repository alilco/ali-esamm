// تكوين Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
    authDomain: "messengerapp-58f7a.firebaseapp.com",
    databaseURL: "https://messengerapp-58f7a-default-rtdb.firebaseio.com",
    projectId: "messengerapp-58f7a",
    storageBucket: "messengerapp-58f7a.firebasestorage.app",
    messagingSenderId: "46178168523",
    appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// المراجع للعناصر المختلفة في واجهة المستخدم
const loadingScreen = document.getElementById('loadingScreen');
const loginContainer = document.getElementById('loginContainer');
const registerContainer = document.getElementById('registerContainer');
const chatContainer = document.getElementById('chatContainer');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const goToRegisterBtn = document.getElementById('goToRegisterBtn');
const goToLoginBtn = document.getElementById('goToLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const chatList = document.getElementById('chatList');
const pinnedChatList = document.getElementById('pinnedChatList');
const pinnedChatsHeader = document.querySelector('.pinned-chats-header');
const chatMain = document.getElementById('chatMain');
const chatSidebar = document.getElementById('chatSidebar');
const currentChatName = document.getElementById('currentChatName');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const backToChats = document.getElementById('backToChats');
const userDisplayName = document.getElementById('userDisplayName');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const typingIndicator = document.getElementById('typingIndicator');
const chatUserStatus = document.getElementById('chatUserStatus');
const userOnlineStatus = document.getElementById('userOnlineStatus');

// عناصر الملف الشخصي
const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfileBtn = document.getElementById('closeProfileBtn');
const profileForm = document.getElementById('profileForm');
const profileFullName = document.getElementById('profileFullName');
const profileUsername = document.getElementById('profileUsername');
const profileEmail = document.getElementById('profileEmail');
const profileError = document.getElementById('profileError');
const profilePhoto = document.getElementById('profilePhoto');
const changePhotoBtn = document.getElementById('changePhotoBtn');
const photoInput = document.getElementById('photoInput');

// عناصر معاينة الصورة
const imagePreviewModal = document.getElementById('imagePreviewModal');
const imagePreview = document.getElementById('imagePreview');
const confirmImageBtn = document.getElementById('confirmImageBtn');
const cancelImageBtn = document.getElementById('cancelImageBtn');

// عناصر إضافة المستخدم
const addUserBtn = document.getElementById('addUserBtn');
const addUserContainer = document.getElementById('addUserContainer');
const searchUsername = document.getElementById('searchUsername');
const searchUserBtn = document.getElementById('searchUserBtn');
const searchResults = document.getElementById('searchResults');

// عناصر الرموز التعبيرية
const emojiBtn = document.getElementById('emojiBtn');
const emojiPickerContainer = document.getElementById('emojiPickerContainer');

// عناصر إرسال الصور
const imageInput = document.getElementById('imageInput');
const imageButton = document.getElementById('imageButton');

// عناصر الحظر
const blockUserBtn = document.getElementById('blockUserBtn');
const unblockUserBtn = document.getElementById('unblockUserBtn');

// عناصر تثبيت المحادثة
const pinChatBtn = document.getElementById('pinChatBtn');
const unpinChatBtn = document.getElementById('unpinChatBtn');

// عناصر الوضع المظلم
const darkModeBtn = document.getElementById('darkModeBtn');

// متغيرات عامة لحالة التطبيق
let currentUser = null;
let currentUserData = null;
let currentChatId = null;
let currentChatUser = null;
let myContacts = {}; // المستخدمين الذين تمت إضافتهم فقط
let allUsers = {}; // جميع المستخدمين في النظام
let isAddUserVisible = false;
let selectedImageBase64 = null; // لتخزين الصورة المختارة كـ Base64
let typingTimeout = null; // مؤقت لمؤشر الكتابة
let onlineStatusRef = null; // مرجع حالة الاتصال
let usersOnlineStatus = {}; // تخزين حالة اتصال المستخدمين

// وظائف المساعدة
function showElement(element) {
    element.style.display = 'flex';
}

function hideElement(element) {
    element.style.display = 'none';
}

function showLoginForm() {
    hideElement(registerContainer);
    hideElement(chatContainer);
    showElement(loginContainer);
}

function showRegisterForm() {
    hideElement(loginContainer);
    hideElement(chatContainer);
    showElement(registerContainer);
}

function showChatInterface() {
    hideElement(loginContainer);
    hideElement(registerContainer);
    showElement(chatContainer);
}

function toggleAddUserContainer() {
    isAddUserVisible = !isAddUserVisible;
    addUserContainer.style.display = isAddUserVisible ? 'block' : 'none';
    if (isAddUserVisible) {
        searchUsername.focus();
    } else {
        searchResults.innerHTML = '';
        searchUsername.value = '';
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// طلب إذن الإشعارات
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission()
            .then(permission => {
                if (permission === 'granted') {
                    console.log('تم منح إذن الإشعارات');
                }
            });
    }
}

// إرسال إشعار عند استلام رسالة جديدة
function sendNotification(senderName, messageText, senderPic = null) {
    if (Notification.permission === 'granted' && document.hidden) {
        let options = {
            body: messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText,
            icon: senderPic || '/favicon.ico'
        };
        
        const notification = new Notification('رسالة جديدة من ' + senderName, options);
        
        notification.onclick = function() {
            window.focus();
            this.close();
        };
        
        // تشغيل صوت تنبيه
        playNotificationSound();
    }
}

// تشغيل صوت التنبيه
function playNotificationSound() {
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3');
    audio.play().catch(e => console.log('فشل تشغيل الصوت:', e));
}

// دالة مساعدة لضغط الصورة
function compressImage(base64Image, maxWidth) {
    return new Promise((resolve, reject) => {
        try {
            const img = new Image();
            img.src = base64Image;
            
            img.onload = function() {
                // حساب نسبة التصغير للحفاظ على التناسب
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    const ratio = maxWidth / width;
                    width = maxWidth;
                    height = height * ratio;
                }
                
                // إنشاء canvas للضغط
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                // رسم الصورة على canvas بالحجم الجديد
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // تحويل canvas إلى Base64 بجودة أقل
                const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
                resolve(compressedImage);
            };
            
            img.onerror = function() {
                reject(new Error('فشل في تحميل الصورة للضغط'));
            };
        } catch (error) {
            reject(error);
        }
    });
}

// الاستماع لحالة المصادقة
firebase.auth().onAuthStateChanged((user) => {
    try {
        if (user) {
            // المستخدم مسجل الدخول
            currentUser = user;
            
            // طلب إذن الإشعارات
            requestNotificationPermission();
            
            // ضبط حالة الاتصال
            setupOnlineStatus(user.uid);
            
            // جلب بيانات المستخدم
            firebase.database().ref(`users/${user.uid}`).once('value')
                .then((snapshot) => {
                    try {
                        const userData = snapshot.val();
                        if (userData) {
                            currentUserData = userData;
                            userDisplayName.textContent = userData.fullName || userData.name || userData.username || user.email;
                            
                            // تحميل جهات الاتصال
                            loadContacts();
                            
                            // تحميل جميع المستخدمين (لأغراض البحث)
                            loadAllUsers();
                            
                            // تحميل المحادثات المثبتة
                            loadPinnedChats();
                            
                            // عرض واجهة الدردشة
                            showChatInterface();
                        } else {
                            // إذا كان المستخدم مسجل ولكن لا توجد بيانات له، نضيف بيانات أساسية
                            const newUserData = {
                                fullName: user.displayName || user.email.split('@')[0],
                                username: user.email.split('@')[0].toLowerCase(),
                                email: user.email,
                                createdAt: firebase.database.ServerValue.TIMESTAMP,
                                profilePicture: user.photoURL || ''
                            };
                            
                            // حفظ بيانات المستخدم
                            firebase.database().ref('users/' + user.uid).set(newUserData)
                                .then(() => {
                                    currentUserData = newUserData;
                                    userDisplayName.textContent = newUserData.fullName;
                                    
                                    // حفظ اسم المستخدم للبحث
                                    firebase.database().ref('usernames/' + newUserData.username).set(user.uid)
                                        .catch(error => console.error("خطأ في حفظ اسم المستخدم:", error));
                                    
                                    loadContacts();
                                    loadAllUsers();
                                    showChatInterface();
                                })
                                .catch(error => {
                                    console.error("خطأ في إنشاء بيانات المستخدم:", error);
                                    showNotification('حدث خطأ أثناء إنشاء ملفك الشخصي', 'error');
                                });
                        }
                    } catch (error) {
                        console.error("خطأ في معالجة بيانات المستخدم:", error);
                        showNotification('حدث خطأ أثناء تحميل بياناتك', 'error');
                    } finally {
                        hideElement(loadingScreen);
                    }
                })
                .catch((error) => {
                    console.error("خطأ في جلب بيانات المستخدم:", error);
                    hideElement(loadingScreen);
                    showNotification('حدث خطأ أثناء تحميل بياناتك', 'error');
                    showLoginForm();
                });
        } else {
            // المستخدم غير مسجل الدخول
            hideElement(loadingScreen);
            currentUser = null;
            currentUserData = null;
            currentChatId = null;
            currentChatUser = null;
            myContacts = {};
            allUsers = {};
            usersOnlineStatus = {};
            
            // إذا كان هناك مرجع لحالة الاتصال، نلغيه
            if (onlineStatusRef) {
                onlineStatusRef.off();
                onlineStatusRef = null;
            }
            
            showLoginForm();
        }
    } catch (error) {
        console.error("خطأ في التحقق من حالة المصادقة:", error);
        hideElement(loadingScreen);
        showNotification('حدث خطأ غير متوقع', 'error');
        showLoginForm();
    }
});

// إعداد مراقبة حالة الاتصال
function setupOnlineStatus(userId) {
    const userStatusRef = firebase.database().ref(`status/${userId}`);
    
    // حفظ حالة الاتصال
    firebase.database().ref('.info/connected').on('value', (snapshot) => {
        if (snapshot.val() === false) {
            return;
        }

        userStatusRef.onDisconnect().set({
            status: 'offline',
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            userStatusRef.set({
                status: 'online',
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            });
        });
    });

    // مراقبة حالة الاتصال للمستخدمين الآخرين
    onlineStatusRef = firebase.database().ref('status');
    onlineStatusRef.on('value', (snapshot) => {
        if (snapshot.exists()) {
            const statuses = snapshot.val();
            usersOnlineStatus = statuses;
            
            // تحديث حالة المستخدم الحالي في المحادثة
            if (currentChatUser && statuses[currentChatUser.id]) {
                updateChatUserStatus(currentChatUser.id);
            }
            
            // تحديث مؤشرات الاتصال في قائمة المحادثات
            updateContactsOnlineStatus();
        }
    });
}

// تحديث حالة الاتصال للمستخدم الحالي في المحادثة
function updateChatUserStatus(userId) {
    if (!userId || !usersOnlineStatus[userId]) return;
    
    const status = usersOnlineStatus[userId];
    
    if (status.status === 'online') {
        chatUserStatus.textContent = 'متصل الآن';
        chatUserStatus.style.color = '#42b72a';
    } else {
        const lastSeen = new Date(status.lastSeen);
        const now = new Date();
        const diffMinutes = Math.floor((now - lastSeen) / (1000 * 60));
        
        if (diffMinutes < 60) {
            chatUserStatus.textContent = `آخر ظهور منذ ${diffMinutes} دقيقة`;
        } else if (diffMinutes < 1440) {
            const hours = Math.floor(diffMinutes / 60);
            chatUserStatus.textContent = `آخر ظهور منذ ${hours} ساعة`;
        } else {
            const days = Math.floor(diffMinutes / 1440);
            chatUserStatus.textContent = `آخر ظهور منذ ${days} يوم`;
        }
        chatUserStatus.style.color = '#65676b';
    }
}

// تحديث مؤشرات الاتصال في قائمة المحادثات
function updateContactsOnlineStatus() {
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        const userId = item.dataset.userId;
        const onlineIndicator = item.querySelector('.online-indicator');
        
        if (userId && usersOnlineStatus[userId] && usersOnlineStatus[userId].status === 'online') {
            if (!onlineIndicator) {
                const profilePic = item.querySelector('.chat-profile-pic');
                const indicator = document.createElement('div');
                indicator.className = 'online-indicator';
                profilePic.appendChild(indicator);
            }
        } else if (onlineIndicator) {
            onlineIndicator.remove();
        }
    });
}

// معالجة الأحداث المتعلقة بتسجيل الدخول وإنشاء حساب
goToRegisterBtn.addEventListener('click', showRegisterForm);
goToLoginBtn.addEventListener('click', showLoginForm);

// معالجة تسجيل الدخول
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showElement(loadingScreen);
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    loginError.textContent = '';

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // تم تسجيل الدخول بنجاح
            loginForm.reset();
        })
        .catch((error) => {
            hideElement(loadingScreen);
            let errorMessage = 'خطأ في تسجيل الدخول';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'البريد الإلكتروني غير مسجل';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'كلمة المرور غير صحيحة';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'البريد الإلكتروني غير صالح';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'تم تعطيل الحساب مؤقتًا بسبب محاولات تسجيل دخول متكررة';
                    break;
                default:
                    errorMessage = `خطأ: ${error.message}`;
            }
            
            loginError.textContent = errorMessage;
            showNotification(errorMessage, 'error');
        });
});

// معالجة إنشاء حساب جديد
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showElement(loadingScreen);
    
    const fullName = document.getElementById('registerFullName').value;
    const username = document.getElementById('registerUsername').value.toLowerCase();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    registerError.textContent = '';
    
    if (password.length < 6) {
        hideElement(loadingScreen);
        registerError.textContent = 'يجب أن تكون كلمة المرور 6 أحرف على الأقل';
        showNotification('يجب أن تكون كلمة المرور 6 أحرف على الأقل', 'error');
        return;
    }

    // أولاً نقوم بإنشاء الحساب
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // ثم نتحقق من اسم المستخدم
            return firebase.database().ref('usernames').child(username).once('value')
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        // حذف الحساب لأن اسم المستخدم مستخدم بالفعل
                        user.delete();
                        throw new Error('اسم المستخدم مستخدم بالفعل');
                    }
                    
                    // إنشاء بيانات المستخدم
                    const userData = {
                        fullName: fullName,
                        username: username,
                        email: email,
                        createdAt: firebase.database.ServerValue.TIMESTAMP,
                        profilePicture: ''
                    };

                    // حفظ بيانات المستخدم
                    const userPromise = firebase.database().ref('users/' + user.uid).set(userData);
                    
                    // حفظ اسم المستخدم للبحث
                    const usernamePromise = firebase.database().ref('usernames/' + username).set(user.uid);
                    
                    return Promise.all([userPromise, usernamePromise]);
                });
        })
        .then(() => {
            hideElement(loadingScreen);
            registerForm.reset();
            showNotification('تم إنشاء الحساب بنجاح!', 'success');
        })
        .catch((error) => {
            hideElement(loadingScreen);
            
            let errorMessage = 'خطأ في إنشاء الحساب';
            
            if (error.message === 'اسم المستخدم مستخدم بالفعل') {
                errorMessage = 'اسم المستخدم مستخدم بالفعل، الرجاء اختيار اسم آخر';
            } else {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'البريد الإلكتروني غير صالح';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'كلمة المرور ضعيفة جدًا';
                        break;
                    default:
                        errorMessage = `خطأ: ${error.message}`;
                }
            }
            
            registerError.textContent = errorMessage;
            showNotification(errorMessage, 'error');
            
            console.error("خطأ في التسجيل:", error);
        });
});

// معالجة تسجيل الخروج
logoutBtn.addEventListener('click', () => {
    showElement(loadingScreen);
    
    // ضبط حالة عدم الاتصال قبل تسجيل الخروج
    if (currentUser) {
        firebase.database().ref(`status/${currentUser.uid}`).set({
            status: 'offline',
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            firebase.auth().signOut()
                .then(() => {
                    hideElement(loadingScreen);
                    showNotification('تم تسجيل الخروج بنجاح', 'success');
                })
                .catch((error) => {
                    hideElement(loadingScreen);
                    console.error('خطأ في تسجيل الخروج:', error);
                    showNotification('حدث خطأ أثناء تسجيل الخروج', 'error');
                });
        }).catch(error => {
            console.error('خطأ في ضبط حالة عدم الاتصال:', error);
            firebase.auth().signOut();
            hideElement(loadingScreen);
        });
    } else {
        firebase.auth().signOut();
        hideElement(loadingScreen);
    }
});

// معالجة فتح وإغلاق مربع الملف الشخصي
profileBtn.addEventListener('click', () => {
    try {
        if (!currentUserData) {
            showNotification('لا يمكن تحميل بيانات الملف الشخصي', 'error');
            return;
        }
        
        // ملء البيانات الحالية
        profileFullName.value = currentUserData.fullName || '';
        profileUsername.value = currentUserData.username || '';
        profileEmail.value = currentUserData.email || '';
        
        if (currentUserData.profilePicture) {
            profilePhoto.innerHTML = `<img src="${currentUserData.profilePicture}" alt="صورة الملف الشخصي">`;
        } else {
            profilePhoto.innerHTML = `<i class="fas fa-user"></i>`;
        }
        
        // إعادة تعيين رسالة الخطأ
        profileError.textContent = '';
        
        // عرض مربع الملف الشخصي
        profileModal.style.display = 'flex';
    } catch (error) {
        console.error('خطأ في فتح الملف الشخصي:', error);
        showNotification('حدث خطأ أثناء تحميل الملف الشخصي', 'error');
    }
});

closeProfileBtn.addEventListener('click', () => {
    profileModal.style.display = 'none';
    profileError.textContent = '';
});

// النقر خارج مربع الحوار لإغلاقه
profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) {
        profileModal.style.display = 'none';
        profileError.textContent = '';
    }
});

// معالجة تغيير الصورة الشخصية
changePhotoBtn.addEventListener('click', () => {
    photoInput.click();
});

// معالجة اختيار صورة جديدة
photoInput.addEventListener('change', (e) => {
    try {
        const file = e.target.files[0];
        if (!file) return;
        
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showNotification('الرجاء اختيار صورة صالحة (JPEG، PNG، GIF)', 'error');
            return;
        }
        
        // التحقق من حجم الملف - الحد 2 ميجابايت
        if (file.size > 2 * 1024 * 1024) {
            showNotification('حجم الصورة يجب أن يكون أقل من 2 ميجابايت', 'error');
            return;
        }
        
        // إنشاء قارئ ملفات لتحويل الصورة إلى Base64
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const base64Image = event.target.result;
            
            // عرض معاينة للصورة قبل التأكيد
            imagePreview.src = base64Image;
            imagePreviewModal.style.display = 'flex';
            selectedImageBase64 = base64Image;
        };
        
        reader.onerror = function() {
            showNotification('حدث خطأ أثناء قراءة الصورة', 'error');
        };
        
        // تحويل الملف إلى Base64
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('خطأ غير متوقع في تغيير الصورة الشخصية:', error);
        showNotification('حدث خطأ أثناء تحميل الصورة', 'error');
    }
});

// معالجة تأكيد الصورة
confirmImageBtn.addEventListener('click', () => {
    if (!selectedImageBase64) {
        imagePreviewModal.style.display = 'none';
        return;
    }
    
    showElement(loadingScreen);
    imagePreviewModal.style.display = 'none';
    
    // ضغط الصورة قبل التخزين
    compressImage(selectedImageBase64, 300)
        .then(compressedImage => {
            // تحديث URL الصورة في قاعدة البيانات
            return firebase.database().ref(`users/${currentUser.uid}`).update({
                profilePicture: compressedImage
            });
        })
        .then(() => {
            // تحديث الصورة في واجهة المستخدم
            profilePhoto.innerHTML = `<img src="${selectedImageBase64}" alt="صورة الملف الشخصي">`;
            if (!currentUserData) currentUserData = {};
            currentUserData.profilePicture = selectedImageBase64;
            
            // تحديث الصورة في كل مكان في التطبيق
            updateUserPictureInChat(currentUser.uid, selectedImageBase64);
            
            hideElement(loadingScreen);
            showNotification('تم تحديث الصورة بنجاح', 'success');
        })
        .catch((error) => {
            hideElement(loadingScreen);
            console.error('خطأ في تحميل الصورة:', error);
            showNotification('حدث خطأ أثناء تحميل الصورة', 'error');
        });
});

// معالجة إلغاء الصورة
cancelImageBtn.addEventListener('click', () => {
    imagePreviewModal.style.display = 'none';
    selectedImageBase64 = null;
});

// تحديث صورة المستخدم في قائمة المحادثات
function updateUserPictureInChat(userId, pictureUrl) {
    try {
        // تحديث صورة المستخدم في قائمة المحادثات
        const chatItems = document.querySelectorAll(`.chat-item[data-user-id="${userId}"] .chat-profile-pic`);
        chatItems.forEach(item => {
            const img = document.createElement('img');
            img.src = pictureUrl;
            img.alt = "صورة المستخدم";
            
            // إزالة المحتوى الحالي
            item.innerHTML = '';
            item.appendChild(img);
            
            // إعادة مؤشر الاتصال إذا كان المستخدم متصلاً
            if (usersOnlineStatus[userId] && usersOnlineStatus[userId].status === 'online') {
                const indicator = document.createElement('div');
                indicator.className = 'online-indicator';
                item.appendChild(indicator);
            }
        });
        
        // تحديث صورة المستخدم في المحادثة الحالية إذا كانت مفتوحة
        if (currentChatUser && currentChatUser.id === userId) {
            const currentChatProfile = document.querySelector('.current-chat-profile');
            if (currentChatProfile) {
                currentChatProfile.innerHTML = `<img src="${pictureUrl}" alt="صورة المستخدم">`;
            }
        }
    } catch (error) {
        console.error('خطأ في تحديث صورة المستخدم:', error);
    }
}

// معالجة تحديث الملف الشخصي
profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    try {
        const fullName = profileFullName.value.trim();
        const username = profileUsername.value.trim().toLowerCase();
        
        if (!fullName || !username) {
            profileError.textContent = 'الرجاء ملء جميع الحقول المطلوبة';
            showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        showElement(loadingScreen);
        
        // التأكد من أن اسم المستخدم غير مستخدم بالفعل (إذا تم تغييره)
        if (username !== currentUserData.username) {
            firebase.database().ref('usernames').child(username).once('value')
                .then((snapshot) => {
                    if (snapshot.exists() && snapshot.val() !== currentUser.uid) {
                        hideElement(loadingScreen);
                        profileError.textContent = 'اسم المستخدم مستخدم بالفعل، الرجاء اختيار اسم آخر';
                        showNotification('اسم المستخدم مستخدم بالفعل', 'error');
                        return Promise.reject(new Error('Username already exists'));
                    }
                    
                    // حذف اسم المستخدم القديم إذا كان موجوداً
                    if (currentUserData.username) {
                        return firebase.database().ref('usernames').child(currentUserData.username).remove();
                    }
                    return Promise.resolve();
                })
                .then(() => {
                    // إضافة اسم المستخدم الجديد
                    return firebase.database().ref('usernames').child(username).set(currentUser.uid);
                })
                .then(() => {
                    // تحديث بيانات المستخدم
                    return firebase.database().ref(`users/${currentUser.uid}`).update({
                        fullName: fullName,
                        username: username
                    });
                })
                .then(() => {
                    // تحديث المتغيرات العامة
                    if (!currentUserData) currentUserData = {};
                    currentUserData.fullName = fullName;
                    currentUserData.username = username;
                    
                    // تحديث العرض
                    userDisplayName.textContent = fullName;
                    
                    hideElement(loadingScreen);
                    showNotification('تم تحديث الملف الشخصي بنجاح', 'success');
                    profileModal.style.display = 'none';
                })
                .catch((error) => {
                    if (error.message === 'Username already exists') return;
                    
                    hideElement(loadingScreen);
                    console.error('خطأ في تحديث الملف الشخصي:', error);
                    profileError.textContent = 'حدث خطأ في تحديث الملف الشخصي';
                    showNotification('حدث خطأ في تحديث الملف الشخصي', 'error');
                });
        } else {
            // تحديث الاسم الكامل فقط
            firebase.database().ref(`users/${currentUser.uid}`).update({
                fullName: fullName
            })
            .then(() => {
                // تحديث المتغيرات العامة
                if (!currentUserData) currentUserData = {};
                currentUserData.fullName = fullName;
                
                // تحديث العرض
                userDisplayName.textContent = fullName;
                
                hideElement(loadingScreen);
                showNotification('تم تحديث الملف الشخصي بنجاح', 'success');
                profileModal.style.display = 'none';
            })
            .catch((error) => {
                hideElement(loadingScreen);
                console.error('خطأ في تحديث الملف الشخصي:', error);
                profileError.textContent = 'حدث خطأ في تحديث الملف الشخصي';
                showNotification('حدث خطأ في تحديث الملف الشخصي', 'error');
            });
        }
    } catch (error) {
        hideElement(loadingScreen);
        console.error('خطأ غير متوقع في تحديث الملف الشخصي:', error);
        profileError.textContent = 'حدث خطأ غير متوقع';
        showNotification('حدث خطأ غير متوقع', 'error');
    }
});

// تحميل جميع المستخدمين
function loadAllUsers() {
    try {
        firebase.database().ref('users').once('value')
            .then((snapshot) => {
                allUsers = snapshot.val() || {};
            })
            .catch((error) => {
                console.error('خطأ في تحميل المستخدمين:', error);
                showNotification('فشل في تحميل قائمة المستخدمين', 'error');
            });
    } catch (error) {
        console.error('خطأ غير متوقع في تحميل المستخدمين:', error);
    }
}

// تحميل المحادثات المثبتة
function loadPinnedChats() {
    try {
        firebase.database().ref(`pinnedChats/${currentUser.uid}`).on('value', (snapshot) => {
            const pinnedChats = snapshot.val() || {};
            pinnedChatList.innerHTML = '';
            
            // إذا كانت هناك محادثات مثبتة، نعرض رأس القسم
            if (Object.keys(pinnedChats).length > 0) {
                pinnedChatsHeader.style.display = 'block';
            } else {
                pinnedChatsHeader.style.display = 'none';
                return;
            }
            
            // إنشاء عنصر لكل محادثة مثبتة
            Object.keys(pinnedChats).forEach(userId => {
                if (pinnedChats[userId]) {
                    firebase.database().ref(`users/${userId}`).once('value')
                        .then((userSnapshot) => {
                            const userData = userSnapshot.val();
                            if (!userData) return;
                            
                            // إنشاء معرف للدردشة بين المستخدمين
                            const chatId = getChatId(currentUser.uid, userId);
                            
                            // إنشاء عنصر في قائمة المحادثات المثبتة
                            createChatItem(chatId, userId, userData, pinnedChatList);
                            
                            // تحديث آخر رسالة وعدد الرسائل غير المقروءة
                            updateLastMessage(chatId);
                            updateUnreadCount(chatId);
                        })
                        .catch(error => {
                            console.error('خطأ في تحميل بيانات المستخدم المثبت:', error);
                        });
                }
            });
        });
    } catch (error) {
        console.error('خطأ غير متوقع في تحميل المحادثات المثبتة:', error);
    }
}

// تحميل جهات الاتصال
function loadContacts() {
    try {
        // قراءة قائمة جهات الاتصال الخاصة بالمستخدم
        firebase.database().ref(`contacts/${currentUser.uid}`).on('value', (snapshot) => {
            const contacts = snapshot.val() || {};
            myContacts = {};
            chatList.innerHTML = '';
            
            // لا توجد جهات اتصال بعد
            if (Object.keys(contacts).length === 0) {
                chatList.innerHTML = '<div class="no-conversations">لم تبدأ محادثات بعد.<br>استخدم زر + لإضافة مستخدم جديد.</div>';
                return;
            }
            
            // الحصول على المحادثات المثبتة لاستبعادها من القائمة العادية
            firebase.database().ref(`pinnedChats/${currentUser.uid}`).once('value')
                .then((pinnedSnapshot) => {
                    const pinnedChats = pinnedSnapshot.val() || {};
                    
                    // إنشاء عنصر لكل جهة اتصال غير مثبتة
                    Object.keys(contacts).forEach(userId => {
                        // تخطي المستخدمين المثبتين
                        if (pinnedChats && pinnedChats[userId]) return;
                        
                        firebase.database().ref(`users/${userId}`).once('value')
                            .then((userSnapshot) => {
                                const userData = userSnapshot.val();
                                if (!userData) return;
                                
                                myContacts[userId] = userData;
                                
                                // إنشاء معرف للدردشة بين المستخدمين
                                const chatId = getChatId(currentUser.uid, userId);
                                
                                // إنشاء عنصر في قائمة المحادثات
                                createChatItem(chatId, userId, userData, chatList);
                                
                                // تحديث آخر رسالة وعدد الرسائل غير المقروءة
                                updateLastMessage(chatId);
                                updateUnreadCount(chatId);
                            })
                            .catch(error => {
                                console.error('خطأ في تحميل بيانات المستخدم:', error);
                            });
                    });
                })
                .catch(error => {
                    console.error('خطأ في تحميل المحادثات المثبتة:', error);
                });
        });
    } catch (error) {
        console.error('خطأ غير متوقع في تحميل جهات الاتصال:', error);
        showNotification('فشل في تحميل جهات الاتصال', 'error');
    }
}

// إنشاء عنصر محادثة في القائمة
function createChatItem(chatId, userId, userData, parentList) {
    // إنشاء عنصر في قائمة المحادثات
    const chatItem = document.createElement('li');
    chatItem.className = 'chat-item';
    chatItem.dataset.chatId = chatId;
    chatItem.dataset.userId = userId;
    
    const isOnline = usersOnlineStatus[userId] && usersOnlineStatus[userId].status === 'online';
    
    chatItem.innerHTML = `
        <div class="chat-profile-pic">
            ${userData.profilePicture
                ? `<img src="${userData.profilePicture}" alt="${userData.fullName}">`
                : `<i class="fas fa-user"></i>`
            }
            ${isOnline ? '<div class="online-indicator"></div>' : ''}
        </div>
        <div class="chat-info">
            <div class="chat-name">${userData.fullName || userData.name || userData.username || 'مستخدم'}</div>
            <div class="chat-last-message">انقر للدردشة</div>
        </div>
    `;
    
    chatItem.addEventListener('click', () => openChat(chatId, userId));
    parentList.appendChild(chatItem);
    
    return chatItem;
}

// تحديث عدد الرسائل غير المقروءة
function updateUnreadCount(chatId) {
    if (!currentUser) return;
    
    firebase.database().ref(`unreadMessages/${currentUser.uid}/${chatId}`).once('value')
        .then(snapshot => {
            const unreadCount = snapshot.val() || 0;
            
            const chatItem = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
            if (!chatItem) return;
            
            // إزالة شارة العدد القديمة إن وجدت
            const oldBadge = chatItem.querySelector('.unread-badge');
            if (oldBadge) {
                oldBadge.remove();
            }
            
            // إضافة شارة جديدة إذا كان هناك رسائل غير مقروءة
            if (unreadCount > 0) {
                const badge = document.createElement('div');
                badge.className = 'unread-badge';
                badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                chatItem.appendChild(badge);
            }
        })
        .catch(error => {
            console.error('خطأ في تحديث عدد الرسائل غير المقروءة:', error);
        });
}

// معالجة البحث عن مستخدمين وإضافتهم
addUserBtn.addEventListener('click', toggleAddUserContainer);

searchUserBtn.addEventListener('click', () => {
    try {
        const searchTerm = searchUsername.value.trim().toLowerCase();
        if (!searchTerm) {
            showNotification('الرجاء إدخال اسم مستخدم للبحث', 'warning');
            return;
        }
        
        searchResults.innerHTML = '<div class="no-conversations">جاري البحث...</div>';
        
        firebase.database().ref('usernames').child(searchTerm).once('value')
            .then((snapshot) => {
                const userId = snapshot.val();
                
                if (!userId) {
                    searchResults.innerHTML = '<div class="no-conversations">لم يتم العثور على مستخدم بهذا الاسم</div>';
                    return;
                }
                
                if (userId === currentUser.uid) {
                    searchResults.innerHTML = '<div class="no-conversations">لا يمكنك إضافة نفسك</div>';
                    return;
                }
                
                // التحقق إذا كان المستخدم موجود بالفعل في جهات الاتصال
                return firebase.database().ref(`contacts/${currentUser.uid}/${userId}`).once('value')
                    .then((contactSnapshot) => {
                        if (contactSnapshot.exists()) {
                            searchResults.innerHTML = '<div class="no-conversations">هذا المستخدم موجود بالفعل في جهات الاتصال الخاصة بك</div>';
                            return null;
                        }
                        
                        // البحث عن بيانات المستخدم
                        return firebase.database().ref(`users/${userId}`).once('value');
                    });
            })
            .then((snapshot) => {
                if (!snapshot || !snapshot.val()) return;
                
                const userData = snapshot.val();
                
                searchResults.innerHTML = `
                    <div class="search-result-item" data-user-id="${snapshot.key}">
                        <div class="user-avatar">
                            ${userData.profilePicture 
                                ? `<img src="${userData.profilePicture}" alt="${userData.fullName}">`
                                : `<i class="fas fa-user"></i>`
                            }
                        </div>
                        <div class="result-user-info">
                            <div class="result-user-name">${userData.fullName || userData.name || userData.username}</div>
                            <div class="result-username">@${userData.username}</div>
                        </div>
                    </div>
                `;
                
                // إضافة الاستماع للنقر
                const resultItem = searchResults.querySelector('.search-result-item');
                if (resultItem) {
                    resultItem.addEventListener('click', () => {
                        const userId = resultItem.dataset.userId;
                        addContact(userId, userData);
                    });
                }
            })
            .catch((error) => {
                console.error('خطأ في البحث عن المستخدم:', error);
                searchResults.innerHTML = '<div class="no-conversations">حدث خطأ أثناء البحث</div>';
                showNotification('حدث خطأ أثناء البحث عن المستخدم', 'error');
            });
    } catch (error) {
        console.error('خطأ غير متوقع في البحث عن المستخدم:', error);
        searchResults.innerHTML = '<div class="no-conversations">حدث خطأ غير متوقع</div>';
        showNotification('حدث خطأ غير متوقع', 'error');
    }
});

// البحث عند الضغط على Enter
searchUsername.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchUserBtn.click();
    }
});

// إضافة مستخدم إلى جهات الاتصال
function addContact(userId, userData) {
    try {
        showElement(loadingScreen);
        
        // إضافة المستخدم إلى جهات الاتصال الخاصة بي
        firebase.database().ref(`contacts/${currentUser.uid}/${userId}`).set(true)
            .then(() => {
                // إضافتي إلى جهات اتصال المستخدم
                return firebase.database().ref(`contacts/${userId}/${currentUser.uid}`).set(true);
            })
            .then(() => {
                hideElement(loadingScreen);
                showNotification('تمت إضافة المستخدم بنجاح', 'success');
                toggleAddUserContainer();
                
                // فتح الدردشة مع المستخدم المضاف
                const chatId = getChatId(currentUser.uid, userId);
                openChat(chatId, userId);
            })
            .catch((error) => {
                hideElement(loadingScreen);
                console.error('خطأ في إضافة المستخدم:', error);
                showNotification('حدث خطأ أثناء إضافة المستخدم', 'error');
            });
    } catch (error) {
        hideElement(loadingScreen);
        console.error('خطأ غير متوقع في إضافة المستخدم:', error);
        showNotification('حدث خطأ غير متوقع', 'error');
    }
}

// تثبيت/إلغاء تثبيت محادثة
pinChatBtn.addEventListener('click', () => {
    if (!currentChatUser || !currentChatUser.id) return;
    
    showElement(loadingScreen);
    firebase.database().ref(`pinnedChats/${currentUser.uid}/${currentChatUser.id}`).set(true)
        .then(() => {
            hideElement(loadingScreen);
            pinChatBtn.style.display = 'none';
            unpinChatBtn.style.display = 'inline-block';
            showNotification('تم تثبيت المحادثة بنجاح', 'success');
        })
        .catch(error => {
            hideElement(loadingScreen);
            console.error('خطأ في تثبيت المحادثة:', error);
            showNotification('حدث خطأ أثناء تثبيت المحادثة', 'error');
        });
});

unpinChatBtn.addEventListener('click', () => {
    if (!currentChatUser || !currentChatUser.id) return;
    
    showElement(loadingScreen);
    firebase.database().ref(`pinnedChats/${currentUser.uid}/${currentChatUser.id}`).remove()
        .then(() => {
            hideElement(loadingScreen);
            unpinChatBtn.style.display = 'none';
            pinChatBtn.style.display = 'inline-block';
            showNotification('تم إلغاء تثبيت المحادثة بنجاح', 'success');
        })
        .catch(error => {
            hideElement(loadingScreen);
            console.error('خطأ في إلغاء تثبيت المحادثة:', error);
            showNotification('حدث خطأ أثناء إلغاء تثبيت المحادثة', 'error');
        });
});

// حظر/إلغاء حظر مستخدم
blockUserBtn.addEventListener('click', () => {
    if (!currentChatUser || !currentChatUser.id) return;
    
    if (confirm(`هل أنت متأكد من حظر ${currentChatUser.fullName || currentChatUser.username}؟`)) {
        showElement(loadingScreen);
        
        firebase.database().ref(`blockedUsers/${currentUser.uid}/${currentChatUser.id}`).set(true)
            .then(() => {
                hideElement(loadingScreen);
                showNotification('تم حظر المستخدم بنجاح', 'success');
                updateBlockUI(true);
            })
            .catch(error => {
                hideElement(loadingScreen);
                console.error('خطأ في حظر المستخدم:', error);
                showNotification('فشل في حظر المستخدم', 'error');
            });
    }
});

unblockUserBtn.addEventListener('click', () => {
    if (!currentChatUser || !currentChatUser.id) return;
    
    showElement(loadingScreen);
    
    firebase.database().ref(`blockedUsers/${currentUser.uid}/${currentChatUser.id}`).remove()
        .then(() => {
            hideElement(loadingScreen);
            showNotification('تم إلغاء حظر المستخدم بنجاح', 'success');
            updateBlockUI(false);
        })
        .catch(error => {
            hideElement(loadingScreen);
            console.error('خطأ في إلغاء حظر المستخدم:', error);
            showNotification('فشل في إلغاء حظر المستخدم', 'error');
        });
});

// تحديث واجهة الحظر
function updateBlockUI(isBlocked) {
    if (isBlocked) {
        blockUserBtn.style.display = 'none';
        unblockUserBtn.style.display = 'inline-block';
        messageInput.disabled = true;
        sendButton.disabled = true;
        imageButton.disabled = true;
        emojiBtn.disabled = true;
        
        // إضافة رسالة الحظر
        const blockedMessage = document.createElement('div');
        blockedMessage.className = 'blocked-message';
        blockedMessage.textContent = 'لقد قمت بحظر هذا المستخدم. يجب إلغاء الحظر للتمكن من المراسلة.';
        messagesContainer.appendChild(blockedMessage);
    } else {
        blockUserBtn.style.display = 'inline-block';
        unblockUserBtn.style.display = 'none';
        messageInput.disabled = false;
        sendButton.disabled = false;
        imageButton.disabled = false;
        emojiBtn.disabled = false;
        
        // إعادة تحميل الرسائل
        loadMessages(currentChatId);
    }
}

// الحصول على معرف الدردشة بين مستخدمين
function getChatId(uid1, uid2) {
    return [uid1, uid2].sort().join('_');
}

// فتح دردشة مع مستخدم محدد
function openChat(chatId, userId) {
    try {
        currentChatId = chatId;
        
        // البحث عن بيانات المستخدم
        firebase.database().ref(`users/${userId}`).once('value')
            .then(snapshot => {
                if (!snapshot.exists()) {
                    showNotification('لم يتم العثور على المستخدم', 'error');
                    return;
                }
                
                const userData = snapshot.val();
                userData.id = userId; // إضافة معرف المستخدم إلى البيانات
                currentChatUser = userData;
                
                // تحديث واجهة المستخدم
                currentChatName.textContent = userData.fullName || userData.name || userData.username || 'مستخدم';
                
                const currentChatProfile = document.querySelector('.current-chat-profile');
                if (currentChatProfile) {
                    if (userData.profilePicture) {
                        currentChatProfile.innerHTML = `<img src="${userData.profilePicture}" alt="${userData.fullName || userData.username}">`;
                    } else {
                        currentChatProfile.innerHTML = `<i class="fas fa-user"></i>`;
                    }
                }
                
                // تحديث حالة الاتصال
                if (usersOnlineStatus[userId]) {
                    updateChatUserStatus(userId);
                } else {
                    chatUserStatus.textContent = '';
                }
                
                // التحقق من حالة الحظر
                return firebase.database().ref(`blockedUsers/${currentUser.uid}/${userId}`).once('value');
            })
            .then(snapshot => {
                const isBlocked = snapshot && snapshot.exists();
                
                // التحقق من حالة التثبيت
                return firebase.database().ref(`pinnedChats/${currentUser.uid}/${userId}`).once('value')
                    .then(pinnedSnapshot => {
                        const isPinned = pinnedSnapshot && pinnedSnapshot.exists();
                        
                        // تحديث أزرار التثبيت
                        pinChatBtn.style.display = isPinned ? 'none' : 'inline-block';
                        unpinChatBtn.style.display = isPinned ? 'inline-block' : 'none';
                        
                        return isBlocked;
                    });
            })
            .then(isBlocked => {
                // تحديث أزرار الحظر
                blockUserBtn.style.display = isBlocked ? 'none' : 'inline-block';
                unblockUserBtn.style.display = isBlocked ? 'inline-block' : 'none';
                
                // تحديث حالة حقول الإدخال
                messageInput.disabled = isBlocked;
                sendButton.disabled = isBlocked;
                imageButton.disabled = isBlocked;
                emojiBtn.disabled = isBlocked;
                
                // إذا كان على شاشة صغيرة، يتم إظهار قسم المحادثة وإخفاء قائمة المحادثات
                if (window.innerWidth <= 768) {
                    chatMain.classList.add('active');
                    chatSidebar.style.display = 'none';
                }
                
                // تحديث المحادثة النشطة في قائمة المحادثات
                const chatItems = document.querySelectorAll('.chat-item');
                chatItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.dataset.chatId === chatId) {
                        item.classList.add('active');
                    }
                });
                
                // إعادة تعيين عدد الرسائل غير المقروءة
                firebase.database().ref(`unreadMessages/${currentUser.uid}/${chatId}`).remove();
                updateUnreadCount(chatId);
                
                // تحميل الرسائل للدردشة الحالية
                loadMessages(chatId);
                
                if (isBlocked) {
                    // إضافة رسالة الحظر
                    setTimeout(() => {
                        const blockedMessage = document.createElement('div');
                        blockedMessage.className = 'blocked-message';
                        blockedMessage.textContent = 'لقد قمت بحظر هذا المستخدم. يجب إلغاء الحظر للتمكن من المراسلة.';
                        messagesContainer.appendChild(blockedMessage);
                    }, 500);
                }
                
                return firebase.database().ref(`typing/${chatId}`).on('value', snapshot => {
                                        if (snapshot.exists()) {
                        const typingUsers = snapshot.val() || {};
                        // تجاهل إشعار الكتابة للمستخدم الحالي
                        if (typingUsers[currentUser.uid]) {
                            delete typingUsers[currentUser.uid];
                        }
                        
                        // إذا كان أي شخص آخر يكتب، أظهر المؤشر
                        if (Object.keys(typingUsers).length > 0) {
                            typingIndicator.style.display = 'block';
                        } else {
                            typingIndicator.style.display = 'none';
                        }
                    } else {
                        typingIndicator.style.display = 'none';
                    }
                });
            })
            .catch(error => {
                console.error('خطأ في تحميل بيانات المستخدم:', error);
                showNotification('حدث خطأ أثناء فتح المحادثة', 'error');
            });
    } catch (error) {
        console.error('خطأ غير متوقع في فتح المحادثة:', error);
        showNotification('حدث خطأ غير متوقع', 'error');
    }
}

// تحميل الرسائل للدردشة المحددة
function loadMessages(chatId) {
    try {
        messagesContainer.innerHTML = '';
        
        firebase.database().ref('messages/' + chatId).on('value', (snapshot) => {
            messagesContainer.innerHTML = '';
            
            if (!snapshot.exists()) {
                const emptyMessages = document.createElement('div');
                emptyMessages.className = 'welcome-message';
                emptyMessages.innerHTML = `
                    <h3>ابدأ المحادثة</h3>
                    <p>لا توجد رسائل بعد. ابدأ بإرسال رسالة!</p>
                `;
                messagesContainer.appendChild(emptyMessages);
                return;
            }
            
            snapshot.forEach((childSnapshot) => {
                const message = childSnapshot.val();
                message.id = childSnapshot.key; // حفظ معرف الرسالة
                displayMessage(message);
            });
            
            // التمرير إلى آخر رسالة
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // تحديث آخر رسالة في قائمة المحادثات
            updateLastMessage(chatId);
        });
    } catch (error) {
        console.error('خطأ غير متوقع في تحميل الرسائل:', error);
        showNotification('حدث خطأ أثناء تحميل الرسائل', 'error');
    }
}

// عرض رسالة في المحادثة
function displayMessage(messageData) {
    try {
        const isCurrentUser = messageData.senderId === currentUser.uid;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isCurrentUser ? 'outgoing' : 'incoming'}`;
        messageElement.dataset.messageId = messageData.id || '';
        
        const messageTime = formatTime(messageData.timestamp);
        
        let messageContent = `
            <div class="message-content">`;
        
        // إذا كان المستخدم الحالي هو المرسل، أضف خيارات للرسالة
        if (isCurrentUser) {
            messageContent += `
                <div class="message-options">
                    <button class="delete-message-btn" onclick="deleteMessage('${messageData.id || ''}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>`;
        }
        
        messageContent += `<div class="message-text">${messageData.text}</div>`;
        
        // إذا كانت الرسالة تحتوي على صورة
        if (messageData.type === 'image' && messageData.image) {
            messageContent += `
                <img src="${messageData.image}" alt="صورة" class="message-image" onclick="showImageFullscreen('${messageData.image}')">`;
        }
        
        messageContent += `<div class="message-time">${messageTime}</div>
            </div>`;
        
        messageElement.innerHTML = messageContent;
        messagesContainer.appendChild(messageElement);
    } catch (error) {
        console.error('خطأ في عرض الرسالة:', error);
    }
}

// تحديث آخر رسالة في قائمة المحادثات
function updateLastMessage(chatId) {
    try {
        firebase.database().ref('messages/' + chatId).limitToLast(1).once('value', (snapshot) => {
            if (!snapshot.exists()) return;
            
            snapshot.forEach((childSnapshot) => {
                const lastMessage = childSnapshot.val();
                const chatItems = document.querySelectorAll(`.chat-item[data-chat-id="${chatId}"]`);
                
                chatItems.forEach(chatItem => {
                    const lastMessageElement = chatItem.querySelector('.chat-last-message');
                    if (lastMessageElement) {
                        let messagePreview = '';
                        
                        // تحديد نوع الرسالة
                        if (lastMessage.type === 'image') {
                            messagePreview = '📷 صورة';
                        } else {
                            messagePreview = lastMessage.text;
                        }
                        
                        // اقتصار طول النص
                        if (messagePreview.length > 30) {
                            messagePreview = messagePreview.substring(0, 30) + '...';
                        }
                        
                        // إذا كان المستخدم الحالي هو مرسل الرسالة، نضيف "أنت: "
                        if (lastMessage.senderId === currentUser.uid) {
                            messagePreview = 'أنت: ' + messagePreview;
                        }
                        
                        lastMessageElement.textContent = messagePreview;
                    }
                });
                
                // إذا كانت الرسالة جديدة ومن مستخدم آخر، وليست مفتوحة حاليًا
                if (lastMessage.senderId !== currentUser.uid && (!currentChatId || currentChatId !== chatId)) {
                    // زيادة عدد الرسائل غير المقروءة
                    firebase.database().ref(`unreadMessages/${currentUser.uid}/${chatId}`).transaction(count => {
                        return (count || 0) + 1;
                    });
                    
                    // إرسال إشعار
                    const senderId = lastMessage.senderId;
                    firebase.database().ref(`users/${senderId}`).once('value')
                        .then(snapshot => {
                            if (snapshot.exists()) {
                                const senderData = snapshot.val();
                                sendNotification(
                                    senderData.fullName || senderData.username || 'مستخدم',
                                    lastMessage.type === 'image' ? '📷 أرسل لك صورة' : lastMessage.text,
                                    senderData.profilePicture
                                );
                            }
                        })
                        .catch(error => {
                            console.error('خطأ في جلب بيانات المرسل:', error);
                        });
                }
            });
        });
    } catch (error) {
        console.error('خطأ في تحديث آخر رسالة:', error);
    }
}

// حذف رسالة
window.deleteMessage = function(messageId) {
    if (!messageId || !currentChatId) return;
    
    if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
        firebase.database().ref(`messages/${currentChatId}/${messageId}`).remove()
            .then(() => {
                showNotification('تم حذف الرسالة بنجاح', 'success');
            })
            .catch(error => {
                console.error('خطأ في حذف الرسالة:', error);
                showNotification('فشل في حذف الرسالة', 'error');
            });
    }
};

// عرض الصورة بالحجم الكامل
window.showImageFullscreen = function(imageUrl) {
    const fullscreenContainer = document.createElement('div');
    fullscreenContainer.className = 'image-fullscreen';
    fullscreenContainer.innerHTML = `<img src="${imageUrl}" alt="صورة بحجم كامل">`;
    
    fullscreenContainer.addEventListener('click', () => {
        document.body.removeChild(fullscreenContainer);
    });
    
    document.body.appendChild(fullscreenContainer);
};

// إرسال رسالة
function sendMessage() {
    try {
        const messageText = messageInput.value.trim();
        if (!messageText || !currentChatId) return;
        
        const messageData = {
            text: messageText,
            senderId: currentUser.uid,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };
        
        // إضافة الرسالة إلى قاعدة البيانات
        const newMessageRef = firebase.database().ref('messages/' + currentChatId).push();
        newMessageRef.set(messageData)
            .then(() => {
                messageInput.value = '';
                messageInput.focus();
                
                // إلغاء حالة الكتابة
                firebase.database().ref(`typing/${currentChatId}/${currentUser.uid}`).remove();
            })
            .catch((error) => {
                console.error('خطأ في إرسال الرسالة:', error);
                showNotification('فشل في إرسال الرسالة', 'error');
            });
    } catch (error) {
        console.error('خطأ غير متوقع في إرسال الرسالة:', error);
        showNotification('حدث خطأ غير متوقع', 'error');
    }
}

// إرسال رسالة صورة
function sendImageMessage(imageBase64) {
    if (!currentChatId) return;
    
    const messageData = {
        type: 'image',
        text: 'صورة',
        image: imageBase64,
        senderId: currentUser.uid,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    
    // إضافة الرسالة إلى قاعدة البيانات
    const newMessageRef = firebase.database().ref('messages/' + currentChatId).push();
    newMessageRef.set(messageData)
        .then(() => {
            hideElement(loadingScreen);
            imageInput.value = ''; // إعادة تعيين حقل الإدخال
        })
        .catch((error) => {
            hideElement(loadingScreen);
            console.error('خطأ في إرسال الصورة:', error);
            showNotification('فشل في إرسال الصورة', 'error');
        });
}

// معالجة النقر على زر الإرسال
sendButton.addEventListener('click', sendMessage);

// معالجة ضغط Enter في حقل الرسالة
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// معالجة مؤشر الكتابة
messageInput.addEventListener('input', () => {
    if (!currentChatId) return;
    
    // إلغاء المؤقت السابق
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }
    
    // ضبط حالة الكتابة
    firebase.database().ref(`typing/${currentChatId}/${currentUser.uid}`).set(true);
    
    // إلغاء حالة الكتابة بعد توقف المستخدم عن الكتابة
    typingTimeout = setTimeout(() => {
        firebase.database().ref(`typing/${currentChatId}/${currentUser.uid}`).remove();
    }, 3000);
});

// معالجة إرسال الصور
imageButton.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', (e) => {
    try {
        const file = e.target.files[0];
        if (!file) return;
        
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showNotification('الرجاء اختيار صورة صالحة (JPEG، PNG، GIF)', 'error');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            showNotification('حجم الصورة يجب أن يكون أقل من 2 ميجابايت', 'error');
            return;
        }
        
        showElement(loadingScreen);
        
        // تحويل الصورة إلى Base64
        const reader = new FileReader();
        reader.onload = function(event) {
            const base64Image = event.target.result;
            
            // ضغط الصورة
            compressImage(base64Image, 800)
                .then(compressedImage => {
                    // إرسال الصورة كرسالة
                    sendImageMessage(compressedImage);
                })
                .catch(error => {
                    hideElement(loadingScreen);
                    console.error('خطأ في ضغط الصورة:', error);
                    showNotification('حدث خطأ أثناء معالجة الصورة', 'error');
                });
        };
        
        reader.onerror = function() {
            hideElement(loadingScreen);
            showNotification('حدث خطأ أثناء قراءة الصورة', 'error');
        };
        
        reader.readAsDataURL(file);
    } catch (error) {
        hideElement(loadingScreen);
        console.error('خطأ غير متوقع في إرسال الصورة:', error);
        showNotification('حدث خطأ غير متوقع', 'error');
    }
});

// الوضع المظلم
darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // حفظ تفضيل المستخدم في التخزين المحلي
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    // تحديث أيقونة الزر
    darkModeBtn.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    darkModeBtn.title = isDarkMode ? 'التحول للوضع العادي' : 'التحول للوضع المظلم';
});

// معالجة الرموز التعبيرية
emojiBtn.addEventListener('click', () => {
    emojiPickerContainer.style.display = emojiPickerContainer.style.display === 'none' ? 'block' : 'none';
});

document.addEventListener('click', (e) => {
    if (!emojiBtn.contains(e.target) && !emojiPickerContainer.contains(e.target)) {
        emojiPickerContainer.style.display = 'none';
    }
});

document.getElementById('emojiPicker').addEventListener('emoji-click', (e) => {
    messageInput.value += e.detail.unicode;
    messageInput.focus();
});

// التعامل مع زر العودة إلى قائمة المحادثات (للشاشات الصغيرة)
backToChats.addEventListener('click', () => {
    try {
        chatMain.classList.remove('active');
        chatSidebar.style.display = 'block';
    } catch (error) {
        console.error('خطأ في التنقل:', error);
    }
});

// معالجة تغيير حجم النافذة
window.addEventListener('resize', () => {
    try {
        if (window.innerWidth > 768) {
            chatMain.classList.remove('active');
            chatSidebar.style.display = 'block';
        } else if (currentChatId) {
            chatMain.classList.add('active');
            chatSidebar.style.display = 'none';
        }
    } catch (error) {
        console.error('خطأ في معالجة تغيير حجم النافذة:', error);
    }
});

// التعامل مع حالة الاتصال/عدم الاتصال بالإنترنت
window.addEventListener('online', () => {
    showNotification('أنت متصل بالإنترنت الآن', 'success');
    
    // إعادة ضبط حالة الاتصال عند استعادة الاتصال
    if (currentUser) {
        firebase.database().ref(`status/${currentUser.uid}`).set({
            status: 'online',
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        });
    }
});

window.addEventListener('offline', () => {
    showNotification('أنت غير متصل بالإنترنت، قد لا تعمل بعض الميزات', 'warning');
});

// النقر خارج مربع معاينة الصورة لإغلاقه
imagePreviewModal.addEventListener('click', (e) => {
    if (e.target === imagePreviewModal) {
        imagePreviewModal.style.display = 'none';
        selectedImageBase64 = null;
    }
});

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    try {
        // التحقق من الوضع المظلم المحفوظ
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'true') {
            document.body.classList.add('dark-mode');
            darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
            darkModeBtn.title = 'التحول للوضع العادي';
        }
        
        // تعطيل حقل الرسالة وزر الإرسال حتى يتم اختيار محادثة
        messageInput.disabled = true;
        sendButton.disabled = true;
        
        // إذا كانت الشاشة صغيرة، يتم إظهار قائمة المحادثات فقط
        if (window.innerWidth <= 768) {
            chatMain.classList.remove('active');
        }
    } catch (error) {
        console.error('خطأ في تهيئة الصفحة:', error);
    }
});


