import { verifyAuth } from '../_utils/auth.js';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

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

        if (!context) {
            return res.status(400).json({ error: "Context is required" });
        }

        console.log('Making request to Groq API...');

        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
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

        console.log('Groq API Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { error: errorText };
            }

            console.error('Groq API error:', response.status, errorData);

            if (response.status === 401 || response.status === 403) {
                return res.status(500).json({
                    error: "Authentication failed. Please check your Groq API key."
                });
            }

            return res.status(response.status).json({
                error: errorData.error?.message || errorData.error || "Failed to generate question",
                details: errorData
            });
        }

        const data = await response.json();
        console.log('Groq API Response received');

        let question = "";

        if (data.choices && data.choices[0]?.message?.content) {
            question = data.choices[0].message.content.trim();
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