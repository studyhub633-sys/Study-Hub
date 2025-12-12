/**
 * AI Client for Study Spark Hub
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

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Use Vercel URL in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? window.location.origin 
    : "http://localhost:3001");

/**
 * Get the current Supabase session token
 * Can optionally accept a Supabase client instance
 */
async function getAuthToken(supabaseClient?: any): Promise<string | null> {
  try {
    let supabase = supabaseClient;
    
    // If no client provided, create one
    if (!supabase) {
      const { createClient } = await import("@supabase/supabase-js");
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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || `Request failed with status ${response.status}`,
        message: data.message,
      };
    }

    return { data };
  } catch (error) {
    console.error(`API request error (${endpoint}):`, error);
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
    huggingface: string;
    authentication: string;
  };
  message: string;
}>> {
  return apiRequest("/api/ai/health", {
    method: "GET",
  });
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

