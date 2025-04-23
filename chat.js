import { db, storage } from "./firebase-config.js";
import {
  ref as dbRef,
  push,
  onChildAdded
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const user = JSON.parse(localStorage.getItem("currentUser"));
const friend = JSON.parse(localStorage.getItem("chatWith"));

if (!user || !friend) window.location.href = "friends.html";

document.getElementById("chatWithName").textContent = "الدردشة مع: " + friend.username;

const messageInput = document.getElementById("messageInput");
const imageInput = document.getElementById("imageInput");
const messagesDiv = document.getElementById("messages");
const form = document.getElementById("messageForm");

const chatPath = [user.username, friend.username].sort().join("_");
const chatRef = dbRef(db, "chats/" + chatPath);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let message = messageInput.value.trim();
  let imageFile = imageInput.files[0];

  const newMessage = {
    sender: user.username,
    timestamp: Date.now()
  };

  if (message) {
    newMessage.text = message;
  }

  if (imageFile) {
    const imageStorageRef = storageRef(storage, `images/${chatPath}/${Date.now()}_${imageFile.name}`);
    await uploadBytes(imageStorageRef, imageFile);
    newMessage.image = await getDownloadURL(imageStorageRef);
  }

  if (newMessage.text || newMessage.image) {
    await push(chatRef, newMessage);
    messageInput.value = "";
    imageInput.value = "";
  }
});

onChildAdded(chatRef, (snapshot) => {
  const data = snapshot.val();
  const div = document.createElement("div");
  div.className = data.sender === user.username ? "my-message" : "friend-message";

  if (data.text) {
    div.innerHTML += `<p>${data.text}</p>`;
  }

  if (data.image) {
    div.innerHTML += `<img src="${data.image}" width="200"/>`;
  }

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});