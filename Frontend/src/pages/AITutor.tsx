import { ChatHistorySidebar } from "@/components/ChatHistorySidebar";
import { AppLayout } from "@/components/layout/AppLayout";
import { SimpleMarkdown } from "@/components/SimpleMarkdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useChatSessions, type ChatMessage } from "@/hooks/useChatSessions";
import { chatWithAI, evaluateAnswer, generateQuestion, generateSimpleQuestion } from "@/lib/ai-client";
import { cn } from "@/lib/utils";
import { ArrowLeft, Bot, Brain, History, Loader2, Send, Sparkles, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface PendingQuestion {
    question: string;
    context: string;
}

// Convert internal Message to ChatMessage for storage
const toChatMessage = (msg: Message): ChatMessage => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp.toISOString(),
});

// Convert stored ChatMessage to internal Message
const toMessage = (msg: ChatMessage): Message => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp),
});

const defaultWelcomeMessage: Message = {
    id: "1",
    role: "assistant",
    content: "Hello! I'm your AI tutoring assistant. I can help you with:\n\n• Explaining concepts from your notes\n• Generating practice questions\n• Evaluating your answers\n• Providing study tips\n\nWhat would you like to learn today?",
    timestamp: new Date(),
};

export default function AITutor() {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Chat sessions hook
    const {
        sessions,
        currentSession,
        loading: sessionsLoading,
        createSession,
        loadSession,
        updateSession,
        deleteSession,
        renameSession,
        clearCurrentSession,
    } = useChatSessions();

    const [messages, setMessages] = useState<Message[]>([defaultWelcomeMessage]);
    const [input, setInput] = useState("");
    const [context, setContext] = useState("");
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"chat" | "question" | "evaluate">("chat");
    const [aiUsage, setAiUsage] = useState<{ count: number; limit: number } | null>(null);

    // Track the pending question waiting for an answer
    const [pendingQuestion, setPendingQuestion] = useState<PendingQuestion | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Flag to prevent double session creation
    const sessionCreatedRef = useRef(false);

    // Track which session is currently loaded in the UI to prevent overwriting local state on updates
    const [loadedSessionId, setLoadedSessionId] = useState<string | null>(null);

    // Load session from URL parameter
    useEffect(() => {
        const sessionId = searchParams.get("session");
        if (sessionId && (!currentSession || currentSession.id !== sessionId)) {
            loadSession(sessionId);
        }
    }, [searchParams, currentSession, loadSession]);

    // Sync messages only when switching to a different session
    useEffect(() => {
        if (currentSession) {
            // Only update state if we're switching to a new session
            if (currentSession.id !== loadedSessionId) {
                const loadedMessages = currentSession.messages.map(toMessage);
                setMessages(loadedMessages.length > 0 ? loadedMessages : [defaultWelcomeMessage]);
                setContext(currentSession.context || "");
                setMode(currentSession.mode || "chat");
                setLoadedSessionId(currentSession.id);

                // Update URL
                setSearchParams({ session: currentSession.id }, { replace: true });
            }
        } else {
            // No current session (cleared)
            setLoadedSessionId(null);
        }
    }, [currentSession, loadedSessionId, setSearchParams]);

    // Handle navigation state from Knowledge page
    useEffect(() => {
        if (location.state?.context && !currentSession) {
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
    }, [location.state, currentSession]);

    // Fetch AI usage
    const fetchAiUsage = async () => {
        if (!user || !supabase) return;
        try {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { count } = await supabase
                .from("ai_usage_tracking")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)
                .gt("created_at", oneDayAgo);

            const { data: profile } = await supabase
                .from("profiles")
                .select("is_premium, email")
                .eq("id", user.id)
                .single();

            const TESTER_EMAILS = ['admin@studyhub.com', 'tester@studyhub.com', 'andre@studyhub.com'];
            const isPremium = profile?.is_premium || TESTER_EMAILS.includes(profile?.email || '');
            setAiUsage({ count: count || 0, limit: isPremium ? 500 : 10 });
        } catch (error) {
            console.error("Error fetching AI usage:", error);
        }
    };

    useEffect(() => {
        fetchAiUsage();
    }, [user, supabase]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Save messages to session
    const saveMessages = useCallback(
        async (newMessages: Message[]) => {
            if (!currentSession) return;
            await updateSession(currentSession.id, {
                messages: newMessages.map(toChatMessage),
            });
        },
        [currentSession, updateSession]
    );

    // Handle starting a new chat
    const handleNewChat = useCallback(() => {
        clearCurrentSession();
        setMessages([defaultWelcomeMessage]);
        setContext("");
        setMode("chat");
        setPendingQuestion(null);
        sessionCreatedRef.current = false;
        setSearchParams({}, { replace: true });
    }, [clearCurrentSession, setSearchParams]);

    // Handle selecting a session
    const handleSelectSession = useCallback(
        (id: string) => {
            loadSession(id);
        },
        [loadSession]
    );

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        const userInput = input;
        setInput("");
        setLoading(true);
        console.log("[AITutor] handleSend triggered", { mode, inputLength: userInput.length, contextLength: context.length, hasPendingQuestion: !!pendingQuestion });

        try {
            let responseContent = "";

            // Check if there's a pending question waiting for an answer
            if (pendingQuestion) {
                console.log("[AITutor] Evaluating answer for pending question...");

                // Evaluate the user's answer against the pending question's context
                const result = await evaluateAnswer(
                    {
                        correctAnswer: pendingQuestion.context,
                        studentAnswer: userInput,
                        threshold: 0.6,
                    },
                    supabase
                );

                // Clear pending question
                setPendingQuestion(null);

                if (result.error) {
                    throw new Error(result.error);
                }

                if (result.data) {
                    const { isCorrect, similarity, feedback } = result.data;
                    responseContent = `**Evaluation:**\n\n${isCorrect ? "✅ Correct!" : "❌ Not quite right"}\n\n**Similarity Score:** ${(similarity * 100).toFixed(1)}%\n\n**Feedback:** ${feedback || "Keep practicing!"}\n\n---\n\nWould you like another question? Just say "yes" or "next question"!`;
                } else {
                    responseContent = "I couldn't evaluate your answer. Would you like to try another question?";
                }
            }
            // Detect if user wants to generate a question
            else {
                const wantsQuestion = mode === "question" ||
                    userInput.toLowerCase().includes("generate question") ||
                    userInput.toLowerCase().includes("create question") ||
                    userInput.toLowerCase().includes("make a question") ||
                    userInput.toLowerCase().includes("ask me a question") ||
                    userInput.toLowerCase().includes("yes") ||
                    userInput.toLowerCase().includes("next question") ||
                    userInput.toLowerCase().includes("another question");

                const questionContext = context.trim() || userInput;
                console.log("[AITutor] Decision logic", { wantsQuestion, hasContext: !!context.trim(), hasInputAsContext: !!userInput });

                if (wantsQuestion && questionContext) {
                    const isFromKnowledgeOrganizer = location.state?.organizerTitle;
                    const generateFunction = isFromKnowledgeOrganizer ? generateSimpleQuestion : generateQuestion;
                    console.log("[AITutor] Generating question...", { isFromKnowledgeOrganizer });

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

                    if (result.data?.question) {
                        // Store the pending question so we know to evaluate the next response
                        setPendingQuestion({
                            question: result.data.question,
                            context: questionContext,
                        });

                        responseContent = `Here's a practice question based on your context:\n\n**Question:**\n\n${result.data.question}\n\n---\n\nType your answer below, and I'll evaluate it!`;
                    } else {
                        responseContent = "I couldn't generate a question. Please try again.";
                    }
                } else if (mode === "evaluate" && context.trim()) {
                    // Manual evaluate mode
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
                    // Regular chat mode
                    console.log("[AITutor] Defaulting to Chat...");
                    const result = await chatWithAI(
                        {
                            message: userInput,
                            context: questionContext,
                        },
                        supabase
                    );

                    if (result.error) {
                        throw new Error(result.error);
                    }

                    responseContent = (result.data as any)?.reply || "I couldn't generate a response. Please try again.";
                }
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: responseContent,
                timestamp: new Date(),
            };

            const finalMessages = [...newMessages, assistantMessage];
            setMessages(finalMessages);

            // Create or update session
            if (!currentSession && !sessionCreatedRef.current) {
                sessionCreatedRef.current = true;
                const session = await createSession(
                    toChatMessage(userMessage),
                    context || undefined,
                    mode
                );
                if (session) {
                    // Manually mark this session as loaded so the sync effect doesn't overwrite our local state
                    setLoadedSessionId(session.id);

                    // Update with assistant response
                    await updateSession(session.id, {
                        messages: finalMessages.map(toChatMessage),
                        title: userInput.slice(0, 50) + (userInput.length > 50 ? "..." : ""),
                    });
                }
            } else if (currentSession) {
                await saveMessages(finalMessages);
            }
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

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    return (
        <AppLayout>
            <div className="flex h-[calc(100vh-8rem)] gap-4">
                {/* Chat History Sidebar - Desktop */}
                <div className="hidden md:flex">
                    <ChatHistorySidebar
                        sessions={sessions}
                        currentSessionId={currentSession?.id || null}
                        onSelectSession={handleSelectSession}
                        onNewChat={handleNewChat}
                        onDeleteSession={deleteSession}
                        onRenameSession={renameSession}
                        loading={sessionsLoading}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 space-y-4">
                    {/* Header */}
                    <div className="flex flex-col gap-4 animate-fade-in">
                        <div className="flex items-start justify-between">
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

                            {/* Mobile History Toggle */}
                            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon" className="md:hidden shrink-0">
                                        <History className="h-5 w-5" />
                                        <span className="sr-only">Chat History</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-72">
                                    <ChatHistorySidebar
                                        sessions={sessions}
                                        currentSessionId={currentSession?.id || null}
                                        onSelectSession={(id) => {
                                            handleSelectSession(id);
                                            setIsHistoryOpen(false);
                                        }}
                                        onNewChat={() => {
                                            handleNewChat();
                                            setIsHistoryOpen(false);
                                        }}
                                        onDeleteSession={deleteSession}
                                        onRenameSession={renameSession}
                                        loading={sessionsLoading}
                                    />
                                </SheetContent>
                            </Sheet>
                        </div>

                        {aiUsage && (
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary w-fit">
                                <Brain className="h-3 w-3 mr-1" />
                                {aiUsage.limit - aiUsage.count} AI generations remaining today
                            </div>
                        )}
                    </div>

                    {/* Mode Selector */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 animate-slide-up no-scrollbar" style={{ animationDelay: "0.1s", opacity: 0 }}>
                        <Button
                            variant={mode === "chat" ? "default" : "outline"}
                            size="sm"
                            className="whitespace-nowrap"
                            onClick={() => { setMode("chat"); setPendingQuestion(null); }}
                        >
                            Chat
                        </Button>
                        <Button
                            variant={mode === "question" ? "default" : "outline"}
                            size="sm"
                            className="whitespace-nowrap"
                            onClick={() => setMode("question")}
                        >
                            Generate Question
                        </Button>
                        <Button
                            variant={mode === "evaluate" ? "default" : "outline"}
                            size="sm"
                            className="whitespace-nowrap"
                            onClick={() => { setMode("evaluate"); setPendingQuestion(null); }}
                        >
                            Evaluate Answer
                        </Button>
                    </div>

                    {/* Pending Question Indicator */}
                    {pendingQuestion && (
                        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-sm">
                            <span className="font-medium text-primary">📝 Waiting for your answer:</span>
                            <p className="mt-1 text-foreground">{pendingQuestion.question}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                        {/* Chat Area */}
                        <div className="lg:col-span-2 flex flex-col min-h-0 order-2 lg:order-1">
                            <Card className="flex-1 flex flex-col min-h-0 shadow-sm border-border/60">
                                <CardHeader className="shrink-0 p-4 pb-2">
                                    <CardTitle className="text-lg">Conversation</CardTitle>
                                    <CardDescription>
                                        {mode === "chat" && "Ask me anything about your studies"}
                                        {mode === "question" && "I'll generate questions from your notes"}
                                        {mode === "evaluate" && "I'll evaluate your answers"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
                                    <ScrollArea className="flex-1 px-4 md:px-6 min-h-0">
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
                                                            "max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                                                            message.role === "user"
                                                                ? "bg-primary text-primary-foreground rounded-br-none"
                                                                : "bg-muted text-foreground rounded-bl-none"
                                                        )}
                                                    >
                                                        {message.role === "assistant" ? (
                                                            <SimpleMarkdown content={message.content} className="text-sm" />
                                                        ) : (
                                                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                                        )}
                                                        <p className="text-[10px] opacity-70 mt-1 text-right">
                                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                                    <div className="bg-muted rounded-2xl rounded-bl-none p-4">
                                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={scrollRef} />
                                        </div>
                                    </ScrollArea>
                                    <div className="p-3 md:p-6 border-t border-border shrink-0 bg-background/50 backdrop-blur-sm">
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
                                                    pendingQuestion
                                                        ? "Type your answer here..."
                                                        : mode === "evaluate"
                                                            ? "Type your answer here..."
                                                            : "Type your message..."
                                                }
                                                disabled={loading}
                                                className="rounded-full pl-4"
                                            />
                                            <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon" className="rounded-full shrink-0">
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

                        {/* Context/Notes Sidebar - Desktop & Mobile */}
                        <div className="space-y-4 order-1 lg:order-2">
                            <Card className="border-border/60 shadow-sm">
                                <CardHeader className="py-3 px-4">
                                    <CardTitle className="text-base">Context / Notes</CardTitle>
                                    <CardDescription className="text-xs">
                                        Paste your notes here for better assistance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                    <Textarea
                                        value={context}
                                        onChange={(e) => setContext(e.target.value)}
                                        placeholder="Paste your notes, study material, or the correct answer here..."
                                        className="min-h-[100px] lg:min-h-[200px] resize-y"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-2">
                                        {mode === "question" &&
                                            "I'll generate practice questions based on this context"}
                                        {mode === "evaluate" &&
                                            "This should be the correct answer to compare against"}
                                        {mode === "chat" && "Provide context for better responses"}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="hidden lg:block border-border/60 shadow-sm">
                                <CardHeader className="py-3 px-4">
                                    <CardTitle className="text-base">Tips</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-xs text-muted-foreground p-3 pt-0">
                                    <p>• Provide clear context from your notes for better questions</p>
                                    <p>• Use "Generate Question" mode to create practice questions</p>
                                    <p>• After a question is generated, just type your answer</p>
                                    <p>• The AI will automatically evaluate your response</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
