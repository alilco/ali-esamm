const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { prompt } = JSON.parse(event.body);

    try {
        const response = await fetch('https://api.aiproxy.io/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "أنت مساعد ذكاء اصطناعي ذكي يسمى Renge." },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();

        const botReply = data?.choices?.[0]?.message?.content || "عذراً، لم أتمكن من معالجة سؤالك.";

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
