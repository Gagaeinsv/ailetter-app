import handler from '../api/generate.js';

const mockReq = {
  method: 'POST',
  body: {
    modelId: 'groq/llama-3.3-70b-versatile',
    temperature: 0.7,
    maxOutputTokens: 100,
    contents: ['Hi, who are you? Please reply with exactly one sentence.']
  }
};

const mockRes = {
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.jsonData = data;
    console.log(`Response Code: ${this.statusCode}`);
    console.log('Response JSON:', JSON.stringify(data, null, 2));
    return this;
  }
};

process.env.GROQ_API_KEY = 'mock_key_for_testing';

handler(mockReq, mockRes).catch(err => {
  console.error('Unhandled handler error:', err);
});
