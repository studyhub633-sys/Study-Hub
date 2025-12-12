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
    const { correctAnswer, studentAnswer, threshold = 0.7 } = req.body;

    if (!correctAnswer || !studentAnswer) {
      return res.status(400).json({ 
        error: "Both 'correctAnswer' and 'studentAnswer' are required" 
      });
    }

    if (typeof threshold !== "number" || threshold < 0 || threshold > 1) {
      return res.status(400).json({ 
        error: "Threshold must be a number between 0 and 1" 
      });
    }

    const response = await fetch(
      `${HF_API_URL}/sentence-transformers/all-MiniLM-L6-v2`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {
            source_sentence: correctAnswer,
            sentences: [studentAnswer],
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
        error: errorData.error || "Failed to evaluate answer",
        details: errorData
      });
    }

    const data = await response.json();
    
    let similarity = 0;
    if (Array.isArray(data) && data.length > 0) {
      similarity = typeof data[0] === "number" ? data[0] : data[0]?.score || 0;
    } else if (typeof data === "number") {
      similarity = data;
    } else if (data.score) {
      similarity = data.score;
    } else if (Array.isArray(data) && data[0]) {
      similarity = Array.isArray(data[0]) ? data[0][0] : data[0];
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
    
    if (error.message === "Authorization header required" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}

