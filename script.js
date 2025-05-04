// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getDatabase, ref, set, onValue, push } from "firebase/database";

// Your web app's Firebase configuration
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Login function
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'block';
        document.getElementById('change-username-container').style.display = 'block';
        loadMessages();
    } catch (error) {
        console.error('Error logging in:', error);
    }
}

// Register function
async function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'block';
        document.getElementById('change-username-container').style.display = 'block';
        loadMessages();
    } catch (error) {
        console.error('Error registering:', error);
    }
}

// Change username function
async function changeUsername() {
    const newUsername = document.getElementById('newUsername').value;

    try {
        await updateProfile(auth.currentUser, { displayName: newUsername });
        console.log('Username updated successfully');
    } catch (error) {
        console.error('Error updating username:', error);
    }
}

// Send message function
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const chatWindow = document.getElementById('chatWindow');

    if (messageInput.value.trim() !== '') {
        const message = {
            text: messageInput.value,
            user: auth.currentUser.displayName || auth.currentUser.email,
            timestamp: new Date().toISOString()
        };

        await push(ref(db, 'messages'), message);

        messageInput.value = '';
    }
}

// Load messages function
function loadMessages() {
    const chatWindow = document.getElementById('chatWindow');
    const messagesRef = ref(db, 'messages');

    onValue(messagesRef, (snapshot) => {
        const messages = snapshot.val();
        chatWindow.innerHTML = '';

        for (const key in messages) {
            const message = messages[key];
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.textContent = `${message.user}: ${message.text}`;
            chatWindow.appendChild(messageDiv);
        }

        chatWindow.scrollTop = chatWindow.scrollHeight;
    });
}
