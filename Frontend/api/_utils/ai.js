const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Generates content using Google Gemini model
 * @param {string} prompt The user prompt
 * @param {string} systemInstruction Optional system instruction
 * @param {Object} options Optional parameters (temperature, maxOutputTokens, jsonMode)
 * @returns {Promise<string>} The generated text
 */
export async function generateContent(prompt, systemInstruction = "", options = {}) {
    if (!GEMINI_API_KEY) {
        throw new Error("Misconfigured: GEMINI_API_KEY is missing via environment variables.");
    }

    const model = options.model || "gemini-1.5-flash";
    const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }]
    };

    if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    // Configuration
    const generationConfig = {};
    if (options.temperature !== undefined) generationConfig.temperature = options.temperature;
    if (options.maxOutputTokens !== undefined) generationConfig.maxOutputTokens = options.maxOutputTokens;
    if (options.jsonMode) generationConfig.responseMimeType = "application/json";

    if (Object.keys(generationConfig).length > 0) {
        payload.generationConfig = generationConfig;
    }

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errorMessage = errData.error?.message || response.statusText;

        if (response.status === 429) {
            throw new Error("Rate limit exceeded. Please try again later.");
        }
        throw new Error(`Gemini API Error: ${errorMessage}`);
    }

    const data = await response.json();

    // Check for safety blocks or empty responses
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response generated. The prompt might have triggered safety filters.");
    }

    const candidate = data.candidates[0];
    if (candidate.finishReason === "SAFETY") {
        throw new Error("Response blocked by safety filters.");
    }

    return candidate.content?.parts?.[0]?.text || "";
}

/**
 * Generates an embedding for the given text using Gemini
 * @param {string} text The text to embed
 * @returns {Promise<number[]>} The embedding vector
 */
export async function generateEmbedding(text) {
    if (!GEMINI_API_KEY) {
        throw new Error("Misconfigured: GEMINI_API_KEY is missing via environment variables.");
    }

    const model = "text-embedding-004"; // Optimized for text retrieval/similarity
    const url = `${GEMINI_BASE_URL}/${model}:embedContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: { parts: [{ text }] }
        })
    });

    if (!response.ok) {
        console.error("Gemini Embedding Error:", response.status, await response.text());
        return null;
    }

    const data = await response.json();
    return data.embedding?.values || null;
}
