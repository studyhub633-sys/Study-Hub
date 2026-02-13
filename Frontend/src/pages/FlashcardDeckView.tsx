import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    BookOpen,
    Check,
    ChevronLeft,
    ChevronRight,
    Edit,
    Loader2,
    Play,
    Plus,
    RotateCcw,
    Search,
    Shuffle,
    Star,
    StarOff,
    Trash2,
    Volume2,
    X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Flashcard {
    id: string;
    front: string;
    back: string;
    subject: string;
    topic: string;
    tier: "Foundation" | "Higher" | null;
    difficulty: number;
    last_reviewed: string | null;
    review_count: number;
    created_at: string;
    updated_at: string;
}

type MasteryLevel = "new" | "learning" | "almostDone" | "mastered";
type FilterMode = "all" | "new" | "learning" | "almostDone" | "mastered";

function getMasteryLevel(reviewCount: number): MasteryLevel {
    if (reviewCount === 0) return "new";
    if (reviewCount <= 2) return "learning";
    if (reviewCount <= 4) return "almostDone";
    return "mastered";
}

const masteryConfig: Record<MasteryLevel, { label: string; color: string; bgColor: string; dotColor: string }> = {
    new: { label: "New Cards", color: "text-rose-400", bgColor: "bg-rose-500/15", dotColor: "bg-rose-400" },
    learning: { label: "Still learning", color: "text-amber-500", bgColor: "bg-amber-500/15", dotColor: "bg-amber-500" },
    almostDone: { label: "Almost done", color: "text-blue-500", bgColor: "bg-blue-500/15", dotColor: "bg-blue-500" },
    mastered: { label: "Mastered", color: "text-emerald-500", bgColor: "bg-emerald-500/15", dotColor: "bg-emerald-500" },
};

