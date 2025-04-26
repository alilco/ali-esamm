const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') sendMessage();
});

function appendMessage(message, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
    msgDiv.innerText = message;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;
    
    appendMessage(message, 'user');
    userInput.value = '';
    
    // استدعاء الذكاء الاصطناعي عبر API مجاني
    appendMessage("...", 'ai'); // مؤقت حتى يرد
    
    const response = await fetch('https://free-gpt-4o-mini-api.example/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
    });

    const data = await response.json();
    const botReply = data.reply || "عذراً، لم أتمكن من فهم سؤالك.";
    
    // إزالة علامة ...
    const loadingMessage = chatBox.querySelector('.ai-message:last-child');
    if (loadingMessage) loadingMessage.remove();
    
    appendMessage(botReply, 'ai');
}
