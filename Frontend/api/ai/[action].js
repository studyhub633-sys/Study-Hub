import { checkAndRecordUsage, updateAiResponse } from '../_utils/ai-usage.js';
import { verifyAuth } from '../_utils/auth.js';

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY || process.env.HUGGING_FACE_API_KEY;
const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_EMBEDDINGS_URL = "https://router.huggingface.co/hf-inference/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

// Initialize Groq config
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroqAPI(messages, temperature = 0.5, max_tokens = 4000, jsonMode = false) {
    if (!GROQ_API_KEY) {
        throw new Error("GROQ API key not configured");
    }

    const body = {
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens,
    };

    if (jsonMode) {
        body.response_format = { type: "json_object" };
    }

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Groq API Error:", response.status, errorData);
        if (response.status === 429) {
            throw new Error("Rate limit exceeded. Please try again later.");
        }
        throw new Error(`AI Provider Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
}

export default async function handler(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const action = url.pathname.split('/').pop();

    switch (action) {
        case 'chat':
            return handleChat(req, res);
        case 'generate-question':
            return handleGenerateQuestion(req, res);
        case 'generate-flashcards':
            return handleGenerateFlashcards(req, res);
        case 'generate-knowledge-organizer':
            return handleGenerateKnowledgeOrganizer(req, res);
        case 'evaluate-answer':
            return handleEvaluateAnswer(req, res);
        case 'probe':
            return handleProbe(req, res);
        case 'generate-simple-question':
            return handleGenerateSimpleQuestion(req, res);
        case 'generate-mindmap':
            return handleGenerateMindMap(req, res);
        case 'grade-exam':
            return handleGradeExam(req, res);
        default:
            return res.status(404).json({ error: 'Action not found' });
    }
}

async function handleChat(req, res) {
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
        const { message, context } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Check and record usage
        let usageData;
        try {
            usageData = await checkAndRecordUsage(user, "chat", message, null, null);
        } catch (error) {
            if (error.status === 429) {
                return res.status(429).json({ error: error.message, usageCount: error.usageCount, limit: error.limit });
            }
            throw error;
        }

        let systemPrompt = "You are a helpful, encouraging, and knowledgeable AI tutor. Your goal is to help students learn and understand concepts clearly. Keep answers concise but informative.";
        if (context) {
            systemPrompt += `\n\nContext/Notes provided by student:\n${context}`;
        }

        const response = await fetch(HF_CHAT_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemma-2-2b-it",
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
                return res.status(503).json({ error: "Model is loading.", retryAfter: 30 });
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

        if (usageData?.usageId) {
            await updateAiResponse(usageData.usageId, reply);
        }

        return res.status(200).json({ reply });

    } catch (error) {
        console.error("Chat error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}

async function handleGenerateQuestion(req, res) {
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

        if (!context || !subject) {
            return res.status(400).json({ error: "Both 'context' and 'subject' are required" });
        }

        // Check and record usage
        let usageData;
        try {
            usageData = await checkAndRecordUsage(user, "generate-question", context.substring(0, 100), subject, null);
        } catch (error) {
            if (error.status === 429) {
                return res.status(429).json({ error: error.message, usageCount: error.usageCount, limit: error.limit });
            }
            throw error;
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

        const response = await fetch(HF_CHAT_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemma-2-2b-it",
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

        // Clean up the question
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

        if (usageData?.usageId) {
            await updateAiResponse(usageData.usageId, question);
        }

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

async function handleGenerateFlashcards(req, res) {
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
        const { notes, subject, count = 5 } = req.body;

        if (!notes || !subject) {
            return res.status(400).json({ error: "Both 'notes' and 'subject' are required" });
        }

        // Check and record usage
        let usageData;
        try {
            usageData = await checkAndRecordUsage(user, "generate-flashcards", notes.substring(0, 100), subject, null);
        } catch (error) {
            if (error.status === 429) {
                return res.status(429).json({ error: error.message, usageCount: error.usageCount, limit: error.limit });
            }
            throw error;
        }

        if (count > 10) {
            return res.status(400).json({ error: "Maximum 10 flashcards can be generated at once" });
        }

        const flashcards = [];
        const promptBase = `Generate a flashcard (question and answer) for ${subject} based on: ${notes}. Format as: Q: [question] A: [answer]`;

        const fetchPromises = [];
        for (let i = 0; i < count; i++) {
            fetchPromises.push(
                fetch(HF_CHAT_URL, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${HF_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "google/gemma-2-2b-it",
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
                } else if (data.generated_text) {
                    text = data.generated_text.trim();
                }

                const questionMatch = text.match(/Q:\s*(.+?)(?:\s*A:|$)/i);
                const answerMatch = text.match(/A:\s*(.+?)$/i);

                if (questionMatch && answerMatch) {
                    flashcards.push({
                        question: questionMatch[1].trim(),
                        answer: answerMatch[1].trim(),
                        subject,
                    });
                } else {
                    const parts = text.split(/\n/).filter(p => p.trim());
                    if (parts.length >= 2) {
                        flashcards.push({
                            question: parts[0].replace(/^Q:\s*/i, "").trim(),
                            answer: parts.slice(1).join(" ").replace(/^A:\s*/i, "").trim(),
                            subject,
                        });
                    }
                }
            }
        }

        if (flashcards.length === 0) {
            return res.status(500).json({ error: "Failed to generate any flashcards. Please try again." });
        }

        if (usageData?.usageId) {
            await updateAiResponse(usageData.usageId, flashcards);
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

async function handleGenerateKnowledgeOrganizer(req, res) {
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
        const { prompt, subject, topic } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        // Check and record usage
        let usageData;
        try {
            usageData = await checkAndRecordUsage(user, "knowledge_organizer", prompt, subject, topic);
        } catch (error) {
            if (error.status === 429) {
                return res.status(429).json({ error: error.message, usageCount: error.usageCount, limit: error.limit });
            }
            throw error;
        }

        const generationPrompt = `Create a structured knowledge organizer with sections and key points based on this topic: ${prompt}${subject ? ` Subject: ${subject}` : ""}${topic ? ` Topic: ${topic}` : ""}. Format the response as JSON with this structure: {"sections": [{"title": "Section Title", "content": "Detailed content", "keyPoints": ["Point 1", "Point 2"]}]}. Generate 3-5 sections with relevant content and 3-5 key points per section.`;

        const response = await fetch(HF_CHAT_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemma-2-2b-it",
                messages: [
                    { role: "user", content: generationPrompt }
                ],
                max_tokens: 1000,
                temperature: 0.7,
                top_p: 0.9,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 503) {
                return res.status(503).json({ error: "Model is loading.", retryAfter: 30 });
            }
            return res.status(response.status).json({ error: errorData.error || "Failed to generate knowledge organizer" });
        }

        const data = await response.json();
        let generatedText = "";

        if (data.choices && data.choices[0]?.message?.content) {
            generatedText = data.choices[0].message.content.trim();
        } else if (data.generated_text) {
            generatedText = data.generated_text.trim();
        } else if (typeof data === "string") {
            generatedText = data.trim();
        }

        if (!generatedText) {
            return res.status(500).json({ error: "Failed to extract content from response", rawResponse: data });
        }

        let sections = [];
        try {
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.sections && Array.isArray(parsed.sections)) {
                    sections = parsed.sections;
                }
            }
        } catch (e) {
            const lines = generatedText.split("\n").filter(line => line.trim());
            let currentSection = null;
            for (const line of lines) {
                if (line.match(/^[A-Z][^:]*:/) || line.match(/^Section \d+:/i) || line.match(/^###/)) {
                    if (currentSection) sections.push(currentSection);
                    const title = line.replace(/^###\s*/, "").replace(/^Section \d+:\s*/i, "").replace(/:/, "").trim();
                    currentSection = { title: title || "Section", content: "", keyPoints: [] };
                } else if (currentSection) {
                    if (line.match(/^[-•*]\s*/) || line.match(/^Key Point/i)) {
                        const point = line.replace(/^[-•*]\s*/, "").replace(/^Key Point\s*\d*:?\s*/i, "").trim();
                        if (point) currentSection.keyPoints.push({ text: point, mastered: false });
                    } else {
                        currentSection.content += (currentSection.content ? " " : "") + line.trim();
                    }
                }
            }
            if (currentSection) sections.push(currentSection);
        }

        if (sections.length === 0) {
            sections = [{
                title: "Main Content",
                content: generatedText.substring(0, 500),
                keyPoints: [{ text: "Key concepts from the generated text", mastered: false }],
                color: "primary"
            }];
        }

        sections = sections.map((section, index) => ({
            title: section.title || `Section ${index + 1}`,
            content: section.content || "",
            keyPoints: (section.keyPoints || []).map(kp => typeof kp === "string" ? { text: kp, mastered: false } : { ...kp, mastered: false }),
            color: index % 3 === 0 ? "primary" : index % 3 === 1 ? "secondary" : "accent",
            reviewed: false
        }));

        if (usageData?.usageId) {
            await updateAiResponse(usageData.usageId, { sections, subject, topic });
        }

        res.status(200).json({
            sections,
            subject: subject || null,
            topic: topic || null,
            usageCount: usageData?.usageCount || 0,
            limit: usageData?.limit || (usageData?.isPremium ? 500 : 10)
        });

    } catch (error) {
        console.error("Error generating knowledge organizer:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}

async function handleEvaluateAnswer(req, res) {
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
        const { correctAnswer, studentAnswer, threshold = 0.7 } = req.body;

        if (!correctAnswer || !studentAnswer) {
            return res.status(400).json({ error: "Both 'correctAnswer' and 'studentAnswer' are required" });
        }

        // Try to get embeddings for both sentences
        const [correctEmbedding, studentEmbedding] = await Promise.all([
            getEmbedding(correctAnswer),
            getEmbedding(studentAnswer)
        ]);

        let similarity = 0;

        if (correctEmbedding && studentEmbedding) {
            similarity = cosineSimilarity(correctEmbedding, studentEmbedding);
        } else {
            similarity = simpleTextSimilarity(correctAnswer, studentAnswer);
        }

        similarity = Math.max(0, Math.min(1, similarity));
        const isCorrect = similarity >= threshold;

        return res.status(200).json({
            similarity: Math.round(similarity * 100) / 100,
            isCorrect,
            threshold,
            feedback: isCorrect
                ? "Your answer is correct!"
                : `Your answer is partially correct. Similarity: ${Math.round(similarity * 100)}%`,
        });

    } catch (error) {
        console.error("Answer evaluation error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}

async function getEmbedding(text) {
    try {
        const response = await fetch(HF_EMBEDDINGS_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: text }),
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            return Array.isArray(data[0]) ? data[0] : data;
        }
        return null;
    } catch (error) {
        return null;
    }
}

function cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (normA * normB);
}

function simpleTextSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    if (union.size === 0) return 0;
    return intersection.size / union.size;
}

async function handleProbe(req, res) {
    if (!HF_API_KEY) {
        return res.status(500).json({ error: "No API Key found" });
    }

    const endpoints = [
        { url: "https://router.huggingface.co/v1/chat/completions", name: "Chat Completions (New)" },
    ];

    const results = {};

    for (const endpoint of endpoints) {
        try {
            console.log(`Probing ${endpoint.url}...`);
            const response = await fetch(endpoint.url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "google/gemma-2-2b-it",
                    messages: [{ role: "user", content: "Hello" }],
                    max_tokens: 1
                }),
            });

            let errorDetail = "";
            if (!response.ok) {
                try {
                    errorDetail = await response.text();
                } catch (e) { }
            }

            results[endpoint.name] = {
                url: endpoint.url,
                status: response.status,
                ok: response.ok,
                error: errorDetail ? errorDetail.substring(0, 200) : null
            };
        } catch (error) {
            results[endpoint.name] = { url: endpoint.url, error: error.message };
        }
    }

    res.status(200).json(results);
}

async function handleGenerateSimpleQuestion(req, res) {
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

        // Check and record usage
        let usageData;
        try {
            usageData = await checkAndRecordUsage(user, "generate-simple-question", context.substring(0, 100), subject, null);
        } catch (error) {
            if (error.status === 429) {
                return res.status(429).json({ error: error.message, usageCount: error.usageCount, limit: error.limit });
            }
            throw error;
        }

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

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { error: errorText };
            }

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

        let question = "";

        if (data.choices && data.choices[0]?.message?.content) {
            question = data.choices[0].message.content.trim();
        } else if (data.generated_text) {
            question = data.generated_text.trim();
        } else if (typeof data === "string") {
            question = data.trim();
        }

        question = question
            .replace(/^Question:\s*/i, "")
            .replace(/^Here's a question:\s*/i, "")
            .replace(/^Here is a question:\s*/i, "")
            .trim();

        if (!question) {
            return res.status(500).json({
                error: "Failed to generate question",
                details: "Could not extract question from API response",
                rawResponse: data
            });
        }

        if (usageData?.usageId) {
            await updateAiResponse(usageData.usageId, question);
        }

        return res.status(200).json({
            question,
            subject: subject || "General",
            difficulty,
            context: context.substring(0, 50) + "..."
        });

    } catch (error) {
        console.error("Simple question generation error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}

async function handleGenerateMindMap(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Check for GROQ API Key
    if (!process.env.GROQ_API_KEY) {
        return res.status(503).json({ error: "GROQ API key not configured." });
    }

    try {
        const user = await verifyAuth(req);
        const { content, subject, title } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: "Content is required" });
        }

        // Check premium and record usage
        let usageData;
        try {
            usageData = await checkAndRecordUsage(user, "mind-map", content, subject, title);
        } catch (error) {
            if (error.status === 429) {
                return res.status(429).json({ error: error.message, usageCount: error.usageCount, limit: error.limit });
            }
            throw error;
        }

        const systemPrompt = `You are an expert mind map generator that creates clean, readable, and well-organized visual hierarchies.
Create a hierarchical JSON mind map from the provided text.
Structure must be: { "title": "Main Topic", "children": [ { "title": "Subtopic", "children": [...] } ] }

CRITICAL RULES for readability:
- Limit root node to maximum 5-7 main branches (children)
- Limit depth to 3 levels maximum
- Each branch should have 2-5 sub-items maximum
- Keep titles CONCISE: 2-5 words per node maximum
- Extract only the MOST IMPORTANT concepts
- Use clear, academic language
- Each node must have "title" (string) and "children" (array) properties
- Return ONLY the JSON, no explanations

Example structure:
{
  "title": "Photosynthesis",
  "children": [
    {
      "title": "Light Reactions",
      "children": [
        { "title": "Photosystem II", "children": [] },
        { "title": "Electron Transport", "children": [] }
      ]
    },
    {
      "title": "Calvin Cycle",
      "children": [
        { "title": "Carbon Fixation", "children": [] }
      ]
    }
  ]
}`;

        const userPrompt = `Create a clean, readable mind map structure from these study notes. Focus on the 5-7 most important concepts. Keep all node titles to 2-5 words maximum:\n\n${content.substring(0, 5000)}`;

        let generatedText;
        try {
            generatedText = await callGroqAPI([
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ], 0.5, 4000, true);
        } catch (apiError) {
            return res.status(503).json({ error: apiError.message });
        }


        let mindMapData;

        try {
            mindMapData = JSON.parse(generatedText);
            // Validate structure
            if (!mindMapData.title || !Array.isArray(mindMapData.children)) {
                throw new Error('Invalid structure');
            }
        } catch (e) {
            console.error('JSON parse error:', e);
            // Fallback structure
            mindMapData = {
                title: title || subject || "Mind Map",
                children: [
                    {
                        title: "Generated Content",
                        children: [
                            { title: content.substring(0, 100) + "...", children: [] }
                        ]
                    }
                ]
            };
        }

        if (usageData?.usageId) {
            await updateAiResponse(usageData.usageId, mindMapData);
        }

        return res.status(200).json({ mindMapData });

    } catch (error) {
        console.error("Mind map generation error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}

async function handleGradeExam(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Check for GROQ API Key
    if (!process.env.GROQ_API_KEY) {
        return res.status(503).json({ error: "GROQ API key not configured." });
    }

    try {
        const user = await verifyAuth(req);
        const { paperTitle, subject, examBoard, year, answers } = req.body;

        if (!paperTitle || !answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ error: "Paper title and answers array are required" });
        }

        // Check premium and record usage
        let usageData;
        try {
            usageData = await checkAndRecordUsage(user, "grade-exam", paperTitle, subject, null);
        } catch (error) {
            if (error.status === 429) {
                return res.status(429).json({ error: error.message, usageCount: error.usageCount, limit: error.limit });
            }
            throw error;
        }

        // Grade each answer
        const gradedAnswers = [];
        let totalMarks = 0;
        let achievedMarks = 0;

        for (const answer of answers) {
            const { questionNumber, studentAnswer, maxMarks, markScheme } = answer;
            totalMarks += maxMarks || 0;

            if (!studentAnswer || !studentAnswer.trim()) {
                gradedAnswers.push({
                    questionNumber,
                    studentAnswer: studentAnswer || "",
                    maxMarks: maxMarks || 0,
                    marksAwarded: 0,
                    feedback: "No answer provided",
                    strengths: [],
                    improvements: ["Provide an answer to receive marks"]
                });
                continue;
            }

            const systemPrompt = `You are an expert GCSE ${subject || ''} examiner for ${examBoard || 'UK exam boards'}.
You must mark answers fairly and provide constructive feedback.
Return your response as a JSON object with this structure:
{
  "marksAwarded": <number between 0 and ${maxMarks}>,
  "feedback": "<brief overall comment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}`;

            const userPrompt = `Mark this answer for Question ${questionNumber}, worth ${maxMarks} marks.
Student Answer: "${studentAnswer}"
${markScheme ? `Mark Scheme: ${markScheme}\n` : ''}
Provide marks (0-${maxMarks}), feedback, strengths, and improvements in strict JSON format.`;

            try {
                const resultJSON = await callGroqAPI([
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ], 0.3, 500, true);

                let result;

                try {
                    result = JSON.parse(resultJSON);
                    // Ensure marks are within bounds
                    result.marksAwarded = Math.min(Math.max(0, result.marksAwarded || 0), maxMarks);
                } catch (e) {
                    console.error('JSON parse error for question', questionNumber, e);
                    result = {
                        marksAwarded: 0,
                        feedback: "Error parsing AI response",
                        strengths: [],
                        improvements: []
                    };
                }

                gradedAnswers.push({
                    questionNumber,
                    studentAnswer,
                    maxMarks,
                    marksAwarded: result.marksAwarded,
                    feedback: result.feedback || "Marked",
                    strengths: result.strengths || [],
                    improvements: result.improvements || []
                });

                achievedMarks += result.marksAwarded || 0;

            } catch (error) {
                console.error('Error marking question', questionNumber, error);
                gradedAnswers.push({
                    questionNumber,
                    studentAnswer,
                    maxMarks,
                    marksAwarded: 0,
                    feedback: "Error during marking",
                    strengths: [],
                    improvements: []
                });
            }
        }

        const percentage = totalMarks > 0 ? Math.round((achievedMarks / totalMarks) * 100) : 0;
        const grade = getGradeFromPercentage(percentage);

        const result = {
            paperTitle,
            subject: subject || "General",
            examBoard: examBoard || "GCSE",
            year: year || new Date().getFullYear(),
            totalMarks,
            achievedMarks,
            percentage,
            grade,
            gradedAnswers
        };

        if (usageData?.usageId) {
            await updateAiResponse(usageData.usageId, result);
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error("Exam grading error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}

function getGradeFromPercentage(percentage) {
    if (percentage >= 90) return '9';
    if (percentage >= 80) return '8';
    if (percentage >= 70) return '7';
    if (percentage >= 60) return '6';
    if (percentage >= 50) return '5';
    if (percentage >= 40) return '4';
    if (percentage >= 30) return '3';
    if (percentage >= 20) return '2';
    return '1';
}