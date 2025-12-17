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
        const { context, subject, difficulty = "medium" } = req.body;

        if (!context || !subject) {
            return res.status(400).json({ error: "Both 'context' and 'subject' are required" });
        }

        const userPrompt = `You are an educational AI tutor. Create a ${difficulty} difficulty ${subject} practice question based on the following study material.
        
        Study Material:
        ${context}
        
        Requirements:
        - Create a NEW, original question (do not repeat the material)
        - The question should test understanding, not just recall
        - Make it clear, specific, and answerable based on the material
        - Format as a single question ending with a question mark
        
        Generate only the question, nothing else.`;

        const response = await fetch(GROQ_CHAT_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "user", content: userPrompt }
                ],
                max_tokens: 250,
                temperature: 0.8,
                top_p: 0.9,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 503) {
                return res.status(503).json({ error: "Model is loading. Please try again in a few moments.", retryAfter: 30 });
            }
            return res.status(response.status).json({ error: errorData.error || "Failed to generate question" });
        }

        const data = await response.json();
        let question = "";

        if (data.choices && data.choices[0]?.message?.content) {
            question = data.choices[0].message.content.trim();
        } else if (data.generated_text) {
            question = data.generated_text.trim();
        } else if (typeof data === "string") {
            question = data.trim();
        }

        if (!question) {
            return res.status(500).json({ error: "Failed to extract question from response" });
        }

        question = question
            .replace(/^(Question:|Q:|Task:).*/i, "")
            .replace(/^Study Material:.*/i, "")
            .replace(/^Requirements:.*/i, "")
            .replace(/^Generate only.*$/i, "")
            .trim();

        const questionMatch = question.match(/([^.!?\n]+\?)/);
        if (questionMatch) {
            question = questionMatch[1].trim();
        }

        if (question.length < 20 || question.toLowerCase().includes(context.substring(0, 50).toLowerCase())) {
            const lines = question.split('\n').filter(line => line.trim() && line.includes('?'));
            if (lines.length > 0) {
                question = lines[0].trim();
            }
        }

        if (!question.endsWith("?") && question.length > 0) {
            question = question.replace(/[.!]$/, "") + "?";
        }

        question = question
            .replace(/^(The question is|Here's the question|Question|Answer):\s*/i, "")
            .replace(/\s+/g, " ")
            .trim();

        return res.status(200).json({
            question,
            subject,
            difficulty,
            context: context.substring(0, 100) + "...",
        });

    } catch (error) {
        console.error("Question generation error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}
