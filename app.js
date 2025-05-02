// app.js
import { messagesRef, push, onValue } from './firebase.js';

const chatBox = document.getElementById('chat-box');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// استقبال الرسائل
onValue(messagesRef, (snapshot) => {
  chatBox.innerHTML = ''; // مسح المحتوى القديم
  snapshot.forEach((childSnapshot) => {
    const message = childSnapshot.val();
    addMessageToChat(message.text, message.sender);
  });
  chatBox.scrollTop = chatBox.scrollHeight; // التمرير التلقائي
});

// إرسال رسالة
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (text !== '') {
    const newMessageRef = push(messagesRef);
    set(newMessageRef, {
      text: text,
      sender: 'user'
    });
    messageInput.value = '';
  }
});

// عرض الرسائل
function addMessageToChat(text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  if (sender === 'user') {
    messageDiv.classList.add('user');
  }
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
}
