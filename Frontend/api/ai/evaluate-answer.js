import { checkAndRecordUsage, updateAiResponse } from './_utils/ai-usage.js';
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
        const { correctAnswer, studentAnswer, threshold = 0.7 } = req.body;

        if (!correctAnswer || !studentAnswer) {
            return res.status(400).json({ error: "Both 'correctAnswer' and 'studentAnswer' are required" });
        }

        // Check global usage limits
        let usageData;
        try {
            usageData = await checkAndRecordUsage(user, "answer_evaluation", studentAnswer);
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

        // Use Groq to evaluate the answer
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
                        role: "system",
                        content: "You are an educational evaluator. Compare the student's answer to the correct answer and determine how similar/correct it is. Return ONLY a JSON object with these fields: similarity (a number between 0 and 1), isCorrect (boolean), feedback (a brief explanation)."
                    },
                    {
                        role: "user",
                        content: `Correct Answer: "${correctAnswer}"\n\nStudent Answer: "${studentAnswer}"\n\nEvaluate the student's answer and return JSON only.`
                    }
                ],
                max_tokens: 200,
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Groq API error:', response.status, errorData);

            // Fallback to simple text comparison
            const similarity = simpleTextSimilarity(correctAnswer, studentAnswer);
            const isCorrect = similarity >= threshold;
            const feedback = isCorrect
                ? "Your answer appears correct!"
                : `Your answer is partially correct. Similarity: ${Math.round(similarity * 100)}%`;

            const result = {
                similarity: Math.round(similarity * 100) / 100,
                isCorrect,
                threshold,
                feedback,
                correctAnswer,
                studentAnswer
            };

            // Record the response in history
            if (usageData?.usageId) {
                await updateAiResponse(usageData.usageId, result);
            }

            return res.status(200).json(result);
        }

        const data = await response.json();
        let result = null;

        if (data.choices && data.choices[0]?.message?.content) {
            const content = data.choices[0].message.content.trim();
            try {
                // Try to extract JSON from the response
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    result = JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
                console.error('Failed to parse evaluation response:', e);
            }
        }

        if (result && typeof result.similarity === 'number') {
            const finalResult = {
                similarity: Math.round(result.similarity * 100) / 100,
                isCorrect: result.isCorrect ?? (result.similarity >= threshold),
                threshold,
                feedback: result.feedback || (result.isCorrect ? "Correct!" : "Try again."),
                correctAnswer,
                studentAnswer
            };

            // Record the response in history
            if (usageData?.usageId) {
                await updateAiResponse(usageData.usageId, finalResult);
            }

            return res.status(200).json(finalResult);
        }

        // Fallback to simple text comparison
        const similarity = simpleTextSimilarity(correctAnswer, studentAnswer);
        const isCorrect = similarity >= threshold;
        const feedback = isCorrect
            ? "Your answer is correct!"
            : `Your answer is partially correct. Similarity: ${Math.round(similarity * 100)}%`;

        const finalResult = {
            similarity: Math.round(similarity * 100) / 100,
            isCorrect,
            threshold,
            feedback,
            correctAnswer,
            studentAnswer
        };

        // Record the response in history
        if (usageData?.usageId) {
            await updateAiResponse(usageData.usageId, finalResult);
        }

        return res.status(200).json(finalResult);

    } catch (error) {
        console.error("Answer evaluation error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}

function simpleTextSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    if (union.size === 0) return 0;
    return intersection.size / union.size;
}
