/**
 * Example usage of AI Client functions in React components
 * 
 * This file shows how to integrate AI features into your Scientia.ai app.
 * Copy these patterns into your actual components.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { evaluateAnswer, generateFlashcards, generateQuestion } from "@/lib/ai-client";
import { useState } from "react";

// ============================================
// Example 1: Generate Question Component
// ============================================
export function GenerateQuestionExample() {
  const { supabase } = useAuth();
  const [context, setContext] = useState("");
  const [subject, setSubject] = useState("Biology");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!context.trim()) {
      setError("Please enter some context");
      return;
    }

    setLoading(true);
    setError("");
    setQuestion("");

    const result = await generateQuestion(
      {
        context,
        subject,
        difficulty: "medium",
      },
      supabase // Pass Supabase client for authentication
    );

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setQuestion(result.data.question);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Enter study context..."
        value={context}
        onChange={(e) => setContext(e.target.value)}
      />
      <Input
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <Button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Question"}
      </Button>
      {error && <p className="text-destructive">{error}</p>}
      {question && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="font-semibold">Generated Question:</p>
          <p>{question}</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// Example 2: Answer Evaluation Component
// ============================================
export function EvaluateAnswerExample() {
  const { supabase } = useAuth();
  const [correctAnswer, setCorrectAnswer] = useState("Mitochondria produce ATP through cellular respiration");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [result, setResult] = useState<{
    similarity: number;
    isCorrect: boolean;
    feedback: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async () => {
    if (!studentAnswer.trim()) {
      return;
    }

    setLoading(true);
    setResult(null);

    const response = await evaluateAnswer(
      {
        correctAnswer,
        studentAnswer,
        threshold: 0.7,
      },
      supabase
    );

    if (response.data) {
      setResult(response.data);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Correct Answer:</label>
        <Input value={correctAnswer} readOnly className="mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium">Your Answer:</label>
        <Input
          value={studentAnswer}
          onChange={(e) => setStudentAnswer(e.target.value)}
          placeholder="Type your answer..."
          className="mt-1"
        />
      </div>
      <Button onClick={handleEvaluate} disabled={loading}>
        {loading ? "Evaluating..." : "Check Answer"}
      </Button>
      {result && (
        <div className={`p-4 rounded-lg ${result.isCorrect ? "bg-green-50" : "bg-yellow-50"}`}>
          <p className="font-semibold">
            {result.isCorrect ? "✓ Correct!" : "⚠ Partially Correct"}
          </p>
          <p className="text-sm mt-2">Similarity: {Math.round(result.similarity * 100)}%</p>
          <p className="text-sm mt-1">{result.feedback}</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// Example 3: Generate Flashcards from Notes
// ============================================
export function GenerateFlashcardsExample() {
  const { supabase } = useAuth();
  const [notes, setNotes] = useState("");
  const [subject, setSubject] = useState("Biology");
  const [flashcards, setFlashcards] = useState<Array<{
    question: string;
    answer: string;
    subject: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!notes.trim()) {
      setError("Please enter some notes");
      return;
    }

    setLoading(true);
    setError("");
    setFlashcards([]);

    const result = await generateFlashcards(
      {
        notes,
        subject,
        count: 5,
      },
      supabase
    );

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setFlashcards(result.data.flashcards);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Study Notes:</label>
        <textarea
          className="w-full p-2 border rounded mt-1"
          rows={6}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your study notes here..."
        />
      </div>
      <Input
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <Button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating Flashcards..." : "Generate 5 Flashcards"}
      </Button>
      {error && <p className="text-destructive">{error}</p>}
      {flashcards.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Generated Flashcards:</h3>
          {flashcards.map((card, index) => (
            <div key={index} className="p-4 bg-muted rounded-lg">
              <p className="font-semibold">Q: {card.question}</p>
              <p className="mt-2 text-sm">A: {card.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Example 4: Using in Flashcards Page
// ============================================
export function FlashcardWithAI() {
  const { supabase } = useAuth();
  const [currentCard, setCurrentCard] = useState({
    question: "What is the powerhouse of the cell?",
    answer: "Mitochondria",
  });
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<{
    similarity: number;
    isCorrect: boolean;
  } | null>(null);

  const handleCheckAnswer = async () => {
    const result = await evaluateAnswer(
      {
        correctAnswer: currentCard.answer,
        studentAnswer: userAnswer,
        threshold: 0.7,
      },
      supabase
    );

    if (result.data) {
      setEvaluation(result.data);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-6 bg-card rounded-lg">
        <h2 className="text-xl font-bold mb-4">{currentCard.question}</h2>
        <Input
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type your answer..."
        />
        <Button onClick={handleCheckAnswer} className="mt-4">
          Check Answer
        </Button>
        {evaluation && (
          <div className="mt-4">
            <p>Similarity: {Math.round(evaluation.similarity * 100)}%</p>
            <p>{evaluation.isCorrect ? "Correct!" : "Try again"}</p>
          </div>
        )}
      </div>
    </div>
  );
}







