import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Initialize Supabase for auth verification
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Hugging Face API configuration
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY;
const HF_API_URL = "https://api-inference.huggingface.co/models";

// Helper function to verify authentication
async function verifyAuth(req, res, next) {
  if (!supabase) {
    return res.status(503).json({ error: "Authentication service not configured" });
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header required" });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

// POST /api/ai/generate-question
// Generate a study question from context using flan-t5-base
router.post("/generate-question", verifyAuth, async (req, res) => {
  if (!HF_API_KEY) {
    return res.status(503).json({ 
      error: "Hugging Face API key not configured. Please set HUGGINGFACE_API_KEY in your .env file." 
    });
  }

  try {
    const { context, subject, difficulty = "medium" } = req.body;

    if (!context || !subject) {
      return res.status(400).json({ 
        error: "Both 'context' and 'subject' are required" 
      });
    }

    // Construct prompt for question generation
    const prompt = `Generate a ${difficulty} difficulty ${subject} study question based on this content: ${context}`;

    // Call Hugging Face Inference API
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
    
    // Extract generated text
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

    res.json({
      question,
      subject,
      difficulty,
      context: context.substring(0, 100) + "...", // Return truncated context
    });

  } catch (error) {
    console.error("Question generation error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
});

// POST /api/ai/evaluate-answer
// Evaluate student answer using sentence-transformers for semantic similarity
router.post("/evaluate-answer", verifyAuth, async (req, res) => {
  if (!HF_API_KEY) {
    return res.status(503).json({ 
      error: "Hugging Face API key not configured. Please set HUGGINGFACE_API_KEY in your .env file." 
    });
  }

  try {
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

    // Get embeddings for both answers
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
    
    // Extract similarity score
    let similarity = 0;
    if (Array.isArray(data) && data.length > 0) {
      similarity = typeof data[0] === "number" ? data[0] : data[0]?.score || 0;
    } else if (typeof data === "number") {
      similarity = data;
    } else if (data.score) {
      similarity = data.score;
    } else if (Array.isArray(data) && data[0]) {
      // Sometimes returns array of arrays
      similarity = Array.isArray(data[0]) ? data[0][0] : data[0];
    }

    // Ensure similarity is between 0 and 1
    similarity = Math.max(0, Math.min(1, similarity));

    const isCorrect = similarity >= threshold;

    res.json({
      similarity: Math.round(similarity * 100) / 100, // Round to 2 decimal places
      isCorrect,
      threshold,
      feedback: isCorrect 
        ? "Your answer is correct!" 
        : `Your answer is partially correct. Similarity: ${Math.round(similarity * 100)}%`,
    });

  } catch (error) {
    console.error("Answer evaluation error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
});

// POST /api/ai/generate-flashcards
// Generate multiple flashcards from study notes
router.post("/generate-flashcards", verifyAuth, async (req, res) => {
  if (!HF_API_KEY) {
    return res.status(503).json({ 
      error: "Hugging Face API key not configured. Please set HUGGINGFACE_API_KEY in your .env file." 
    });
  }

  try {
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

    // Generate flashcards one by one
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

          // Parse Q: and A: format
          const questionMatch = text.match(/Q:\s*(.+?)(?:\s*A:|$)/i);
          const answerMatch = text.match(/A:\s*(.+?)$/i);

          if (questionMatch && answerMatch) {
            flashcards.push({
              question: questionMatch[1].trim(),
              answer: answerMatch[1].trim(),
              subject,
            });
          } else {
            // Fallback: split by newline or use whole text
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

        // Small delay to avoid rate limiting
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Error generating flashcard ${i + 1}:`, error);
        // Continue with other flashcards
      }
    }

    if (flashcards.length === 0) {
      return res.status(500).json({ 
        error: "Failed to generate any flashcards. Please try again." 
      });
    }

    res.json({
      flashcards,
      count: flashcards.length,
      requested: count,
    });

  } catch (error) {
    console.error("Flashcard generation error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
});

// GET /api/ai/health
// Check if AI services are configured and available
router.get("/health", (req, res) => {
  const hasApiKey = !!HF_API_KEY;
  const hasSupabase = !!supabase;

  res.json({
    status: hasApiKey ? "ready" : "not_configured",
    services: {
      huggingface: hasApiKey ? "configured" : "missing_api_key",
      authentication: hasSupabase ? "configured" : "not_configured",
    },
    message: hasApiKey 
      ? "AI services are ready" 
      : "HUGGINGFACE_API_KEY not set in environment variables",
  });
});

export default router;

