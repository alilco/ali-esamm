// العناصر في واجهة المستخدم
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-btn');
const loadModelButton = document.getElementById('load-model-btn');
const modelSelect = document.getElementById('model-select');
const loadingIndicator = document.getElementById('loading');
const modelStatus = document.getElementById('model-status');

// متغيرات الحالة
let chatModule = null;
let isModelLoaded = false;
let isProcessing = false;
let messageHistory = [];

// إضافة رسالة إلى المحادثة
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // تخزين في تاريخ المحادثة
    messageHistory.push({ role: sender === 'user' ? 'user' : 'assistant', content: text });
    
    // التمرير إلى آخر رسالة
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// إظهار وإخفاء مؤشر التحميل
function showLoading() {
    loadingIndicator.style.display = 'flex';
    modelStatus.textContent = 'يعمل...';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
    modelStatus.textContent = isModelLoaded ? 'جاهز' : 'غير محمل';
}

// وظيفة تحميل النموذج
async function loadModel() {
    if (chatModule || isProcessing) return;
    
    const selectedModel = modelSelect.value;
    isProcessing = true;
    showLoading();
    modelStatus.textContent = 'جاري التحميل...';
    loadModelButton.disabled = true;
    modelSelect.disabled = true;
    
    addMessage("بدأ تحميل النموذج. قد يستغرق هذا من 1-5 دقائق حسب سرعة الاتصال. سيتم تخزين النموذج محليًا في متصفحك وعدم تحميله مرة أخرى عند زيارتك القادمة.", "bot");
    
    try {
        chatModule = await webllm.ChatModule.create({
            model: selectedModel,
            // الرابط المباشر للملفات المساعدة للمكتبة
            wasmUrl: "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.0/lib/"
        });
        
        isModelLoaded = true;
        modelStatus.textContent = 'جاهز';
        userInput.disabled = false;
        sendButton.disabled = false;
        
        addMessage("تم تحميل النموذج بنجاح! يمكنك الآن بدء المحادثة.", "bot");
    } catch (error) {
        console.error("فشل في تحميل النموذج:", error);
        addMessage("عذراً، فشل تحميل النموذج. قد يكون ذلك بسبب عدم دعم المتصفح أو ضعف الاتصال. حاول استخدام متصفح Google Chrome أو Microsoft Edge وتأكد من استقرار الاتصال بالإنترنت.", "bot");
        modelStatus.textContent = 'فشل التحميل';
        loadModelButton.disabled = false;
        modelSelect.disabled = false;
    } finally {
        hideLoading();
        isProcessing = false;
    }
}

// وظيفة إرسال الرسائل
async function sendMessage() {
    if (!isModelLoaded || isProcessing) return;
    
    const userMessage = userInput.value.trim();
    if (!userMessage) return;
    
    addMessage(userMessage, 'user');
    userInput.value = '';
    
    isProcessing = true;
    showLoading();
    
    try {
        // تحويل تاريخ المحادثة إلى التنسيق المناسب
        const formattedHistory = messageHistory.slice(-10); // الحفاظ على آخر 10 رسائل فقط للذاكرة
        
        // توليد الرد
        const response = await chatModule.generate(userMessage, {
            temperature: 0.7,
            max_new_tokens: 500,
            chat_history: formattedHistory.slice(0, -1) // استثناء رسالة المستخدم الجديدة
        });
        
        addMessage(response, 'bot');
    } catch (error) {
        console.error("خطأ في توليد الرد:", error);
        addMessage("عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.", 'bot');
    } finally {
        hideLoading();
        isProcessing = false;
    }
}

// إعداد مستمعي الأحداث
loadModelButton.addEventListener('click', loadModel);

sendButton.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

// التحقق من دعم المتصفح للميزات المطلوبة
function checkBrowserSupport() {
    if (!window.WebAssembly) {
        addMessage("متصفحك لا يدعم تقنية WebAssembly وهي ضرورية لتشغيل نماذج الذكاء الاصطناعي في المتصفح. يرجى استخدام متصفح حديث مثل Chrome أو Edge أو Firefox.", "bot");
        loadModelButton.disabled = true;
        return false;
    }
    
    if (!window.webllm) {
        addMessage("حدث خطأ في تحميل مكتبة WebLLM. تأكد من اتصالك بالإنترنت وحاول تحديث الصفحة.", "bot");
        loadModelButton.disabled = true;
        return false;
    }
    
    return true;
}

// فحص الدعم عند تحميل الصفحة
window.addEventListener('load', () => {
    checkBrowserSupport();
});

// إحباط محاولات الخروج أثناء التحميل
window.addEventListener('beforeunload', (e) => {
    if (isProcessing) {
        e.preventDefault();
        e.returnValue = 'يتم حاليًا تحميل النموذج، هل أنت متأكد من رغبتك في الخروج؟';
    }
});
