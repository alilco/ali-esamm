// netlify/functions/chat.js
const { pipeline } = require('@xenova/transformers');

exports.handler = async (event) => {
  const { message } = JSON.parse(event.body);
  
  const generator = await pipeline('text-generation', 'Xenova/gpt2');
  const response = await generator(message, { max_new_tokens: 50 });
  
  return {
    statusCode: 200,
    body: JSON.stringify({ response: response[0].generated_text })
  };
};
