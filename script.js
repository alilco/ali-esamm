// إعداد نموذج الذكاء الاصطناعي
const { pipeline } = window.Transformers;
let model = null;
let modelLoading = false;

// تهيئة النموذج
async function initModel() {
    if (model || modelLoading) return;
    
    modelLoading = true;
    showLoading();
    
    try {
        model = await pipeline(
            'text-generation',
            'Xenova/distilgpt2'  // نموذج خفيف للأداء السريع في المتصفح
        );
        console.log("تم تحميل النموذج بنجاح");
    } catch (error) {
        console.error("خطأ في تحميل النموذج:", error);
        addMessage("حدث خطأ في تحميل نموذج الذكاء الاصطناعي. يرجى تحديث الصفحة والمحاولة مرة أخرى.", "bot");
    } finally {
        modelLoading = false;
        hideLoading();
    }
}

// العناصر في واجهة المستخدم
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-btn');
const loadingIndicator = document.getElementById('loading');

// إظهار وإخفاء مؤشر التحميل
function showLoading() {
    loadingIndicator.style.display = 'flex';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
}

// إضافة رسالة إلى المحادثة
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // التمرير إلى آخر رسالة
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// إرسال رسالة المستخدم ومعالجتها
async function sendMessage() {
    const userMessage = userInput.value.trim();
    
    if (!userMessage) return;
    
    // إضافة رسالة المستخدم إلى المحادثة
    addMessage(userMessage, 'user');
    userInput.value = '';
    
    // تأكد من تحميل النموذج
    if (!model) {
        await initModel();
    }
    
    showLoading();
    
    try {
        // إنشاء سياق المحادثة
        const context = `User: ${userMessage}\nAssistant:`;
        
        // الحصول على الرد من النموذج
        const result = await model(context, {
            max_new_tokens: 100,
            temperature: 0.7,
            do_sample: true,
        });
        
        // استخراج الرد من النتيجة وتنظيفه
        let botResponse = result[0].generated_text;
        botResponse = botResponse.replace(context, '').trim();
        
        // إضافة رد البوت إلى المحادثة
        addMessage(botResponse || "عذراً، لم أستطع إنشاء رد. يرجى المحاولة مرة أخرى.", 'bot');
    } catch (error) {
        console.error("خطأ في معالجة الرسالة:", error);
        addMessage("عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.", 'bot');
    } finally {
        hideLoading();
    }
}

// إضافة مستمعي الأحداث
sendButton.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

// بدء تحميل النموذج عند تحميل الصفحة
window.addEventListener('load', () => {
    // تأخير قليل قبل بدء تحميل النموذج لتسريع تحميل الصفحة الأولي
    setTimeout(() => {
        initModel();
    }, 1000);
});
