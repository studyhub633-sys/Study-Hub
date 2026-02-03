import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatSession } from "@/hooks/useChatSessions";
import { cn } from "@/lib/utils";
import {
    Check,
    ChevronLeft,
    ChevronRight,
    EyeOff,
    MessageSquare,
    MoreVertical,
    Pencil,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ChatHistorySidebarProps {
    sessions: ChatSession[];
    currentSessionId: string | null;
    onSelectSession: (id: string) => void;
    onNewChat: () => void;
    onDeleteSession: (id: string) => Promise<void>;
    onRenameSession: (id: string, title: string) => Promise<void>;
    loading?: boolean;
    onClose?: () => void;
}

export function ChatHistorySidebar({
    sessions,
    currentSessionId,
    onSelectSession,
    onNewChat,
    onDeleteSession,
    onRenameSession,
    loading,
    onClose,
}: ChatHistorySidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

    // Persistent hidden sessions state
    const [hiddenSessionIds, setHiddenSessionIds] = useState<string[]>(() => {
        try {
            const stored = localStorage.getItem("hidden_chat_sessions");
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    });

    // Save hidden sessions to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("hidden_chat_sessions", JSON.stringify(hiddenSessionIds));
    }, [hiddenSessionIds]);

    // Format relative time
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    // Group sessions by date
    const groupSessionsByDate = (sessions: ChatSession[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const groups: { label: string; sessions: ChatSession[] }[] = [
            { label: "Today", sessions: [] },
            { label: "Yesterday", sessions: [] },
            { label: "Previous 7 Days", sessions: [] },
            { label: "Older", sessions: [] },
        ];

        sessions.forEach((session) => {
            const sessionDate = new Date(session.updated_at);
            sessionDate.setHours(0, 0, 0, 0);

            if (sessionDate.getTime() >= today.getTime()) {
                groups[0].sessions.push(session);
            } else if (sessionDate.getTime() >= yesterday.getTime()) {
                groups[1].sessions.push(session);
            } else if (sessionDate.getTime() >= weekAgo.getTime()) {
                groups[2].sessions.push(session);
            } else {
                groups[3].sessions.push(session);
            }
        });

        return groups.filter((group) => group.sessions.length > 0);
    };

    const handleStartEdit = (session: ChatSession) => {
        setEditingId(session.id);
        setEditTitle(session.title);
    };

    const handleSaveEdit = async () => {
        if (editingId && editTitle.trim()) {
            await onRenameSession(editingId, editTitle.trim());
        }
        setEditingId(null);
        setEditTitle("");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
    };

    const handleDeleteClick = (id: string) => {
        setSessionToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleHideClick = (id: string) => {
        setHiddenSessionIds(prev => [...prev, id]);
        // If the current session is hidden, user probably wants to stay on it or go to new chat?
        // Usually stick to it or let onSelectSession handle it.
        // But if it disappears from list, that's fine.
    };

    const handleConfirmDelete = async () => {
        if (sessionToDelete) {
            await onDeleteSession(sessionToDelete);
        }
        setDeleteDialogOpen(false);
        setSessionToDelete(null);
    };

    // Filter out hidden sessions before grouping
    const visibleSessions = sessions.filter(s => !hiddenSessionIds.includes(s.id));
    const groupedSessions = groupSessionsByDate(visibleSessions);

    if (isCollapsed) {
        return (
            <div className="w-12 h-full border-r border-border/50 bg-muted/30 flex flex-col items-center py-4 gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsCollapsed(false)}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onNewChat}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="w-64 h-full border-r border-border/50 bg-muted/30 flex flex-col">
                {/* Header */}
                <div className="p-3 border-b border-border/50 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground">Chat History</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onClose ? onClose : () => setIsCollapsed(true)}
                    >
                        {onClose ? (
                            <X className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* New Chat Button */}
                <div className="p-3">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={onNewChat}
                    >
                        <Plus className="h-4 w-4" />
                        New Chat
                    </Button>
                </div>

                {/* Sessions List */}
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-4">
                        {loading ? (
                            <div className="text-center text-muted-foreground text-sm py-8">
                                Loading...
                            </div>
                        ) : visibleSessions.length === 0 ? (
                            <div className="text-center text-muted-foreground text-sm py-8">
                                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No chat history yet</p>
                                <p className="text-xs mt-1">Start a new conversation!</p>
                            </div>
                        ) : (
                            groupedSessions.map((group) => (
                                <div key={group.label}>
                                    <h4 className="text-xs font-medium text-muted-foreground px-2 mb-2">
                                        {group.label}
                                    </h4>
                                    <div className="space-y-1">
                                        {group.sessions.map((session) => (
                                            <div
                                                key={session.id}
                                                className={cn(
                                                    "group relative rounded-lg transition-colors",
                                                    currentSessionId === session.id
                                                        ? "bg-primary/10"
                                                        : "hover:bg-muted"
                                                )}
                                            >
                                                {editingId === session.id ? (
                                                    <div className="flex items-center gap-1 p-2">
                                                        <Input
                                                            value={editTitle}
                                                            onChange={(e) => setEditTitle(e.target.value)}
                                                            className="h-7 text-sm"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") handleSaveEdit();
                                                                if (e.key === "Escape") handleCancelEdit();
                                                            }}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 shrink-0"
                                                            onClick={handleSaveEdit}
                                                        >
                                                            <Check className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 shrink-0"
                                                            onClick={handleCancelEdit}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="w-full text-left p-2 pr-8"
                                                        onClick={() => onSelectSession(session.id)}
                                                    >
                                                        <p className="text-sm font-medium truncate text-foreground">
                                                            {session.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatRelativeTime(session.updated_at)}
                                                        </p>
                                                    </button>
                                                )}

                                                {editingId !== session.id && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-muted/50 hover:bg-muted text-foreground hover:text-foreground border border-border/50"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => handleStartEdit(session)}
                                                            >
                                                                <Pencil className="h-4 w-4 mr-2" />
                                                                Rename
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleHideClick(session.id)}
                                                            >
                                                                <EyeOff className="h-4 w-4 mr-2" />
                                                                Hide
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => handleDeleteClick(session.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Do you want to permanently delete this chat? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
