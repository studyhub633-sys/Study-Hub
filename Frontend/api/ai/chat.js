import { checkAndRecordUsage } from '../_utils/ai-usage.js';
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
        const { message, context } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
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

        let systemPrompt = "You are a helpful, encouraging, and knowledgeable AI tutor. Your goal is to help students learn and understand concepts clearly. Keep answers concise but informative.";
        if (context) {
            systemPrompt += `\n\nContext/Notes provided by student:\n${context}`;
        }

        const response = await fetch(GROQ_CHAT_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                max_tokens: 500,
                temperature: 0.7,
                top_p: 0.9,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 503) {
                return res.status(503).json({ error: "Model is loading. Please try again in moments.", retryAfter: 30 });
            }
            return res.status(response.status).json({ error: errorData.error || "Failed to generate response" });
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
