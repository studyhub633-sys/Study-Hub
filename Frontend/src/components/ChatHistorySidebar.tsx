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
import type { ChatSession } from "@/hooks/useChatSessions";
import { cn } from "@/lib/utils";
import {
    Check,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    MoreVertical,
    Pencil,
    Plus,
    Trash2,
    X
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
    isOpen?: boolean; // For mobile/tablet control
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
    isOpen = true,
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
    };

    const handleConfirmDelete = async () => {
        if (sessionToDelete) {
            await onDeleteSession(sessionToDelete);
        }
        setDeleteDialogOpen(false);
        setSessionToDelete(null);
    };

    const handleSessionClick = (sessionId: string) => {
        onSelectSession(sessionId);
        // Auto-close on mobile/tablet
        if (onClose && window.innerWidth < 1024) {
            onClose();
        }
    };

    // Filter out hidden sessions before grouping
    const visibleSessions = sessions.filter(s => !hiddenSessionIds.includes(s.id));
    const groupedSessions = groupSessionsByDate(visibleSessions);

    // Collapsed state (thin sidebar with icons only)
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
            {/* Backdrop for mobile/tablet */}
            {isOpen && onClose && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "h-full border-r border-border/50 bg-background flex flex-col transition-transform duration-300",
                    // Mobile & Tablet: Fixed overlay with slide animation
                    "fixed inset-y-0 left-0 z-50 w-[280px] sm:w-[300px] md:w-80",
                    // Desktop: Relative positioning, always visible
                    "lg:relative lg:z-auto lg:translate-x-0",
                    // Slide animation for mobile/tablet
                    !isOpen && "lg:hidden -translate-x-full",
                    isOpen && "translate-x-0"
                )}
            >
                {/* Header */}
                <div className="p-3 border-b border-border/50 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-sm font-medium text-foreground">Chat History</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onClose ? onClose : () => setIsCollapsed(true)}
                    >
                        <X className="h-4 w-4 lg:hidden" />
                        <ChevronLeft className="h-4 w-4 hidden lg:block" />
                    </Button>
                </div>

                {/* New Chat Button */}
                <div className="p-3 flex-shrink-0">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => {
                            onNewChat();
                            // Auto-close on mobile/tablet
                            if (onClose && window.innerWidth < 1024) {
                                onClose();
                            }
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        New Chat
                    </Button>
                </div>

                {/* Sessions List */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="p-2 space-y-4 pb-4">
                        {loading ? (
                            <div className="text-center text-muted-foreground text-sm py-8">
                                Loading...
                            </div>
                        ) : visibleSessions.length === 0 ? (
                            <div className="text-center text-muted-foreground text-sm py-8 px-4">
                                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No chat history yet</p>
                                <p className="text-xs mt-1">Start a new conversation!</p>
                            </div>
                        ) : (
                            groupedSessions.map((group) => (
                                <div key={group.label}>
                                    <h4 className="text-xs font-medium text-muted-foreground px-2 mb-2 sticky top-0 bg-background/95 backdrop-blur-sm py-1">
                                        {group.label}
                                    </h4>
                                    <div className="space-y-1">
                                        {group.sessions.map((session) => (
                                            <div
                                                key={session.id}
                                                className={cn(
                                                    "group rounded-lg transition-colors mx-1",
                                                    currentSessionId === session.id
                                                        ? "bg-primary/10"
                                                        : "hover:bg-muted active:bg-muted"
                                                )}
                                            >
                                                {editingId === session.id ? (
                                                    <div className="flex items-center gap-1 p-2">
                                                        <Input
                                                            value={editTitle}
                                                            onChange={(e) => setEditTitle(e.target.value)}
                                                            className="h-7 text-sm flex-1 min-w-0"
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
                                                    <div className="flex items-center gap-1 p-2">
                                                        <button
                                                            className="flex-1 text-left min-w-0"
                                                            onClick={() => handleSessionClick(session.id)}
                                                        >
                                                            <p className="text-sm font-medium truncate text-foreground pr-1">
                                                                {session.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {formatRelativeTime(session.updated_at)}
                                                            </p>
                                                        </button>

                                                        {/* 3-DOT MENU - Always visible */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <MoreVertical className="h-4 w-4" />
                                                                    <span className="sr-only">More options</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleStartEdit(session);
                                                                    }}
                                                                >
                                                                    <Pencil className="h-4 w-4 mr-2" />
                                                                    Rename
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteClick(session.id);
                                                                    }}
                                                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
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