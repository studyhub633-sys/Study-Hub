import { verifyAuth } from '../_utils/auth.js';

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY || process.env.HUGGING_FACE_API_KEY;
const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";

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

    if (!HF_API_KEY) {
        return res.status(503).json({ error: "Hugging Face API key not configured." });
    }

    try {
        const user = await verifyAuth(req);
        const { context, subject, difficulty = "medium" } = req.body;

        if (!context) {
            return res.status(400).json({ error: "Context is required" });
        }

        console.log('Making request to Hugging Face Chat Completions API...');

        // Use the new chat completions format (free tier compatible)
        const response = await fetch(HF_CHAT_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemma-2-2b-it",
                messages: [
                    {
                        role: "user",
                        content: `Create a simple single-sentence practice question about this text: "${context.substring(0, 1000)}". Only output the question, nothing else.`
                    }
                ],
                max_tokens: 100,
                temperature: 0.7,
            }),
        });

        console.log('Chat API Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { error: errorText };
            }

            console.error('Chat API error:', response.status, errorData);

            if (response.status === 503) {
                return res.status(503).json({
                    error: "Model is loading. Please try again in 20 seconds.",
                    retryAfter: 20
                });
            }

            if (response.status === 401 || response.status === 403) {
                return res.status(500).json({
                    error: "Authentication failed. Please check your Hugging Face API key in Vercel settings."
                });
            }

            return res.status(response.status).json({
                error: errorData.error || "Failed to generate question",
                details: errorData
            });
        }

        const data = await response.json();
        console.log('Chat API Response received');

        let question = "";

        // Handle chat completions response format
        if (data.choices && data.choices[0]?.message?.content) {
            question = data.choices[0].message.content.trim();
        } else if (data.generated_text) {
            question = data.generated_text.trim();
        } else if (typeof data === "string") {
            question = data.trim();
        }

        // Cleanup
        question = question
            .replace(/^Question:\s*/i, "")
            .replace(/^Here's a question:\s*/i, "")
            .replace(/^Here is a question:\s*/i, "")
            .trim();

        if (!question) {
            console.error('Failed to extract question from response:', data);
            return res.status(500).json({
                error: "Failed to generate question",
                details: "Could not extract question from API response",
                rawResponse: data
            });
        }

        return res.status(200).json({
            question,
            subject: subject || "General",
            difficulty,
            context: context.substring(0, 50) + "..."
        });

    } catch (error) {
        console.error("Simple question generation error:", error);
        return res.status(500).json({
            error: error.message || "Internal server error"
        });
    }
}