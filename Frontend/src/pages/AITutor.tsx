import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { chatWithAI, evaluateAnswer, generateQuestion, generateSimpleQuestion } from "@/lib/ai-client";
import { cn } from "@/lib/utils";
import { ArrowLeft, Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AITutor() {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI tutoring assistant. I can help you with:\n\n• Explaining concepts from your notes\n• Generating practice questions\n• Evaluating your answers\n• Providing study tips\n\nWhat would you like to learn today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"chat" | "question" | "evaluate">("chat");

  // Handle navigation state from Knowledge page
  useEffect(() => {
    if (location.state?.context) {
      setContext(location.state.context);
      if (location.state.mode) {
        setMode(location.state.mode);
      }
      if (location.state.organizerTitle) {
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: `I have context from "${location.state.organizerTitle}". I can help you test your knowledge with practice questions based on this material. Would you like me to generate a question?`,
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [location.state]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setLoading(true);
    console.log("[AITutor] handleSend triggered", { mode, inputLength: userInput.length, contextLength: context.length });

    try {
      let responseContent = "";

      // Detect if user wants to generate a question (even in chat mode)
      const wantsQuestion = mode === "question" ||
        userInput.toLowerCase().includes("generate question") ||
        userInput.toLowerCase().includes("create question") ||
        userInput.toLowerCase().includes("make a question") ||
        userInput.toLowerCase().includes("ask me a question");

      // Use context if available, otherwise use user input as context
      const questionContext = context.trim() || userInput;
      console.log("[AITutor] Decision logic", { wantsQuestion, hasContext: !!context.trim(), hasInputAsContext: !!userInput, finalContext: questionContext.substring(0, 50) + "..." });

      if (wantsQuestion && questionContext) {
        // Use simple question generation if coming from Knowledge Organizer "Test Your Knowledge"
        const isFromKnowledgeOrganizer = location.state?.organizerTitle;
        const generateFunction = isFromKnowledgeOrganizer ? generateSimpleQuestion : generateQuestion;
        console.log("[AITutor] Generating question...", { isFromKnowledgeOrganizer, function: isFromKnowledgeOrganizer ? "generateSimpleQuestion" : "generateQuestion" });

        // Generate a question from context
        const result = await generateFunction(
          {
            context: questionContext,
            subject: "General",
            difficulty: "medium",
          },
          supabase
        );

        if (result.error) {
          throw new Error(result.error);
        }

        responseContent = result.data
          ? `Here's a practice question based on your context:\n\n**Question:** ${result.data.question}\n\nTry to answer it, and I can help evaluate your response!`
          : "I couldn't generate a question. Please try again.";
      } else if (mode === "evaluate" && context.trim()) {
        // Evaluate answer
        const result = await evaluateAnswer(
          {
            correctAnswer: context,
            studentAnswer: userInput,
            threshold: 0.7,
          },
          supabase
        );

        if (result.error) {
          throw new Error(result.error);
        }

        if (result.data) {
          const { isCorrect, similarity, feedback } = result.data;
          responseContent = `**Evaluation:**\n\n${isCorrect ? "✅ Correct!" : "❌ Not quite right"}\n\n**Similarity Score:** ${(similarity * 100).toFixed(1)}%\n\n**Feedback:** ${feedback || "Keep practicing!"}`;
        }
      } else {
        console.log("[AITutor] Defaulting to Chat...");
        // Regular chat mode - use AI chat endpoint
        const result = await chatWithAI(
          {
            message: userInput,
            context: questionContext,
            // Simple history: just the last few messages could be passed if we wanted context awareness
            // For now, we'll rely on the backend to just answer the current prompt
          },
          supabase
        );

        if (result.error) {
          throw new Error(result.error);
        }

        responseContent = (result.data as any)?.reply || "I couldn't generate a response. Please try again.";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response. Please try again.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again or check your connection.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            {location.state?.organizerTitle && (
              <Button
                variant="ghost"
                className="mb-2 p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/knowledge")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Knowledge Organizer
              </Button>
            )}
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI Tutoring Bot</h1>
            </div>
            <p className="text-muted-foreground">
              Get personalized help with your studies
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
          <Button
            variant={mode === "chat" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("chat")}
          >
            Chat
          </Button>
          <Button
            variant={mode === "question" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("question")}
          >
            Generate Question
          </Button>
          <Button
            variant={mode === "evaluate" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("evaluate")}
          >
            Evaluate Answer
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
                <CardDescription>
                  {mode === "chat" && "Ask me anything about your studies"}
                  {mode === "question" && "I'll generate questions from your notes"}
                  {mode === "evaluate" && "I'll evaluate your answers"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
                <ScrollArea className="flex-1 px-6 min-h-0">
                  <div className="space-y-4 py-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg p-4",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          )}
                        >
                          <p className="whitespace-pre-wrap text-sm break-words">{message.content}</p>
                          <p className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {message.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>
                    ))}
                    {loading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="p-6 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={
                        mode === "evaluate"
                          ? "Type your answer here..."
                          : "Type your message..."
                      }
                      disabled={loading}
                    />
                    <Button onClick={handleSend} disabled={loading || !input.trim()}>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Context/Notes Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Context / Notes</CardTitle>
                <CardDescription>
                  Paste your notes here for better assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Paste your notes, study material, or the correct answer here..."
                  className="min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {mode === "question" &&
                    "I'll generate practice questions based on this context"}
                  {mode === "evaluate" &&
                    "This should be the correct answer to compare against"}
                  {mode === "chat" && "Provide context for better responses"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Provide clear context from your notes for better questions</p>
                <p>• Use "Generate Question" mode to create practice questions</p>
                <p>• Use "Evaluate Answer" to check your responses</p>
                <p>• The AI uses semantic similarity to evaluate answers</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}


