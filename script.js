// متغيرات عامة
let model, tokenizer;

// تحميل النموذج عند بدء التشغيل
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'ai-msg';
        statusDiv.textContent = 'جارٍ تحميل النموذج...';
        document.getElementById('chat-box').appendChild(statusDiv);
        
        // تحميل النموذج والمشفّر
        model = await transformers.AutoModelForCausalLM.from_pretrained('Xenova/gpt2');
        tokenizer = await transformers.AutoTokenizer.from_pretrained('Xenova/gpt2');
        
        // تمكين واجهة المستخدم بعد التحميل
        document.getElementById('user-input').disabled = false;
        document.getElementById('send-btn').disabled = false;
        
        statusDiv.textContent = 'النموذج جاهز! يمكنك البدء بالدردشة';
    } catch (error) {
        console.error('فشل تحميل النموذج:', error);
        document.getElementById('chat-box').innerHTML += 
            `<div class="error-msg">خطأ في تحميل النموذج: ${error.message}</div>`;
    }
});

// دالة إرسال الرسالة
async function generateResponse() {
    const input = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const userMessage = input.value.trim();
    
    if (!userMessage || !model || !tokenizer) return;
    
    // عرض رسالة المستخدم
    chatBox.innerHTML += `<div class="user-msg">أنت: ${userMessage}</div>`;
    input.value = '';
    
    // عرض مؤشر تحميل
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'ai-msg loading';
    loadingDiv.textContent = '...جارٍ التفكير';
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    try {
        // توليد الرد
        const inputIds = await tokenizer.encode(userMessage, { return_tensors: 'pt' });
        const output = await model.generate(inputIds, { max_length: 100 });
        const response = await tokenizer.decode(output[0], { skip_special_tokens: true });
        
        // عرض الرد وإزالة مؤشر التحميل
        loadingDiv.remove();
        chatBox.innerHTML += `<div class="ai-msg">الذكاء الاصطناعي: ${response}</div>`;
    } catch (error) {
        loadingDiv.textContent = `حدث خطأ: ${error.message}`;
        loadingDiv.className = 'error-msg';
    }
    
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ربط دالة الإرسال بالزر
document.getElementById('send-btn').addEventListener('click', generateResponse);

// السماح بالإرسال باستخدام زر Enter
document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') generateResponse();
});
