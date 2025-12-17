
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY || process.env.HUGGING_FACE_API_KEY;

export default async function handler(req, res) {
    if (!HF_API_KEY) {
        return res.status(500).json({ error: "No API Key found" });
    }

    const endpoints = [
        {
            name: "Chat Completions (New - Recommended)",
            url: "https://router.huggingface.co/v1/chat/completions",
            body: {
                model: "google/gemma-2-2b-it",
                messages: [{ role: "user", content: "Hello" }],
                max_tokens: 5
            }
        },
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
                body: JSON.stringify(endpoint.body),
            });

            let responseData = null;
            let errorDetail = "";

            try {
                const text = await response.text();
                try {
                    responseData = JSON.parse(text);
                } catch {
                    errorDetail = text.substring(0, 200);
                }
            } catch (e) { }

            results[endpoint.name] = {
                url: endpoint.url,
                status: response.status,
                ok: response.ok,
                response: response.ok ? responseData : null,
                error: !response.ok ? (responseData?.error || errorDetail) : null
            };
        } catch (error) {
            results[endpoint.name] = { url: endpoint.url, error: error.message };
        }
    }

    res.status(200).json({
        apiKeyConfigured: !!HF_API_KEY,
        apiKeyPrefix: HF_API_KEY ? HF_API_KEY.substring(0, 8) + "..." : null,
        results
    });
}
