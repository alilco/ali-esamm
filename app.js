// Firebase Configuration
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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// تسجيل الدخول
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = 'friends.html';
        })
        .catch((error) => {
            const errorMessage = error.message;
            document.getElementById('error-message').textContent = errorMessage;
        });
});

// إنشاء حساب
const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        document.getElementById('error-message').textContent = "كلمات المرور غير متطابقة!";
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = 'login.html';
        })
        .catch((error) => {
            const errorMessage = error.message;
            document.getElementById('error-message').textContent = errorMessage;
        });
});

// عرض الأصدقاء
const friendsList = document.getElementById('friendsList');
db.ref('users/').on('value', (snapshot) => {
    friendsList.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
        const friend = childSnapshot.val();
        const li = document.createElement('li');
        li.textContent = friend.username;
        friendsList.appendChild(li);
    });
});

// عرض الملف الشخصي
const profileImage = document.getElementById('profileImage');
const usernameElement = document.getElementById('username');
const bioElement = document.getElementById('bio');

auth.onAuthStateChanged((user) => {
    if (user) {
        const userId = user.uid;
        db.ref('users/' + userId).once('value').then((snapshot) => {
            const userData = snapshot.val();
            usernameElement.textContent = userData.username;
            bioElement.textContent = userData.bio;
            profileImage.src = userData.profileImage;
        });
    } else {
        window.location.href = 'login.html';
    }
});

// الوضع الليلي
const toggleDarkMode = () => {
    const body = document.body;
    body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
};

const checkDarkMode = () => {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
        document.body.classList.add('dark-mode');
    }
};

checkDarkMode();

// آخر ظهور
const updateLastSeen = (userId) => {
    const lastSeen = new Date().toLocaleString();
    const lastSeenRef = db.ref('users/' + userId + '/lastSeen');
    lastSeenRef.set(lastSeen);
};

const getLastSeen = (userId) => {
    const lastSeenRef = db.ref('users/' + userId + '/lastSeen');
    lastSeenRef.on('value', (snapshot) => {
        document.getElementById('lastSeen').textContent = 'آخر ظهور: ' + snapshot.val();
    });
};

// تسجيل الخروج
const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
});

// تحديث معلومات المستخدم
const updateProfileButton = document.getElementById('updateProfileButton');
updateProfileButton.addEventListener('click', () => {
    const userId = auth.currentUser.uid;
    const newUsername = document.getElementById('newUsername').value;
    const newBio = document.getElementById('newBio').value;
    const newProfileImage = document.getElementById('newProfileImage').files[0];

    const profileUpdate = {
        username: newUsername,
        bio: newBio,
    };

    if (newProfileImage) {
        const storageRef = firebase.storage().ref('profileImages/' + userId);
        storageRef.put(newProfileImage).then(() => {
            storageRef.getDownloadURL().then((url) => {
                profileUpdate.profileImage = url;
                db.ref('users/' + userId).update(profileUpdate);
            });
        });
    } else {
        db.ref('users/' + userId).update(profileUpdate);
    }

    alert("تم تحديث الملف الشخصي بنجاح!");
});
