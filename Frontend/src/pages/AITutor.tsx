import { ChatHistorySidebar } from "@/components/ChatHistorySidebar";
import { AppLayout } from "@/components/layout/AppLayout";
import { SimpleMarkdown } from "@/components/SimpleMarkdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { VoiceChat } from "@/components/VoiceChat";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useChatSessions, type ChatMessage } from "@/hooks/useChatSessions";
import { chatWithAI } from "@/lib/ai-client";
import { cn } from "@/lib/utils";
import { Bot, Camera, Headphones, Loader2, Menu, Send, Sparkles, User, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
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
    content: "Hello! I'm your AI assistant. How can I help you today?\n\nI can assist you with:\n\n• Explaining concepts and topics\n• Answering your questions\n• Helping with homework and assignments\n• Providing study tips and guidance\n• Having conversations about any subject\n\nFeel free to ask me anything!",
    timestamp: new Date(),
};

export default function AITutor() {
    const { supabase } = useAuth();
    const { toast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const { t, i18n } = useTranslation();

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
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isVoiceMode, setIsVoiceMode] = useState(false);

    // Image upload state
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [imageFileName, setImageFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Flag to prevent double session creation
    const sessionCreatedRef = useRef(false);

    // Track which session is currently loaded in the UI to prevent overwriting local state on updates
    const [loadedSessionId, setLoadedSessionId] = useState<string | null>(null);

    // UI State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
                setLoadedSessionId(currentSession.id);

                // Update URL
                setSearchParams({ session: currentSession.id }, { replace: true });
            }
        } else {
            // No current session (cleared)
            setLoadedSessionId(null);
        }
    }, [currentSession, loadedSessionId, setSearchParams]);

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

    // Build conversation history for context
    const buildConversationHistory = useCallback((msgs: Message[]) => {
        return msgs.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }, []);

    const processMessage = async (text: string, image?: string): Promise<string> => {
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            timestamp: new Date(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setLoading(true);

        try {
            // Build conversation history for context
            const history = buildConversationHistory(messages);

            const result = await chatWithAI(
                {
                    message: text,
                    history: history,
                    language: i18n.language,
                    image: image
                },
                supabase
            );

            if (result.error) throw new Error(result.error);

            const responseContent = (result.data as any)?.reply || "I couldn't generate a response. Please try again.";

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
                    undefined,
                    "chat"
                );
                if (session) {
                    setLoadedSessionId(session.id);
                    await updateSession(session.id, {
                        messages: finalMessages.map(toChatMessage),
                        title: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
                    });
                }
            } else if (currentSession) {
                await saveMessages(finalMessages);
            }

            return responseContent;
        } catch (error: any) {
            console.error("Error:", error);
            const errorMessage = error.message || "Failed to get response. Please try again.";

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });

            setMessages((prev) => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm sorry, I encountered an error. Please try again.",
                timestamp: new Date(),
            }]);

            return "I'm sorry, I encountered an error.";
        } finally {
            setLoading(false);
        }
    };

    // Image upload handler
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid file",
                description: "Please upload an image file (PNG, JPG, GIF, etc.)",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please upload an image smaller than 5MB",
                variant: "destructive",
            });
            return;
        }

        // Read and display the image
        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadedImage(e.target?.result as string);
            setImageFileName(file.name);
            toast({
                title: "Image uploaded",
                description: "You can add a message or just send the image to analyze.",
            });
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setUploadedImage(null);
        setImageFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSend = async () => {
        if ((!input.trim() && !uploadedImage) || loading) return;

        let text = input;
        const imageToSend = uploadedImage || undefined;

        if (uploadedImage && !text.trim()) {
            text = "Analyzing image..."; // Fallback text for history/display purposes if user sends only image
        }

        setInput("");
        setUploadedImage(null);
        setImageFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        await processMessage(text, imageToSend);
    };

    return (
        <AppLayout fullWidth>
            <div className="flex h-[calc(100vh-3.5rem)] md:h-screen overflow-hidden bg-background pb-20 md:pb-0">
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
                                <SheetContent side="left" className="p-0 w-64 [&>button]:hidden">
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
                                        onClose={() => setIsHistoryOpen(false)}
                                    />
                                </SheetContent>
                            </Sheet>

                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <span className="font-semibold text-lg">{t("nav.aiTutor")}</span>
                            </div>
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
                                                    {t("aiTutor.you")}
                                                </div>
                                            )}
                                            {message.role === "assistant" && (
                                                <div className="invisible group-hover:visible transition-opacity text-[10px] text-muted-foreground mb-1">
                                                    {t("aiTutor.aiName")}
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
                                {loading && !isVoiceMode && (
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
                            {/* Image Preview */}
                            {uploadedImage && (
                                <div className="relative mb-2 rounded-lg border border-primary/30 p-2 bg-primary/5 inline-block">
                                    <img
                                        src={uploadedImage}
                                        alt="Uploaded"
                                        className="max-h-[100px] rounded object-contain"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                                        onClick={handleRemoveImage}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                    <p className="text-[10px] text-muted-foreground mt-1 text-center truncate max-w-[150px]">
                                        {imageFileName}
                                    </p>
                                </div>
                            )}

                            {/* Hidden file input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />

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
                                    placeholder={uploadedImage ? "Ask something about the image..." : t("aiTutor.askAnything")}
                                    disabled={loading}
                                    className="border-0 focus-visible:ring-0 bg-transparent min-h-[44px] py-3 px-2 shadow-none resize-none"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 mb-1 shrink-0 rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Upload Image"
                                >
                                    <Camera className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 mb-1 shrink-0 rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                    onClick={() => setIsVoiceMode(true)}
                                    title="Voice Mode"
                                >
                                    <Headphones className="h-5 w-5" />
                                </Button>
                                <Button
                                    onClick={handleSend}
                                    disabled={loading || (!input.trim() && !uploadedImage)}
                                    size="icon"
                                    className={cn(
                                        "h-9 w-9 mb-1 shrink-0 rounded-lg transition-all",
                                        (input.trim() || uploadedImage) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
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
                                {t("aiTutor.disclaimer")}
                            </p>
                        </div>
                    </div>
                </div>

                <VoiceChat
                    isOpen={isVoiceMode}
                    onClose={() => setIsVoiceMode(false)}
                    onSendMessage={(text) => processMessage(text)}
                    isProcessing={loading}
                />
            </div>
        </AppLayout>
    );
}
