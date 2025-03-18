import express from 'express';
import cors from 'cors';
import { OpenAI } from "openai";

const app = express();
const port = process.env.PORT || 5000;
const baseURL = "https://api.aimlapi.com/v1";
const apiKey = "204e8ceda3f04008a5078925cf144e35";
const systemPrompt = "You are a travel agent. Be descriptive and helpful";
const DELAY_BETWEEN_REQUESTS = 1000;
let lastRequestTime = Date.now();


app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));


let lastResponse = '';

async function initializeAPI() {
    const api = new OpenAI({
        apiKey,
        baseURL,
    });


    app.get('/express_backend', (req, res) => {
        res.json({ express: lastResponse });
    });

    const makeRequestWithRetry = async (userMessage, maxRetries = 3, delay = 1000) => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const completion = await api.chat.completions.create({
                    model: "mistralai/Mistral-7B-Instruct-v0.2",
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt,
                        },
                        {
                            role: "user",
                            content: userMessage,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 256,
                });
                return completion;
            } catch (error) {
                if (error.status === 429 && i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw error;
            }
        }
    };

    app.post('/send_message', async (req, res) => {
        try {
            const now = Date.now();
            const timeSinceLastRequest = now - lastRequestTime;
            
            if (timeSinceLastRequest < DELAY_BETWEEN_REQUESTS) {
                return res.status(429).json({
                    error: 'Rate limit exceeded',
                    message: 'Пожалуйста, подождите несколько секунд перед следующим запросом',
                    retryAfter: Math.ceil((DELAY_BETWEEN_REQUESTS - timeSinceLastRequest) / 1000)
                });
            }
            
            lastRequestTime = Date.now();
            const userMessage = req.body.message;
            
            const completion = await makeRequestWithRetry(userMessage);
            lastResponse = completion.choices[0].message.content;
            res.json({ response: lastResponse });
        } catch (error) {
            console.error('Ошибка:', error);
            
            if (error.status === 429) {
                return res.status(429).json({
                    error: 'Rate limit exceeded',
                    message: 'Превышен лимит запросов к API. Пожалуйста, подождите немного.',
                    retryAfter: 30 // время ожидания в секундах
                });
            }
            
            res.status(500).json({ 
                error: 'Internal Server Error',
                message: 'Внутренняя ошибка сервера'
            });
        }
    });

    app.listen(port, () => {
        console.log(`Сервер запущен на порту ${port}`);
    });
}

initializeAPI().catch(console.error);