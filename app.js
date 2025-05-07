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

// متغيرات عامة لحالة التطبيق
let currentUser = null;
let currentUserData = null;
let currentChatId = null;
let currentChatUser = null;
let myContacts = {}; // المستخدمين الذين تمت إضافتهم فقط
let allUsers = {}; // جميع المستخدمين في النظام
let isAddUserVisible = false;
let selectedImageBase64 = null; // لتخزين الصورة المختارة كـ Base64

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
            showLoginForm();
        }
    } catch (error) {
        console.error("خطأ في التحقق من حالة المصادقة:", error);
        hideElement(loadingScreen);
        showNotification('حدث خطأ غير متوقع', 'error');
        showLoginForm();
    }
});

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
            item.innerHTML = `<img src="${pictureUrl}" alt="صورة المستخدم">`;
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
            
            // إنشاء عنصر لكل جهة اتصال
            Object.keys(contacts).forEach(userId => {
                firebase.database().ref(`users/${userId}`).once('value')
                    .then((userSnapshot) => {
                        const userData = userSnapshot.val();
                        if (!userData) return;
                        
                        myContacts[userId] = userData;
                        
                        // إنشاء معرف للدردشة بين المستخدمين
                        const chatId = getChatId(currentUser.uid, userId);
                        
                        // إنشاء عنصر في قائمة المحادثات
                        const chatItem = document.createElement('li');
                        chatItem.className = 'chat-item';
                        chatItem.dataset.chatId = chatId;
                        chatItem.dataset.userId = userId;
                        
                                                chatItem.innerHTML = `
                            <div class="chat-profile-pic">
                                ${userData.profilePicture
                                    ? `<img src="${userData.profilePicture}" alt="${userData.fullName}">`
                                    : `<i class="fas fa-user"></i>`
                                }
                            </div>
                            <div class="chat-info">
                                <div class="chat-name">${userData.fullName || userData.name || userData.username || 'مستخدم'}</div>
                                <div class="chat-last-message">انقر للدردشة</div>
                            </div>
                        `;
                        
                        chatItem.addEventListener('click', () => openChat(chatId, userId));
                        chatList.appendChild(chatItem);
                        
                        // تحديث آخر رسالة في قائمة المحادثات
                        updateLastMessage(chatId);
                    })
                    .catch(error => {
                        console.error('خطأ في تحميل بيانات المستخدم:', error);
                    });
            });
        });
    } catch (error) {
        console.error('خطأ غير متوقع في تحميل جهات الاتصال:', error);
        showNotification('فشل في تحميل جهات الاتصال', 'error');
    }
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
                
                messageInput.disabled = false;
                sendButton.disabled = false;
                
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
                
                // تحميل الرسائل للدردشة الحالية
                loadMessages(chatId);
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

// تحديث آخر رسالة في قائمة المحادثات
function updateLastMessage(chatId) {
    try {
        firebase.database().ref('messages/' + chatId).limitToLast(1).once('value', (snapshot) => {
            if (!snapshot.exists()) return;
            
            snapshot.forEach((childSnapshot) => {
                const lastMessage = childSnapshot.val();
                const chatItem = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
                
                if (chatItem) {
                    const lastMessageElement = chatItem.querySelector('.chat-last-message');
                    if (lastMessageElement) {
                        let messagePreview = lastMessage.text;
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
                }
            });
        });
    } catch (error) {
        console.error('خطأ في تحديث آخر رسالة:', error);
    }
}

// عرض رسالة في المحادثة
function displayMessage(messageData) {
    try {
        const isCurrentUser = messageData.senderId === currentUser.uid;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isCurrentUser ? 'outgoing' : 'incoming'}`;
        
        const messageTime = formatTime(messageData.timestamp);
        
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-text">${messageData.text}</div>
                <div class="message-time">${messageTime}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
    } catch (error) {
        console.error('خطأ في عرض الرسالة:', error);
    }
}

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

// معالجة النقر على زر الإرسال
sendButton.addEventListener('click', sendMessage);

// معالجة ضغط Enter في حقل الرسالة
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
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
