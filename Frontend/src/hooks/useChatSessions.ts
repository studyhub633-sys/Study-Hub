import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

export interface ChatSession {
    id: string;
    user_id: string;
    title: string;
    messages: ChatMessage[];
    context: string | null;
    mode: "chat" | "question" | "evaluate";
    created_at: string;
    updated_at: string;
}

interface UseChatSessionsReturn {
    sessions: ChatSession[];
    currentSession: ChatSession | null;
    loading: boolean;
    error: string | null;
    createSession: (initialMessage?: ChatMessage, context?: string, mode?: "chat" | "question" | "evaluate") => Promise<ChatSession | null>;
    loadSession: (id: string) => Promise<void>;
    updateSession: (id: string, updates: Partial<Pick<ChatSession, "messages" | "title" | "context" | "mode">>) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
    renameSession: (id: string, title: string) => Promise<void>;
    clearCurrentSession: () => void;
    refreshSessions: () => Promise<void>;
}

export function useChatSessions(): UseChatSessionsReturn {
    const { supabase, user } = useAuth();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all sessions for the current user
    const fetchSessions = useCallback(async () => {
        if (!user || !supabase) {
            setSessions([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from("ai_chat_sessions")
                .select("*")
                .eq("user_id", user.id)
                .order("updated_at", { ascending: false });

            if (fetchError) throw fetchError;

            setSessions(data || []);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching chat sessions:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user, supabase]);

    // Initial fetch
    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    // Create a new session
    const createSession = useCallback(
        async (
            initialMessage?: ChatMessage,
            context?: string,
            mode: "chat" | "question" | "evaluate" = "chat"
        ): Promise<ChatSession | null> => {
            if (!user || !supabase) return null;

            try {
                const messages = initialMessage ? [initialMessage] : [];
                // Generate title from first message or use default
                const title = initialMessage
                    ? initialMessage.content.slice(0, 50) + (initialMessage.content.length > 50 ? "..." : "")
                    : "New Chat";

                const { data, error: insertError } = await supabase
                    .from("ai_chat_sessions")
                    .insert({
                        user_id: user.id,
                        title,
                        messages,
                        context: context || null,
                        mode,
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;

                setSessions((prev) => [data, ...prev]);
                setCurrentSession(data);
                return data;
            } catch (err: any) {
                console.error("Error creating session:", err);
                setError(err.message);
                return null;
            }
        },
        [user, supabase]
    );

    // Load a specific session
    const loadSession = useCallback(
        async (id: string) => {
            if (!supabase) return;

            try {
                const { data, error: fetchError } = await supabase
                    .from("ai_chat_sessions")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (fetchError) throw fetchError;

                setCurrentSession(data);
            } catch (err: any) {
                console.error("Error loading session:", err);
                setError(err.message);
            }
        },
        [supabase]
    );

    // Update session (messages, title, context, or mode)
    const updateSession = useCallback(
        async (
            id: string,
            updates: Partial<Pick<ChatSession, "messages" | "title" | "context" | "mode">>
        ) => {
            if (!supabase) return;

            try {
                const { data, error: updateError } = await supabase
                    .from("ai_chat_sessions")
                    .update(updates)
                    .eq("id", id)
                    .select()
                    .single();

                if (updateError) throw updateError;

                // Update local state
                setSessions((prev) =>
                    prev.map((session) => (session.id === id ? data : session))
                );

                if (currentSession?.id === id) {
                    setCurrentSession(data);
                }
            } catch (err: any) {
                console.error("Error updating session:", err);
                setError(err.message);
            }
        },
        [supabase, currentSession]
    );

    // Delete a session
    const deleteSession = useCallback(
        async (id: string) => {
            if (!supabase) return;

            try {
                const { error: deleteError } = await supabase
                    .from("ai_chat_sessions")
                    .delete()
                    .eq("id", id);

                if (deleteError) throw deleteError;

                setSessions((prev) => prev.filter((session) => session.id !== id));

                if (currentSession?.id === id) {
                    setCurrentSession(null);
                }
            } catch (err: any) {
                console.error("Error deleting session:", err);
                setError(err.message);
            }
        },
        [supabase, currentSession]
    );

    // Rename a session
    const renameSession = useCallback(
        async (id: string, title: string) => {
            await updateSession(id, { title });
        },
        [updateSession]
    );

    // Clear current session (for new chat)
    const clearCurrentSession = useCallback(() => {
        setCurrentSession(null);
    }, []);

    // Refresh sessions
    const refreshSessions = useCallback(async () => {
        await fetchSessions();
    }, [fetchSessions]);

    return {
        sessions,
        currentSession,
        loading,
        error,
        createSession,
        loadSession,
        updateSession,
        deleteSession,
        renameSession,
        clearCurrentSession,
        refreshSessions,
    };
}
