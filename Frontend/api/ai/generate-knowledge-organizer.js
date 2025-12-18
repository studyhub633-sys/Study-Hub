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
        const { prompt, subject, topic } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        // Check global usage limits
        let usageData;
        try {
            usageData = await checkAndRecordUsage(user, "knowledge_organizer", prompt, subject, topic);
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

        const generationPrompt = `Create a structured knowledge organizer with sections and key points based on this topic: ${prompt}${subject ? ` Subject: ${subject}` : ""}${topic ? ` Topic: ${topic}` : ""}. Format the response as JSON with this structure: {"sections": [{"title": "Section Title", "content": "Detailed content", "keyPoints": ["Point 1", "Point 2"]}]}. Generate 3-5 sections with relevant content and 3-5 key points per section.`;

        const response = await fetch(GROQ_CHAT_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
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
        } else if (Array.isArray(data) && data[0]?.generated_text) {
            generatedText = data[0].generated_text.trim();
        } else if (data.generated_text) {
            generatedText = data.generated_text.trim();
        } else if (typeof data === "string") {
            generatedText = data.trim();
        }

        if (!generatedText) {
            return res.status(500).json({ error: "Failed to extract content from response", rawResponse: data });
        }

        const extractJSON = (text) => {
            const jsonBlockMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
            if (jsonBlockMatch && jsonBlockMatch[1]) {
                try {
                    return JSON.parse(jsonBlockMatch[1]);
                } catch (e) {
                    console.log("Failed to parse JSON from code block:", e);
                }
            }

            try {
                const firstOpen = text.indexOf('{');
                const lastClose = text.lastIndexOf('}');
                if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
                    const potentialJson = text.substring(firstOpen, lastClose + 1);
                    return JSON.parse(potentialJson);
                }
            } catch (e) {
                console.log("Failed to parse found JSON object:", e);
            }

            return null;
        };

        const parsedData = extractJSON(generatedText);
        let sections = [];

        if (parsedData && parsedData.sections && Array.isArray(parsedData.sections)) {
            sections = parsedData.sections;
        } else {
            const lines = generatedText.split("\n").filter(line => line.trim());
            let currentSection = null;

            for (const line of lines) {
                if (line.match(/^###/) || line.match(/^Section \d+:/i) || (line.match(/^[A-Z][^:]*:/) && !line.includes("Key Point"))) {
                    if (currentSection) sections.push(currentSection);
                    const title = line.replace(/^###\s*/, "")
                        .replace(/^Section \d+:\s*/i, "")
                        .replace(/:$/, "")
                        .trim();
                    currentSection = { title: title || "Section", content: "", keyPoints: [] };
                } else if (currentSection) {
                    if (line.match(/^[-•*]\s*/) || line.match(/^Key Point/i)) {
                        const point = line.replace(/^[-•*]\s*/, "").replace(/^Key Point\s*\d*:?\s*/i, "").trim();
                        if (point) currentSection.keyPoints.push({ text: point, mastered: false });
                    } else {
                        if (!line.startsWith("```") && !line.startsWith("{") && !line.startsWith("}")) {
                            currentSection.content += (currentSection.content ? " " : "") + line.trim();
                        }
                    }
                }
            }
            if (currentSection) sections.push(currentSection);
        }

        if (sections.length === 0) {
            let cleanedText = generatedText;
            if (cleanedText.trim().startsWith("```json")) {
                cleanedText = cleanedText.replace(/```json\s*/, "").replace(/```\s*$/, "");
            }

            sections = [{
                title: "Introduction",
                content: cleanedText.substring(0, 500) + (cleanedText.length > 500 ? "..." : ""),
                keyPoints: [{ text: "Could not parse structured content from AI response", mastered: false }],
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

        // Record the response in history
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
