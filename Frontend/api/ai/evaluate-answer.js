import { verifyAuth } from '../_utils/auth.js';

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY || process.env.HUGGING_FACE_API_KEY;
// For sentence similarity, we use the sentence-transformers pipeline which is often free tier friendly
const HF_EMBEDDINGS_URL = "https://router.huggingface.co/hf-inference/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

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
        const { correctAnswer, studentAnswer, threshold = 0.7 } = req.body;

        if (!correctAnswer || !studentAnswer) {
            return res.status(400).json({ error: "Both 'correctAnswer' and 'studentAnswer' are required" });
        }

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
            console.error("Embedding API error:", response.status);
            return null;
        }

        const data = await response.json();
        if (Array.isArray(data)) {
            return Array.isArray(data[0]) ? data[0] : data;
        }
        return null;
    } catch (error) {
        console.error("Error getting embedding:", error);
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
