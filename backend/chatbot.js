require('dotenv').config();
const OpenAI = require('openai');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');

// Initialize OpenAI with your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Hugging Face API configuration
const HF_API_URL = "https://api-inference.huggingface.co/models/jianghc/medical_chatbot";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Rate limiter configuration
const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    }
});

// In-memory storage for chat history with TTL
const chatHistory = new Map();
const HISTORY_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Get user's chat history
function getUserHistory(userId) {
    const history = chatHistory.get(userId);
    if (!history) return [];
    
    // Clean expired messages
    const now = Date.now();
    const validHistory = history.filter(msg => now - msg.timestamp < HISTORY_TTL);
    
    if (validHistory.length !== history.length) {
        chatHistory.set(userId, validHistory);
    }
    
    return validHistory.map(msg => ({
        role: msg.role,
        content: msg.content
    }));
}

// Add message to user's history
function addToHistory(userId, role, content) {
    let history = getUserHistory(userId);
    history.push({
        role,
        content,
        timestamp: Date.now()
    });
    
    // Keep only last 10 messages to maintain context
    if (history.length > 10) {
        history = history.slice(-10);
    }
    chatHistory.set(userId, history);
}

// Clear user's chat history
function clearHistory(userId) {
    chatHistory.delete(userId);
}

// Main chat function
async function chat(message, userId) {
    try {
        if (!message || typeof message !== 'string') {
            throw new Error('Invalid message format');
        }

        // Get user's chat history
        const history = getUserHistory(userId);
        
        // Add user's message to history
        addToHistory(userId, 'user', message);
        
        // Create messages array for OpenAI
        const messages = [
            {
                role: 'system',
                content: `You are a helpful medical assistant. You can provide general health information, wellness advice, and medical knowledge. 
                Always remind users that you are an AI and not a replacement for professional medical advice. 
                For serious medical concerns, always recommend consulting a healthcare professional.
                Keep responses concise, clear, and medically accurate.
                Format your responses in a clear, structured way using markdown when appropriate.`
            },
            ...history
        ];

        let response;
        
        // Try Hugging Face model first
        if (HF_API_KEY) {
            try {
                const hfResponse = await fetch(HF_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${HF_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        inputs: message,
                        parameters: {
                            max_length: 500,
                            temperature: 0.7,
                            top_p: 0.9
                        }
                    })
                });

                if (!hfResponse.ok) {
                    throw new Error(`Hugging Face API error: ${hfResponse.status}`);
                }

                const hfData = await hfResponse.json();
                response = hfData[0].generated_text;
            } catch (hfError) {
                console.error('Hugging Face API error:', hfError);
                // Fallback to OpenAI if Hugging Face fails
                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 500
                });
                response = completion.choices[0].message.content;
            }
        } else {
            // Use OpenAI if no Hugging Face API key
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: messages,
                temperature: 0.7,
                max_tokens: 500
            });
            response = completion.choices[0].message.content;
        }
        
        // Add assistant's response to history
        addToHistory(userId, 'assistant', response);
        
        return {
            success: true,
            message: response,
            timestamp: Date.now()
        };
    } catch (error) {
        console.error('Chat error:', error);
        return {
            success: false,
            message: 'I apologize, but I encountered an error. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        };
    }
}

module.exports = {
    chat,
    clearHistory,
    chatLimiter
}; 