export default function FlashcardDeckView() {
    const { subject } = useParams<{ subject: string }>();
    const decodedSubject = decodeURIComponent(subject || "");
    const navigate = useNavigate();
    const { supabase, user } = useAuth();
    const { toast } = useToast();

    const [cards, setCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterMode, setFilterMode] = useState<FilterMode>("all");
    const [studyMode, setStudyMode] = useState(false);
    const [score, setScore] = useState({ correct: 0, incorrect: 0 });
    const [studyProgress, setStudyProgress] = useState(0);
    const [studyComplete, setStudyComplete] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Study mode: dedicated card list and index to prevent repeats / state resets
    const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
    const [studyIndex, setStudyIndex] = useState(0);
    const pendingReviewsRef = useRef<string[]>([]);

    // Card editing
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
    const [formData, setFormData] = useState({
        front: "",
        back: "",
        topic: "",
        tier: "" as "Foundation" | "Higher" | "",
    });

    // Bulk selection
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());

    // Starred cards
    const [starredCards, setStarredCards] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem(`starred_cards_${decodedSubject}`);
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });

    useEffect(() => {
        if (user && decodedSubject) {
            fetchCards();
        }
    }, [user, decodedSubject]);

    useEffect(() => {
        localStorage.setItem(`starred_cards_${decodedSubject}`, JSON.stringify([...starredCards]));
    }, [starredCards, decodedSubject]);

    const fetchCards = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("flashcards")
                .select("*")
                .eq("user_id", user.id)
                .eq("subject", decodedSubject)
                .order("created_at", { ascending: true });

            if (error) throw error;
            setCards(data || []);
        } catch (error: any) {
            console.error("Error fetching flashcards:", error);
            toast({
                title: "Error",
                description: "Failed to load flashcards.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Mastery stats
    const masteryStats = useMemo(() => {
        const stats = { new: 0, learning: 0, almostDone: 0, mastered: 0, total: cards.length };
        cards.forEach((card) => {
            const level = getMasteryLevel(card.review_count);
            stats[level]++;
        });
        return stats;
    }, [cards]);

    const masteryPercent = cards.length > 0 ? Math.round((masteryStats.mastered / cards.length) * 100) : 0;

    // Filtered card list (for the terms section)
    const filteredCards = useMemo(() => {
        return cards.filter((card) => {
            const matchesFilter = filterMode === "all" || getMasteryLevel(card.review_count) === filterMode;
            const matchesSearch =
                card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
                card.back.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [cards, filterMode, searchQuery]);

    // Current card for carousel
    // In study mode use the dedicated study list; otherwise use the main cards list
    const currentCard = studyMode ? studyCards[studyIndex] : cards[currentIndex];

    const transitionToCard = useCallback((getNewIndex: (prev: number) => number, isStudy = false) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setIsFlipped(false);

        if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = setTimeout(() => {
            if (isStudy) {
                setStudyIndex(getNewIndex);
            } else {
                setCurrentIndex(getNewIndex);
            }
            setIsTransitioning(false);
        }, 250);
    }, [isTransitioning]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        };
    }, []);

    const handleNext = () => {
        transitionToCard((prev) => (prev + 1) % cards.length);
    };

    const handlePrev = () => {
        transitionToCard((prev) => (prev - 1 + cards.length) % cards.length);
    };

    const handleFlip = () => {
        if (!isTransitioning) setIsFlipped(!isFlipped);
    };

    // Study mode handlers
    const handleAnswer = async (correct: boolean) => {
        if (studyComplete || isTransitioning) return;

        if (correct) {
            setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
        } else {
            setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
        }

        // Queue the review update instead of fetching immediately (prevents state reset)
        if (currentCard) {
            pendingReviewsRef.current.push(currentCard.id);
            // Fire-and-forget DB update without refetching
            if (user) {
                supabase
                    .from("flashcards")
                    .select("review_count")
                    .eq("id", currentCard.id)
                    .eq("user_id", user.id)
                    .single()
                    .then(({ data }) => {
                        supabase
                            .from("flashcards")
                            .update({
                                last_reviewed: new Date().toISOString(),
                                review_count: (data?.review_count || 0) + 1,
                            })
                            .eq("id", currentCard.id)
                            .eq("user_id", user.id)
                            .then(() => { });
                    });
            }
        }

        const newProgress = studyProgress + 1;
        setStudyProgress(newProgress);

        if (newProgress >= studyCards.length) {
            // All cards answered — show completion screen
            setStudyComplete(true);
        } else {
            // Move to the next card in the study list (no wrapping)
            transitionToCard((prev) => prev + 1, true);
        }
    };

    const handleMarkReview = async (cardId: string) => {
        if (!user) return;
        try {
            const { data: currentCardData } = await supabase
                .from("flashcards")
                .select("review_count")
                .eq("id", cardId)
                .eq("user_id", user.id)
                .single();

            await supabase
                .from("flashcards")
                .update({
                    last_reviewed: new Date().toISOString(),
                    review_count: (currentCardData?.review_count || 0) + 1,
                })
                .eq("id", cardId)
                .eq("user_id", user.id);

            fetchCards();
        } catch (error: any) {
            console.error("Error updating review:", error);
        }
    };

    const handleShuffle = () => {
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const handleCreateCard = () => {
        setEditingCard(null);
        setFormData({ front: "", back: "", topic: "", tier: "" });
        setIsDialogOpen(true);
    };

    const handleEditCard = (card: Flashcard) => {
        setEditingCard(card);
        setFormData({
            front: card.front,
            back: card.back,
            topic: card.topic || "",
            tier: card.tier || "",
        });
        setIsDialogOpen(true);
    };

    const handleSaveCard = async () => {
        if (!user || !formData.front.trim() || !formData.back.trim()) {
            toast({ title: "Error", description: "Both question and answer are required.", variant: "destructive" });
            return;
        }

        try {
            if (editingCard) {
                const { error } = await supabase
                    .from("flashcards")
                    .update({
                        front: formData.front,
                        back: formData.back,
                        topic: formData.topic || null,
                        tier: formData.tier || null,
                    })
                    .eq("id", editingCard.id)
                    .eq("user_id", user.id);
                if (error) throw error;
                toast({ title: "Updated", description: "Flashcard updated." });
            } else {
                const { error } = await supabase.from("flashcards").insert({
                    user_id: user.id,
                    front: formData.front,
                    back: formData.back,
                    subject: decodedSubject,
                    topic: formData.topic || null,
                    tier: formData.tier || null,
                    difficulty: 1,
                    review_count: 0,
                });
                if (error) throw error;
                toast({ title: "Created", description: "Flashcard added to deck." });
            }
            setIsDialogOpen(false);
            fetchCards();
        } catch (error: any) {
            console.error("Error saving flashcard:", error);
            toast({ title: "Error", description: error.message || "Failed to save.", variant: "destructive" });
        }
    };

    const handleDeleteCard = async (cardId: string) => {
        if (!user) return;
        if (!confirm("Delete this flashcard?")) return;

        try {
            const { error } = await supabase
                .from("flashcards")
                .delete()
                .eq("id", cardId)
                .eq("user_id", user.id);
            if (error) throw error;
            toast({ title: "Deleted", description: "Flashcard removed." });
            fetchCards();
        } catch (error: any) {
            console.error("Error deleting flashcard:", error);
        }
    };

    const handleBulkDelete = async () => {
        if (!user || selectedCards.size === 0) return;
        if (!confirm(`Delete ${selectedCards.size} selected cards?`)) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from("flashcards")
                .delete()
                .in("id", Array.from(selectedCards))
                .eq("user_id", user.id);
            if (error) throw error;
            toast({ title: "Deleted", description: `${selectedCards.size} cards removed.` });
            setSelectedCards(new Set());
            setIsSelectionMode(false);
            fetchCards();
        } catch (error: any) {
            console.error("Error deleting flashcards:", error);
            setLoading(false);
        }
    };

    const toggleStar = (cardId: string) => {
        setStarredCards((prev) => {
            const next = new Set(prev);
            if (next.has(cardId)) next.delete(cardId);
            else next.add(cardId);
            return next;
        });
    };

    const handleSelectCard = (cardId: string) => {
        setSelectedCards((prev) => {
            const next = new Set(prev);
            if (next.has(cardId)) next.delete(cardId);
            else next.add(cardId);
            return next;
        });
    };

    const speakText = (text: string) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto flex items-center justify-center h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto pb-24 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/flashcards")} className="h-9 w-9">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-foreground">{decodedSubject}</h1>
                            <p className="text-sm text-muted-foreground">{cards.length} cards</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleCreateCard} className="gap-1.5">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Card</span>
                        </Button>
                        {!isSelectionMode ? (
                            <Button variant="outline" size="sm" onClick={() => setIsSelectionMode(true)}>
                                Select
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{selectedCards.size} selected</span>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                    disabled={selectedCards.size === 0}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => { setIsSelectionMode(false); setSelectedCards(new Set()); }}>
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {cards.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No cards in this deck</h3>
                        <p className="text-muted-foreground mb-4">Start adding flashcards to build your deck.</p>
                        <Button onClick={handleCreateCard}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Card
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Card Carousel */}
                        <div className="mb-8 animate-slide-up">
                            {currentCard && (
                                <div
                                    className={cn("relative w-full min-h-[220px] sm:min-h-[260px] cursor-pointer transition-all duration-250", isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100")}
                                    style={{ perspective: "1200px" }}
                                    onClick={handleFlip}
                                >
                                    <div
                                        className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
                                        style={{
                                            transformStyle: "preserve-3d",
                                            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                                        }}
                                    >
                                        {/* Front */}
                                        <div
                                            className="absolute inset-0 glass-card p-6 sm:p-8 flex flex-col rounded-xl"
                                            style={{ backfaceVisibility: "hidden" }}
                                        >
                                            <div className="flex items-center justify-end gap-2 mb-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); speakText(currentCard.front); }}
                                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                                >
                                                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleStar(currentCard.id); }}
                                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                                >
                                                    {starredCards.has(currentCard.id) ? (
                                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    ) : (
                                                        <StarOff className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="flex-1 flex items-center justify-center text-center px-4">
                                                <h2 className="text-lg sm:text-xl font-semibold leading-relaxed">{currentCard.front}</h2>
                                            </div>
                                        </div>

                                        {/* Back */}
                                        <div
                                            className="absolute inset-0 glass-card p-6 sm:p-8 flex flex-col rounded-xl bg-gradient-to-br from-primary/5 to-primary/10"
                                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                                        >
                                            <div className="flex items-center justify-end gap-2 mb-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); speakText(currentCard.back); }}
                                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                                >
                                                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleStar(currentCard.id); }}
                                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                                >
                                                    {starredCards.has(currentCard.id) ? (
                                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    ) : (
                                                        <StarOff className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="flex-1 flex items-center justify-center text-center px-4">
                                                <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line">{currentCard.back}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Carousel Dots & Navigation */}
                            <div className="flex items-center justify-center gap-4 mt-4">
                                <Button variant="ghost" size="icon" onClick={handlePrev} className="h-9 w-9 rounded-full">
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <div className="flex items-center gap-1.5">
                                    {cards.slice(0, Math.min(5, cards.length)).map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setCurrentIndex(idx); setIsFlipped(false); }}
                                            className={cn(
                                                "w-2 h-2 rounded-full transition-all",
                                                currentIndex === idx ? "bg-primary scale-125" : "bg-muted-foreground/30"
                                            )}
                                        />
                                    ))}
                                    {cards.length > 5 && (
                                        <span className="text-xs text-muted-foreground ml-1">+{cards.length - 5}</span>
                                    )}
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleNext} className="h-9 w-9 rounded-full">
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Study Progress */}
                        <div className="glass-card p-5 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-foreground">Study Progress</h3>
                                <span className={cn(
                                    "text-sm font-bold px-2.5 py-1 rounded-full",
                                    masteryPercent >= 80 ? "bg-emerald-500/15 text-emerald-500" :
                                        masteryPercent >= 40 ? "bg-blue-500/15 text-blue-500" :
                                            "bg-muted text-muted-foreground"
                                )}>
                                    {masteryPercent}%
                                </span>
                            </div>

                            <div className="space-y-3">
                                {(["new", "learning", "almostDone", "mastered"] as MasteryLevel[]).map((level) => {
                                    const config = masteryConfig[level];
                                    const count = masteryStats[level];
                                    const percent = cards.length > 0 ? (count / cards.length) * 100 : 0;
                                    return (
                                        <div key={level} className="flex items-center gap-3">
                                            <div className={cn("w-3 h-3 rounded-full flex-shrink-0 border-2", config.dotColor, `border-${config.dotColor.replace("bg-", "")}`)} />
                                            <span className={cn("text-sm font-medium px-2.5 py-0.5 rounded-full min-w-[110px]", config.bgColor, config.color)}>
                                                {config.label}
                                            </span>
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-500", config.dotColor)}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-foreground w-8 text-right">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Terms Section */}
                        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                            <h3 className="font-semibold text-foreground mb-4">Terms</h3>

                            {/* Search */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search terms/definitions"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                                <button
                                    onClick={() => setFilterMode("all")}
                                    className={cn(
                                        "text-sm px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap",
                                        filterMode === "all"
                                            ? "border-primary bg-primary/10 text-primary font-medium"
                                            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                                    )}
                                >
                                    View All ({cards.length})
                                </button>
                                {(["new", "learning", "almostDone", "mastered"] as MasteryLevel[]).map((level) => {
                                    const config = masteryConfig[level];
                                    const count = masteryStats[level];
                                    if (count === 0) return null;
                                    return (
                                        <button
                                            key={level}
                                            onClick={() => setFilterMode(level)}
                                            className={cn(
                                                "text-sm px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap",
                                                filterMode === level
                                                    ? `border-current ${config.bgColor} ${config.color} font-medium`
                                                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                                            )}
                                        >
                                            {config.label} ({count})
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Card List */}
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                                {filteredCards.map((card, index) => {
                                    const mastery = getMasteryLevel(card.review_count);
                                    const config = masteryConfig[mastery];
                                    return (
                                        <div
                                            key={card.id}
                                            className={cn(
                                                "glass-card p-4 transition-all duration-200 group",
                                                isSelectionMode && selectedCards.has(card.id) && "ring-2 ring-primary bg-primary/5"
                                            )}
                                            onClick={() => isSelectionMode && handleSelectCard(card.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Selection checkbox */}
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedCards.has(card.id)}
                                                        onCheckedChange={() => handleSelectCard(card.id)}
                                                        className="mt-1"
                                                    />
                                                )}

                                                {/* Card number */}
                                                <span className="text-xs font-bold text-muted-foreground bg-muted w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    {index + 1}
                                                </span>

                                                {/* Status badge */}
                                                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5", config.bgColor, config.color)}>
                                                    {config.label}
                                                </span>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground">{card.front}</p>
                                                    <div className="h-px bg-border/50 my-2" />
                                                    <p className="text-sm text-muted-foreground whitespace-pre-line">{card.back}</p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); speakText(card.front); }}
                                                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                                    >
                                                        <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleStar(card.id); }}
                                                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                                    >
                                                        {starredCards.has(card.id) ? (
                                                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                                        ) : (
                                                            <StarOff className="h-3.5 w-3.5 text-muted-foreground" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEditCard(card); }}
                                                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                                    >
                                                        <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }}
                                                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 text-destructive/70" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Study Flashcards Sticky Button */}
            {cards.length > 0 && !studyMode && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pointer-events-none z-30 flex justify-center">
                    <Button
                        size="lg"
                        className="pointer-events-auto px-8 py-6 text-base font-semibold rounded-xl shadow-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white gap-2"
                        onClick={() => {
                            // Create a shuffled copy of cards for study
                            const shuffled = [...cards].sort(() => Math.random() - 0.5);
                            setStudyCards(shuffled);
                            setStudyIndex(0);
                            setStudyMode(true);
                            setIsFlipped(false);
                            setScore({ correct: 0, incorrect: 0 });
                            setStudyProgress(0);
                            setStudyComplete(false);
                            setIsTransitioning(false);
                            pendingReviewsRef.current = [];
                        }}
                    >
                        <Play className="h-5 w-5" />
                        Study Flashcards
                    </Button>
                </div>
            )}

            {/* Study Mode Overlay */}
            {studyMode && (
                <div className="fixed inset-0 z-50 bg-background flex flex-col">
                    {/* Study Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <Button variant="ghost" onClick={() => { setStudyMode(false); fetchCards(); }} className="gap-2">
                            <X className="h-5 w-5" />
                            Exit Study
                        </Button>
                        <h2 className="font-semibold">{decodedSubject}</h2>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-emerald-500 flex items-center gap-1">
                                <Check className="h-4 w-4" /> {score.correct}
                            </span>
                            <span className="text-destructive flex items-center gap-1">
                                <X className="h-4 w-4" /> {score.incorrect}
                            </span>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="px-4 pt-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                            <span>{studyProgress} / {studyCards.length} answered</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                    const shuffled = [...studyCards].sort(() => Math.random() - 0.5);
                                    setStudyCards(shuffled);
                                    setStudyIndex(0);
                                    setIsFlipped(false);
                                    setScore({ correct: 0, incorrect: 0 });
                                    setStudyProgress(0);
                                    setStudyComplete(false);
                                    setIsTransitioning(false);
                                }} className="gap-1 h-8">
                                    <Shuffle className="h-3.5 w-3.5" />
                                    Shuffle
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => { setStudyIndex(0); setIsFlipped(false); setScore({ correct: 0, incorrect: 0 }); setStudyProgress(0); setStudyComplete(false); setIsTransitioning(false); }} className="gap-1 h-8">
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Reset
                                </Button>
                            </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                                className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${studyCards.length > 0 ? (studyProgress / studyCards.length) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    {/* Flashcard */}
                    <div className="flex-1 flex items-center justify-center p-6">
                        {studyComplete ? (
                            /* Completion Screen */
                            <div className="w-full max-w-lg glass-card p-8 rounded-2xl text-center animate-fade-in">
                                <div className="text-5xl mb-4">🎉</div>
                                <h2 className="text-2xl font-bold mb-2">Study Complete!</h2>
                                <p className="text-muted-foreground mb-6">You've gone through all {studyCards.length} cards.</p>
                                <div className="flex items-center justify-center gap-6 mb-8">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-emerald-500">{score.correct}</div>
                                        <div className="text-sm text-muted-foreground">Correct</div>
                                    </div>
                                    <div className="w-px h-12 bg-border" />
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-destructive">{score.incorrect}</div>
                                        <div className="text-sm text-muted-foreground">Incorrect</div>
                                    </div>
                                    <div className="w-px h-12 bg-border" />
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-primary">
                                            {studyCards.length > 0 ? Math.round((score.correct / studyCards.length) * 100) : 0}%
                                        </div>
                                        <div className="text-sm text-muted-foreground">Score</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStudyMode(false)}
                                        className="px-6"
                                    >
                                        Exit
                                    </Button>
                                    <Button
                                        className="px-6 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
                                        onClick={() => {
                                            const shuffled = [...studyCards].sort(() => Math.random() - 0.5);
                                            setStudyCards(shuffled);
                                            setStudyIndex(0);
                                            setIsFlipped(false);
                                            setScore({ correct: 0, incorrect: 0 });
                                            setStudyProgress(0);
                                            setStudyComplete(false);
                                            setIsTransitioning(false);
                                        }}
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Study Again
                                    </Button>
                                </div>
                            </div>
                        ) : currentCard ? (
                            <div
                                className={cn("w-full max-w-lg min-h-[300px] cursor-pointer transition-all duration-250", isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100")}
                                style={{ perspective: "1200px" }}
                                onClick={handleFlip}
                            >
                                <div
                                    className="w-full min-h-[300px] transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] relative"
                                    style={{
                                        transformStyle: "preserve-3d",
                                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                                    }}
                                >
                                    <div
                                        className="absolute inset-0 glass-card p-8 flex flex-col items-center justify-center text-center rounded-2xl"
                                        style={{ backfaceVisibility: "hidden" }}
                                    >
                                        <BookOpen className="h-8 w-8 text-primary mb-4 opacity-50" />
                                        <h2 className="text-xl sm:text-2xl font-semibold leading-relaxed">{currentCard.front}</h2>
                                        <p className="text-sm text-muted-foreground mt-6">Tap to reveal answer</p>
                                    </div>
                                    <div
                                        className="absolute inset-0 glass-card p-8 flex flex-col items-center justify-center text-center rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10"
                                        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                                    >
                                        <p className="text-lg sm:text-xl leading-relaxed whitespace-pre-line">{currentCard.back}</p>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Study Controls */}
                    {!studyComplete && (
                        <div className="flex items-center justify-center gap-4 p-6 border-t border-border">
                            <Button
                                variant="outline"
                                className="h-12 px-8 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => handleAnswer(false)}
                                disabled={isTransitioning}
                            >
                                <X className="h-5 w-5 mr-2" />
                                Incorrect
                            </Button>
                            <Button
                                className="h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white"
                                onClick={() => handleAnswer(true)}
                                disabled={isTransitioning}
                            >
                                <Check className="h-5 w-5 mr-2" />
                                Correct
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Card Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingCard ? "Edit Flashcard" : "Add New Flashcard"}</DialogTitle>
                        <DialogDescription>
                            {editingCard ? "Update your flashcard details" : `Add a new card to "${decodedSubject}"`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="topic">Topic</Label>
                                <Input
                                    id="topic"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    placeholder="e.g., Cell Biology"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tier">Tier</Label>
                                <Select
                                    value={formData.tier}
                                    onValueChange={(val: "Foundation" | "Higher") => setFormData({ ...formData, tier: val })}
                                >
                                    <SelectTrigger id="tier">
                                        <SelectValue placeholder="Optional" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Higher">Higher</SelectItem>
                                        <SelectItem value="Foundation">Foundation</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="front">Question *</Label>
                            <Textarea
                                id="front"
                                value={formData.front}
                                onChange={(e) => setFormData({ ...formData, front: e.target.value })}
                                placeholder="Enter the question..."
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="back">Answer *</Label>
                            <Textarea
                                id="back"
                                value={formData.back}
                                onChange={(e) => setFormData({ ...formData, back: e.target.value })}
                                placeholder="Enter the answer..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveCard}>{editingCard ? "Update" : "Add"} Card</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
