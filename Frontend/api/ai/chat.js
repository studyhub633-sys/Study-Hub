import { checkAndRecordUsage, updateAiResponse } from '../_utils/ai-usage.js';
import { verifyAuth } from '../_utils/auth.js';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!GROQ_API_KEY) {
        return res.status(503).json({ error: "Groq API key not configured." });
    }

    try {
        const user = await verifyAuth(req);
        const { message, context, history, language, image } = req.body;

        if (!message && !image) {
            return res.status(400).json({ error: "Message or image is required" });
        }

        // Check global usage limits
        let usageData;
        try {
            usageData = await checkAndRecordUsage(user, "chat", message, context);
        } catch (error) {
            if (error.status === 429) {
                return res.status(429).json({
                    error: error.message,
                    usageCount: error.usageCount,
                    limit: error.limit
                });
            }
            throw error;
        }

        // Build language instruction
        const languageNames = {
            en: "English", es: "Spanish", fr: "French", de: "German",
            it: "Italian", pt: "Portuguese", nl: "Dutch", ru: "Russian",
            ja: "Japanese", ko: "Korean", "zh-CN": "Simplified Chinese",
            "zh-TW": "Traditional Chinese", ar: "Arabic", hi: "Hindi"
        };
        const langName = languageNames[language] || "English";
        const langInstruction = language && language !== "en"
            ? `IMPORTANT: You MUST respond in ${langName}. All your responses should be in ${langName}.`
            : "";

        let systemPrompt = `You are a helpful, encouraging, and knowledgeable AI tutor assistant. Your goal is to help students learn and understand concepts clearly. Keep answers concise but informative. 
        
CRITICAL: Always maintain context from the conversation. When the user refers to previous topics, questions, or answers, make sure to connect your response to what was discussed earlier. Pay close attention to follow-up questions and clarifications.

${langInstruction}`;

        if (context) {
            systemPrompt += `\n\nContext/Notes provided by student:\n${context}`;
        }

        // Build the messages array with conversation history
        const messages = [{ role: "system", content: systemPrompt }];

        // Add conversation history if provided (limit to last 10 exchanges for token management)
        if (history && Array.isArray(history) && history.length > 0) {
            // Filter and validate history entries
            const validHistory = history
                .filter(msg => msg && msg.role && msg.content)
                .map(msg => ({
                    role: msg.role === "assistant" ? "assistant" : "user",
                    content: String(msg.content).slice(0, 2000) // Limit each message to prevent token overflow
                }));

            messages.push(...validHistory);
        }

        // Add the current user message
        let userMessageContent = message;
        let model = "llama-3.3-70b-versatile";

        if (image) {
            model = "llama-3.2-11b-vision-preview"; // Use Llama 3.2 Vision model
            userMessageContent = [
                { type: "text", text: message || "Please analyze this image." },
                { type: "image_url", image_url: { url: image } }
            ];
        }

        messages.push({ role: "user", content: userMessageContent });

        const response = await fetch(GROQ_CHAT_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7,
                top_p: 0.9,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 503) {
                return res.status(503).json({ error: "Model is loading. Please try again in moments.", retryAfter: 30 });
            }
            // Handle structured error objects from Groq/OpenAI
            const errorMessage = errorData.error?.message ||
                (typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error)) ||
                "Failed to generate response";
            return res.status(response.status).json({ error: errorMessage });
        }

        const data = await response.json();
        let reply = "";

        if (data.choices && data.choices[0]?.message?.content) {
            reply = data.choices[0].message.content.trim();
        } else if (data.generated_text) {
            reply = data.generated_text.trim();
        } else if (typeof data === "string") {
            reply = data.trim();
        }

        const result = { reply };

        // Record the response in history
        if (usageData?.usageId) {
            await updateAiResponse(usageData.usageId, result);
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error("Chat error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}

