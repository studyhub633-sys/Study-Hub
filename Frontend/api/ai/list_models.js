import 'dotenv/config';

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    console.error("GROQ_API_KEY not found in environment");
    process.exit(1);
}

async function listModels() {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/models", {
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Available Models:");
        data.data.forEach(model => {
            console.log(`- ${model.id}`);
        });
    } catch (error) {
        console.error("Error:", error.message);
    }
}

listModels();
