import { ChatHistorySidebar } from "@/components/ChatHistorySidebar";
import { ContextSidebar } from "@/components/ContextSidebar";
import { AppLayout } from "@/components/layout/AppLayout";
import { SimpleMarkdown } from "@/components/SimpleMarkdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useChatSessions, type ChatMessage } from "@/hooks/useChatSessions";
import { chatWithAI, evaluateAnswer, generateQuestion, generateSimpleQuestion } from "@/lib/ai-client";
import { cn } from "@/lib/utils";
import { BookOpen, Bot, Loader2, Menu, Send, Sparkles, User } from "lucide-react";
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

    // UI State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isContextOpen, setIsContextOpen] = useState(false);

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
            setSearchParams({ session: id });
        },
        [setSearchParams]
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

        try {
            let responseContent = "";

            // Check if there's a pending question waiting for an answer
            if (pendingQuestion) {
                const result = await evaluateAnswer(
                    {
                        correctAnswer: pendingQuestion.context,
                        studentAnswer: userInput,
                        threshold: 0.6,
                    },
                    supabase
                );

                setPendingQuestion(null);

                if (result.error) throw new Error(result.error);

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
                    // ... other triggers
                    userInput.toLowerCase().includes("make a question");

                const questionContext = context.trim() || userInput;

                if (wantsQuestion && questionContext) {
                    const isFromKnowledgeOrganizer = location.state?.organizerTitle;
                    const generateFunction = isFromKnowledgeOrganizer ? generateSimpleQuestion : generateQuestion;

                    const result = await generateFunction(
                        {
                            context: questionContext,
                            subject: "General",
                            difficulty: "medium",
                        },
                        supabase
                    );

                    if (result.error) throw new Error(result.error);

                    if (result.data?.question) {
                        setPendingQuestion({
                            question: result.data.question,
                            context: questionContext,
                        });
                        responseContent = `Here's a practice question based on your context:\n\n**Question:**\n\n${result.data.question}\n\n---\n\nType your answer below, and I'll evaluate it!`;
                    } else {
                        responseContent = "I couldn't generate a question. Please try again.";
                    }
                } else if (mode === "evaluate" && context.trim()) {
                    const result = await evaluateAnswer(
                        {
                            correctAnswer: context,
                            studentAnswer: userInput,
                            threshold: 0.7,
                        },
                        supabase
                    );

                    if (result.error) throw new Error(result.error);

                    if (result.data) {
                        const { isCorrect, similarity, feedback } = result.data;
                        responseContent = `**Evaluation:**\n\n${isCorrect ? "✅ Correct!" : "❌ Not quite right"}\n\n**Similarity Score:** ${(similarity * 100).toFixed(1)}%\n\n**Feedback:** ${feedback || "Keep practicing!"}`;
                    }
                } else {
                    const result = await chatWithAI(
                        {
                            message: userInput,
                            context: questionContext,
                        },
                        supabase
                    );

                    if (result.error) throw new Error(result.error);
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
                    setLoadedSessionId(session.id);
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
            setMessages((prev) => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm sorry, I encountered an error. Please try again.",
                timestamp: new Date(),
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout fullWidth>
            <div className="flex h-[calc(100vh-3.5rem)] md:h-screen overflow-hidden bg-background">
                {/* Desktop History Sidebar */}
                <div className="hidden lg:flex shrink-0">
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

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col min-w-0 h-full relative">
                    {/* Header */}
                    <div className="h-14 border-b border-border/40 flex items-center justify-between px-4 bg-background/80 backdrop-blur-sm z-10 shrink-0">
                        <div className="flex items-center gap-2">
                            {/* Mobile History Toggle */}
                            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="lg:hidden">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-80">
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

                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <span className="font-semibold text-lg">AI Tutor</span>
                                {aiUsage && (
                                    <span className="text-xs text-muted-foreground hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full bg-muted">
                                        {aiUsage.limit - aiUsage.count} left
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Mode Selector - Compact */}
                            <div className="flex bg-muted/50 rounded-lg p-0.5 mr-2">
                                <button
                                    onClick={() => setMode("chat")}
                                    className={cn(
                                        "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                        mode === "chat" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Chat
                                </button>
                                <button
                                    onClick={() => setMode("question")}
                                    className={cn(
                                        "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                        mode === "question" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Quiz
                                </button>
                            </div>

                            {/* Mobile/Tablet Context Toggle */}
                            <Sheet open={isContextOpen} onOpenChange={setIsContextOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground hover:text-foreground">
                                        <BookOpen className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-full sm:w-[400px]">
                                    <ContextSidebar context={context} setContext={setContext} mode={mode} />
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-hidden relative flex flex-col">
                        <ScrollArea className="flex-1">
                            <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            "flex gap-4 group",
                                            message.role === "user" ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {message.role === "assistant" && (
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                                <Bot className="h-4 w-4 text-primary" />
                                            </div>
                                        )}

                                        <div className={cn(
                                            "max-w-[85%] sm:max-w-[75%]",
                                            message.role === "user" ? "ml-auto" : "mr-auto"
                                        )}>
                                            {message.role === "user" && (
                                                <div className="invisible group-hover:visible transition-opacity text-[10px] text-muted-foreground mb-1 text-right">
                                                    You
                                                </div>
                                            )}
                                            {message.role === "assistant" && (
                                                <div className="invisible group-hover:visible transition-opacity text-[10px] text-muted-foreground mb-1">
                                                    AI Tutor
                                                </div>
                                            )}

                                            <div
                                                className={cn(
                                                    "rounded-2xl px-5 py-3 text-sm shadow-sm",
                                                    message.role === "user"
                                                        ? "bg-primary text-primary-foreground rounded-br-sm"
                                                        : "bg-muted/50 text-foreground border border-border/40 rounded-bl-sm"
                                                )}
                                            >
                                                {message.role === "assistant" ? (
                                                    <SimpleMarkdown content={message.content} />
                                                ) : (
                                                    <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                                                )}
                                            </div>
                                            <div className="text-[10px] opacity-40 mt-1 px-1">
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        {message.role === "user" && (
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                                <User className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="bg-muted/50 rounded-2xl rounded-bl-sm p-4 w-32 flex items-center justify-center">
                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} className="h-4" />
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40">
                        <div className="w-full max-w-3xl mx-auto">
                            {/* Pending Question Indicator */}
                            {pendingQuestion && (
                                <div className="mb-2 bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm flex items-start gap-2 animate-in slide-in-from-bottom-2">
                                    <span className="text-xl">📝</span>
                                    <div>
                                        <span className="font-medium text-primary text-xs uppercase tracking-wide">Pending Question</span>
                                        <p className="text-sm text-foreground/90 line-clamp-1">{pendingQuestion.question}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="ml-auto h-6 w-6 p-0" onClick={() => setPendingQuestion(null)}>×</Button>
                                </div>
                            )}

                            <div className="relative flex items-end gap-2 bg-muted/30 p-2 rounded-xl border border-border/40 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all shadow-sm">
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
                                                ? "Paste an answer to evaluate..."
                                                : "Ask me anything..."
                                    }
                                    disabled={loading}
                                    className="border-0 focus-visible:ring-0 bg-transparent min-h-[44px] py-3 px-2 shadow-none resize-none"
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    size="icon"
                                    className={cn(
                                        "h-9 w-9 mb-1 shrink-0 rounded-lg transition-all",
                                        input.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-[10px] text-center text-muted-foreground mt-2">
                                AI can make mistakes. Please verify important information.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Desktop Right Sidebar (Context) */}
                <div className="hidden lg:flex lg:w-80 border-l border-border/40 bg-background/50 shrink-0 flex-col p-4 overflow-y-auto">
                    <ContextSidebar context={context} setContext={setContext} mode={mode} />
                </div>
            </div>
        </AppLayout>
    );
}
