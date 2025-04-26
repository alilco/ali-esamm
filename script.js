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
    
    // مؤقت عرض رسالة تحميل
    appendMessage("... جاري التفكير", 'ai'); 

    try {
        const response = await fetch('https://free-gpt-4o-mini-api-g70n.onrender.com/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        const botReply = data.response || "عذراً، لم أستطع فهم طلبك.";
        
        // إزالة الرسالة المؤقتة
        const loadingMessage = chatBox.querySelector('.ai-message:last-child');
        if (loadingMessage) loadingMessage.remove();
        
        appendMessage(botReply, 'ai');
    } catch (error) {
        console.error(error);
        const loadingMessage = chatBox.querySelector('.ai-message:last-child');
        if (loadingMessage) loadingMessage.remove();
        appendMessage("حدث خطأ أثناء الاتصال بالخادم!", 'ai');
    }
}
