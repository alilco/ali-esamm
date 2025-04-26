const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { prompt } = JSON.parse(event.body);

    try {
        const response = await fetch('https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer hf_YOUR_TOKEN_IF_NEEDED'
            },
            body: JSON.stringify({
                inputs: prompt
            })
        });

        const data = await response.json();

        // استخراج الرد
        const botReply = data?.generated_text || "عذراً، لم أستطع معالجة سؤالك حالياً.";

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: botReply })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ reply: "حدث خطأ أثناء الاتصال بالخادم." })
        };
    }
};
