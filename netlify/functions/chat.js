const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { prompt } = JSON.parse(event.body);

    try {
        const response = await fetch('https://freegpt.one/api/gpt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: data?.text || "لم أستطع الرد حالياً." })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ reply: "حدث خطأ أثناء الاتصال بالخادم." })
        };
    }
};
