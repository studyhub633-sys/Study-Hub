import { verifyAuth, corsHeaders } from "../lib/auth.js";

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY;
const HF_API_URL = "https://api-inference.huggingface.co/models";

export default async function handler(req, res) {
  const headers = corsHeaders();
  Object.keys(headers).forEach(key => {
    res.setHeader(key, headers[key]);
  });

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!HF_API_KEY) {
    return res.status(503).json({ 
      error: "Hugging Face API key not configured. Please set HUGGINGFACE_API_KEY in your environment variables." 
    });
  }

  try {
    const user = await verifyAuth(req);
    const { context, subject, difficulty = "medium" } = req.body;

    if (!context || !subject) {
      return res.status(400).json({ 
        error: "Both 'context' and 'subject' are required" 
      });
    }

    const prompt = `Generate a ${difficulty} difficulty ${subject} study question based on this content: ${context}`;

    const response = await fetch(
      `${HF_API_URL}/google/flan-t5-base`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Hugging Face API error:", errorData);
      
      if (response.status === 503) {
        return res.status(503).json({ 
          error: "Model is loading. Please try again in a few moments.",
          retryAfter: 30
        });
      }

      return res.status(response.status).json({ 
        error: errorData.error || "Failed to generate question",
        details: errorData
      });
    }

    const data = await response.json();
    
    let question = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      question = data[0].generated_text.trim();
    } else if (data.generated_text) {
      question = data.generated_text.trim();
    } else if (typeof data === "string") {
      question = data.trim();
    }

    if (!question) {
      return res.status(500).json({ 
        error: "Failed to extract question from response",
        rawResponse: data
      });
    }

    return res.status(200).json({
      question,
      subject,
      difficulty,
      context: context.substring(0, 100) + "...",
    });

  } catch (error) {
    console.error("Question generation error:", error);
    
    if (error.message === "Authorization header required" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}

