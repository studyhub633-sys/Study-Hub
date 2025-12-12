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

  } catch (error) {
    console.error("Flashcard generation error:", error);
    
    if (error.message === "Authorization header required" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}

