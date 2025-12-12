import { verifyAuth, corsHeaders } from "./lib/auth.js";

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

  // Extract route from URL
  let path = req.url || "";
  path = path.split("?")[0]; // Remove query string
  path = path.replace(/^\/api\/ai/, "").replace(/^\//, "");
  const route = path.split("/").filter(Boolean)[0] || "health";

  try {
    // Health check doesn't need auth
    if (route === "health") {
      return await handleHealth(req, res);
    }

    // All other routes need auth
    const user = await verifyAuth(req);

    switch (route) {
      case "generate-question":
        return await handleGenerateQuestion(req, res, user);
      case "evaluate-answer":
        return await handleEvaluateAnswer(req, res, user);
      case "generate-flashcards":
        return await handleGenerateFlashcards(req, res, user);
      default:
        return res.status(404).json({ error: "Route not found" });
    }
  } catch (error) {
    console.error(`AI API error (${route}):`, error);
    
    if (error.message === "Authorization header required" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Internal server error", message: error.message });
  }
}

// Health check
async function handleHealth(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasApiKey = !!HF_API_KEY;
  const hasSupabase = !!(supabaseUrl && supabaseServiceKey);

  return res.status(200).json({
    status: hasApiKey ? "ready" : "not_configured",
    services: {
      huggingface: hasApiKey ? "configured" : "missing_api_key",
      authentication: hasSupabase ? "configured" : "not_configured",
    },
    message: hasApiKey 
      ? "AI services are ready" 
      : "HUGGINGFACE_API_KEY not set in environment variables",
  });
}

// Generate question
async function handleGenerateQuestion(req, res, user) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!HF_API_KEY) {
    return res.status(503).json({ 
      error: "Hugging Face API key not configured. Please set HUGGINGFACE_API_KEY in your environment variables." 
    });
  }

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
}

// Evaluate answer
async function handleEvaluateAnswer(req, res, user) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!HF_API_KEY) {
    return res.status(503).json({ 
      error: "Hugging Face API key not configured. Please set HUGGINGFACE_API_KEY in your environment variables." 
    });
  }

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
}

// Generate flashcards
async function handleGenerateFlashcards(req, res, user) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!HF_API_KEY) {
    return res.status(503).json({ 
      error: "Hugging Face API key not configured. Please set HUGGINGFACE_API_KEY in your environment variables." 
    });
  }

  const { notes, subject, count = 5 } = req.body;

  if (!notes || !subject) {
    return res.status(400).json({ 
      error: "Both 'notes' and 'subject' are required" 
    });
  }

  if (count > 10) {
    return res.status(400).json({ 
      error: "Maximum 10 flashcards can be generated at once" 
    });
  }

  const flashcards = [];
  const promptBase = `Generate a flashcard (question and answer) for ${subject} based on: ${notes}`;

  for (let i = 0; i < count; i++) {
    try {
      const response = await fetch(
        `${HF_API_URL}/google/flan-t5-base`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: `${promptBase}. Format as: Q: [question] A: [answer]`,
            parameters: {
              max_new_tokens: 200,
              temperature: 0.8,
              return_full_text: false,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        let text = "";
        
        if (Array.isArray(data) && data[0]?.generated_text) {
          text = data[0].generated_text.trim();
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

      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Error generating flashcard ${i + 1}:`, error);
    }
  }

  if (flashcards.length === 0) {
    return res.status(500).json({ 
      error: "Failed to generate any flashcards. Please try again." 
    });
  }

  return res.status(200).json({
    flashcards,
    count: flashcards.length,
    requested: count,
  });
}

