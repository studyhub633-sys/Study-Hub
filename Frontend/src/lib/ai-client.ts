/**
 * AI Client for Scientia.ai
 * 
 * This client provides functions to interact with the Express.js backend
 * AI endpoints. All functions require authentication via Supabase.
 */

interface GenerateQuestionParams {
  context: string;
  subject: string;
  difficulty?: "easy" | "medium" | "hard";
}

interface EvaluateAnswerParams {
  correctAnswer: string;
  studentAnswer: string;
  threshold?: number;
}

interface GenerateFlashcardsParams {
  notes: string;
  subject: string;
  count?: number;
}

interface GenerateKnowledgeOrganizerParams {
  prompt: string;
  subject?: string;
  topic?: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

const API_BASE_URL = "";

// Log API base URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log(`[AI Client] API Base URL: ${API_BASE_URL}`);
  console.log(`[AI Client] VITE_API_URL env: ${import.meta.env.VITE_API_URL || "not set"}`);
}

import { createClient } from "@supabase/supabase-js";

/**
 * Get the current Supabase session token
 * Can optionally accept a Supabase client instance
 */
async function getAuthToken(supabaseClient?: any): Promise<string | null> {
  try {
    let supabase = supabaseClient;

    // If no client provided, create one
    if (!supabase) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey =
        import.meta.env.VITE_SUPABASE_ANON_KEY ||
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Supabase credentials not found");
        return null;
      }

      supabase = createClient(supabaseUrl, supabaseAnonKey);
    }

    const { data: { session } } = await supabase.auth.getSession();

    return session?.access_token || null;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

/**
 * Make an authenticated API request
 * Can optionally accept a Supabase client instance
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  supabaseClient?: any
): Promise<ApiResponse<T>> {
  try {
    const token = await getAuthToken(supabaseClient);

    if (!token) {
      return {
        error: "Not authenticated. Please sign in to use AI features.",
      };
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[AI Client] Making request to: ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    // Handle non-JSON responses
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      return {
        error: `Server returned non-JSON response: ${text.substring(0, 200)}`,
      };
    }

    if (!response.ok) {
      return {
        error: data.error || `Request failed with status ${response.status}`,
        message: data.message,
      };
    }

    return { data };
  } catch (error) {
    console.error(`API request error (${endpoint}):`, error);

    // Provide more specific error messages
    if (error instanceof TypeError && error.message.includes("fetch")) {
      const apiUrl = `${API_BASE_URL}${endpoint}`;
      return {
        error: `Failed to connect to API server. Please check:
- Is the server running? (Expected: ${API_BASE_URL})
- Is VITE_API_URL set correctly in your .env file?
- Check your network connection and CORS settings.`,
      };
    }

    return {
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
}

/**
 * Generate a study question from context
 * 
 * @example
 * ```typescript
 * const result = await generateQuestion({
 *   context: "Mitochondria are organelles that produce ATP...",
 *   subject: "Biology",
 *   difficulty: "medium"
 * });
 * 
 * if (result.data) {
 *   console.log(result.data.question);
 * }
 * ```
 */
export async function generateQuestion(
  params: GenerateQuestionParams,
  supabaseClient?: any
): Promise<ApiResponse<{ question: string; subject: string; difficulty: string; context: string }>> {
  return apiRequest("/api/ai/generate-question", {
    method: "POST",
    body: JSON.stringify(params),
  }, supabaseClient);
}

/**
 * Generate a simple question (uses least advanced model - for Knowledge Organizer "Test Your Knowledge")
 */
export async function generateSimpleQuestion(
  params: GenerateQuestionParams,
  supabaseClient?: any
): Promise<ApiResponse<{ question: string; subject: string; difficulty: string; context: string }>> {
  return apiRequest("/api/ai/generate-simple-question", {
    method: "POST",
    body: JSON.stringify(params),
  }, supabaseClient);
}

/**
 * Evaluate a student's answer against the correct answer
 * 
 * @example
 * ```typescript
 * const result = await evaluateAnswer({
 *   correctAnswer: "Mitochondria produce ATP",
 *   studentAnswer: "Mitochondria make energy",
 *   threshold: 0.7
 * });
 * 
 * if (result.data) {
 *   console.log(result.data.isCorrect); // true/false
 *   console.log(result.data.similarity); // 0.85
 * }
 * ```
 */
export async function evaluateAnswer(
  params: EvaluateAnswerParams,
  supabaseClient?: any
): Promise<ApiResponse<{
  similarity: number;
  isCorrect: boolean;
  threshold: number;
  feedback: string;
}>> {
  return apiRequest("/api/ai/evaluate-answer", {
    method: "POST",
    body: JSON.stringify(params),
  }, supabaseClient);
}

/**
 * Generate multiple flashcards from study notes
 * 
 * @example
 * ```typescript
 * const result = await generateFlashcards({
 *   notes: "Photosynthesis converts light energy to chemical energy...",
 *   subject: "Biology",
 *   count: 5
 * });
 * 
 * if (result.data) {
 *   result.data.flashcards.forEach(card => {
 *     console.log(card.question, card.answer);
 *   });
 * }
 * ```
 */
export async function generateFlashcards(
  params: GenerateFlashcardsParams,
  supabaseClient?: any
): Promise<ApiResponse<{
  flashcards: Array<{
    question: string;
    answer: string;
    subject: string;
  }>;
  count: number;
  requested: number;
}>> {
  return apiRequest("/api/ai/generate-flashcards", {
    method: "POST",
    body: JSON.stringify(params),
  }, supabaseClient);
}

/**
 * Check if AI services are available
 */
export async function checkAiHealth(): Promise<ApiResponse<{
  status: string;
  services: {
    groq: string;
    authentication: string;
  };
  message: string;
}>> {
  return apiRequest("/api/ai/health", {
    method: "GET",
  });
}

/**
 * Generate a knowledge organizer from a prompt
 * 
 * @example
 * ```typescript
 * const result = await generateKnowledgeOrganizer({
 *   prompt: "Cell biology and organelles",
 *   subject: "Biology",
 *   topic: "Cell Structure"
 * });
 * 
 * if (result.data) {
 *   result.data.sections.forEach(section => {
 *     console.log(section.title, section.content);
 *   });
 * }
 * ```
 */
export async function generateKnowledgeOrganizer(
  params: GenerateKnowledgeOrganizerParams,
  supabaseClient?: any
): Promise<ApiResponse<{
  sections: Array<{
    title: string;
    content: string;
    keyPoints: Array<{ text: string; mastered: boolean }>;
    color: string;
    reviewed: boolean;
  }>;
  subject: string | null;
  topic: string | null;
  usageCount: number;
  limit: number;
}>> {
  return apiRequest("/api/ai/generate-knowledge-organizer", {
    method: "POST",
    body: JSON.stringify(params),
  }, supabaseClient);
}

/**
 * Alternative function that uses the Supabase client directly
 * Use this if you have access to the Supabase client instance
 */
export async function generateQuestionWithClient(
  supabase: any,
  params: GenerateQuestionParams
): Promise<ApiResponse<{ question: string; subject: string; difficulty: string; context: string }>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return { error: "Not authenticated" };
    }

    const response = await fetch(`${API_BASE_URL}/api/ai/generate-question`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || `Request failed with status ${response.status}`,
      };
    }

    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// Chat with AI
export const chatWithAI = async (
  params: {
    message: string;
    context?: string;
    history?: Array<{ role: string; content: string }>;
  },
  supabase: any
) => {
  return apiRequest("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify(params),
  }, supabase);
};

