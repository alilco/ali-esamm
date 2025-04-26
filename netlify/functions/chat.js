exports.handler = async (event) => {
    try {
        const { prompt } = JSON.parse(event.body);
        
        // استخدم نموذجاً مجانياً من Hugging Face
        const MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.1";
        const API_URL = https://api-inference.huggingface.co/models/${MODEL_ID};
        
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": Bearer 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,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: prompt })
        });
        
        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                reply: data[0]?.generated_text || "عذراً، لم أتمكن من فهم السؤال"
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "حدث خطأ في الخادم" })
        };
    }
};
