// Firebase configuration
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

// Firebase Services
window.auth = firebase.auth();
window.db = firebase.database();

console.log("Firebase initialized with Auth & Database");
