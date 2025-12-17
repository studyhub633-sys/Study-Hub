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
        const { notes, subject, count = 5 } = req.body;

        if (!notes || !subject) {
            return res.status(400).json({ error: "Both 'notes' and 'subject' are required" });
        }

        if (count > 10) {
            return res.status(400).json({ error: "Maximum 10 flashcards can be generated at once" });
        }

        const flashcards = [];
        const promptBase = `Generate a flashcard (question and answer) for ${subject} based on: ${notes}. Format as: Q: [question] A: [answer]. Do not use markdown formatting like ** or ##. Return plain text only.`;

        // Generate flashcards in parallel
        const fetchPromises = [];
        for (let i = 0; i < count; i++) {
            fetchPromises.push(
                fetch(GROQ_CHAT_URL, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${GROQ_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            { role: "user", content: promptBase }
                        ],
                        max_tokens: 200,
                        temperature: 0.8,
                    }),
                }).then(r => r.json().then(data => ({ status: r.status, ok: r.ok, data })))
                    .catch(e => ({ ok: false, error: e }))
            );
        }

        const results = await Promise.all(fetchPromises);

        for (const resItem of results) {
            if (resItem.ok) {
                const data = resItem.data;
                let text = "";

                if (data.choices && data.choices[0]?.message?.content) {
                    text = data.choices[0].message.content.trim();
                } else if (Array.isArray(data) && data[0]?.generated_text) {
                    text = data[0].generated_text.trim();
                } else if (data.generated_text) {
                    text = data.generated_text.trim();
                }

                // Helper to clean markdown
                const cleanText = (t) => t.replace(/[*_#`]/g, "").trim();

                const questionMatch = text.match(/Q:\s*(.+?)(?:\s*A:|$)/i);
                const answerMatch = text.match(/A:\s*(.+?)$/i);

                if (questionMatch && answerMatch) {
                    flashcards.push({
                        question: cleanText(questionMatch[1]),
                        answer: cleanText(answerMatch[1]),
                        subject,
                    });
                } else {
                    const parts = text.split(/\n/).filter(p => p.trim());
                    if (parts.length >= 2) {
                        flashcards.push({
                            question: cleanText(parts[0].replace(/^Q:\s*/i, "")),
                            answer: cleanText(parts.slice(1).join(" ").replace(/^A:\s*/i, "")),
                            subject,
                        });
                    }
                }
            }
        }

        if (flashcards.length === 0) {
            return res.status(500).json({ error: "Failed to generate any flashcards. Please try again." });
        }

        return res.status(200).json({
            flashcards,
            count: flashcards.length,
            requested: count,
        });

    } catch (error) {
        console.error("Flashcard generation error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}
