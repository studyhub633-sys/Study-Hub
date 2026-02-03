import { AppLayout } from "@/components/layout/AppLayout";
import { SimpleMarkdown } from "@/components/SimpleMarkdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { hasPremium } from "@/lib/premium";
import { cn } from "@/lib/utils";
import {
    BookOpen,
    Bot,
    ChevronLeft,
    Crown,
    Download,
    FileText,
    Filter,
    Loader2,
    Lock,
    Search,
    Sparkles,
    Star
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface PremiumNote {
    id: string;
    title: string;
    content: string;
    subject: string;
    topic: string;
    grade_level: string;
    tags: string[];
    created_at: string;
}

export default function Grade9Notes() {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [notes, setNotes] = useState<PremiumNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false);
    const [checkingPremium, setCheckingPremium] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("All Subjects");
    const [selectedNote, setSelectedNote] = useState<PremiumNote | null>(null);

    const subjects = Array.from(new Set(notes.map((n) => n.subject).filter(Boolean)));

    useEffect(() => {
        if (user) {
            checkPremiumStatus();
        } else {
            setCheckingPremium(false);
        }
    }, [user]);

    useEffect(() => {
        if (isPremium) {
            fetchPremiumNotes();
        }
    }, [isPremium]);

    const checkPremiumStatus = async () => {
        if (!user || !supabase) return;
        try {
            const premium = await hasPremium(supabase);
            setIsPremium(premium);
        } catch (error) {
            console.error("Error checking premium status:", error);
        } finally {
            setCheckingPremium(false);
        }
    };

    const fetchPremiumNotes = async () => {
        if (!supabase) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("global_premium_notes")
                .select("*")
                .eq("grade_level", "9")
                .order("created_at", { ascending: false });

            if (error) throw error;

            setNotes(data || []);

            // Select the first note if available
            if (data && data.length > 0 && !selectedNote) {
                setSelectedNote(data[0]);
            }
        } catch (error: any) {
            console.error("Error fetching premium notes:", error);
            toast({
                title: "Error",
                description: "Failed to load premium notes. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExportNote = (note: PremiumNote) => {
        const element = document.createElement("a");
        const file = new Blob([note.content], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = `${note.title.replace(/\s+/g, '_')}.md`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        toast({
            title: "Exported",
            description: "Note downloaded as Markdown file",
        });
    };

    const filteredNotes = notes.filter((note) => {
        const matchesSubject =
            selectedSubject === "All Subjects" || note.subject === selectedSubject;
        const matchesSearch =
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.topic?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSubject && matchesSearch;
    });

    // Group notes by subject
    const groupedNotes = filteredNotes.reduce((acc, note) => {
        const subject = note.subject || "General";
        if (!acc[subject]) {
            acc[subject] = [];
        }
        acc[subject].push(note);
        return acc;
    }, {} as Record<string, PremiumNote[]>);

    const getSubjectColor = (subject: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            "Mathematics": { bg: "bg-blue-500/10", text: "text-blue-500" },
            "English Literature": { bg: "bg-yellow-500/10", text: "text-yellow-500" },
            "Biology": { bg: "bg-green-500/10", text: "text-green-500" },
            "Chemistry": { bg: "bg-purple-500/10", text: "text-purple-500" },
            "Physics": { bg: "bg-red-500/10", text: "text-red-500" },
            "History": { bg: "bg-amber-500/10", text: "text-amber-500" },
            "Geography": { bg: "bg-cyan-500/10", text: "text-cyan-500" },
        };
        return colors[subject] || { bg: "bg-gray-500/10", text: "text-gray-500" };
    };

    // Loading state
    if (checkingPremium) {
        return (
            <AppLayout>
                <div className="max-w-6xl mx-auto flex items-center justify-center h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AppLayout>
        );
    }

    // Non-premium user view
    if (!isPremium) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto animate-fade-in">
                    <div className="glass-card p-12 text-center">
                        <div className="relative inline-block mb-6">
                            <FileText className="h-20 w-20 text-muted-foreground/50" />
                            <div className="absolute -top-2 -right-2 p-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600">
                                <Lock className="h-5 w-5 text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-foreground mb-4">
                            Grade 9 Premium Notes
                        </h1>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            Unlock exclusive Grade 9 study notes and materials designed to help you achieve top marks.
                            These premium notes are curated by expert educators.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
                                onClick={() => navigate("/premium-dashboard")}
                            >
                                <Crown className="h-5 w-5 mr-2" />
                                Upgrade to Premium
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => navigate(-1)}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Go Back
                            </Button>
                        </div>

                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 rounded-xl bg-muted/50">
                                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-foreground mb-1">Top Grade Content</h3>
                                <p className="text-sm text-muted-foreground">Notes designed for Grade 9 achievement</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/50">
                                <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-foreground mb-1">All Subjects</h3>
                                <p className="text-sm text-muted-foreground">Comprehensive coverage across subjects</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/50">
                                <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-foreground mb-1">Expert Curated</h3>
                                <p className="text-sm text-muted-foreground">Created by experienced educators</p>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Premium user - Loading notes
    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-6xl mx-auto flex items-center justify-center h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto animate-fade-in pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20">
                            <FileText className="w-8 h-8 text-yellow-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold">Grade 9 Premium Notes</h1>
                                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Premium
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">
                                Exclusive study materials for top marks
                            </p>
                        </div>
                    </div>
                    <Link to="/knowledge">
                        <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white">
                            <Bot className="w-4 h-4 mr-2" />
                            AI Knowledge Organizer
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All Subjects">All Subjects</SelectItem>
                            {subjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                    {subject}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Empty state */}
                {notes.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            No notes available yet
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Grade 9 premium notes are coming soon. Check back later for exclusive content!
                        </p>
                        <Button variant="outline" onClick={() => navigate("/notes")}>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Go to My Notes
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Notes List */}
                        <div className="lg:col-span-1 space-y-4">
                            {Object.entries(groupedNotes).map(([subject, subjectNotes]) => (
                                <Card key={subject} className="overflow-hidden">
                                    <div className={cn("p-3 border-b", getSubjectColor(subject).bg)}>
                                        <div className="flex items-center gap-2">
                                            <BookOpen className={cn("h-4 w-4", getSubjectColor(subject).text)} />
                                            <h3 className="font-semibold text-sm">{subject}</h3>
                                            <Badge variant="secondary" className="ml-auto text-xs">
                                                {subjectNotes.length}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-2">
                                        {subjectNotes.map((note) => (
                                            <button
                                                key={note.id}
                                                onClick={() => setSelectedNote(note)}
                                                className={cn(
                                                    "w-full text-left p-3 rounded-lg transition-all group",
                                                    selectedNote?.id === note.id
                                                        ? "bg-primary/10 border border-primary/30"
                                                        : "hover:bg-muted/50"
                                                )}
                                            >
                                                <p className={cn(
                                                    "font-medium text-sm truncate",
                                                    selectedNote?.id === note.id ? "text-primary" : "text-foreground"
                                                )}>
                                                    {note.title}
                                                </p>
                                                {note.topic && (
                                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                                        {note.topic}
                                                    </p>
                                                )}
                                            </button>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Note Content */}
                        <div className="lg:col-span-2">
                            {selectedNote ? (
                                <Card className="sticky top-4">
                                    <CardContent className="p-6 md:p-8">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {selectedNote.subject && (
                                                        <span className={cn(
                                                            "text-xs font-medium px-2 py-1 rounded-full",
                                                            getSubjectColor(selectedNote.subject).bg,
                                                            getSubjectColor(selectedNote.subject).text
                                                        )}>
                                                            {selectedNote.subject}
                                                        </span>
                                                    )}
                                                    {selectedNote.topic && (
                                                        <span className="text-xs text-muted-foreground px-2 py-1 rounded-md bg-muted">
                                                            {selectedNote.topic}
                                                        </span>
                                                    )}
                                                </div>
                                                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                                                    {selectedNote.title}
                                                </h2>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleExportNote(selectedNote)}
                                                title="Export as Markdown"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {selectedNote.tags && selectedNote.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {selectedNote.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Scrollable content area with improved scroll behavior */}
                                        <div
                                            className="prose prose-sm max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-a:text-primary dark:prose-invert max-h-[60vh] overflow-y-auto pr-2 scroll-smooth"
                                            style={{ scrollbarWidth: 'thin', scrollbarGutter: 'stable' }}
                                        >
                                            <SimpleMarkdown content={selectedNote.content} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="p-12 text-center">
                                        <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-foreground mb-2">
                                            Select a note
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Choose a note from the list to view its content
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
