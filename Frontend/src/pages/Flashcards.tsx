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
import { generateFlashcards } from "@/lib/ai-client";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit,
  Filter,
  Loader2,
  Play,
  Plus,
  RotateCcw,
  Search,
  Shuffle,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

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

export default function Flashcards() {
  const { supabase, user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const location = useLocation();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [selectedTier, setSelectedTier] = useState("All Tiers");
  const [searchQuery, setSearchQuery] = useState("");
  const [quizMode, setQuizMode] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [formData, setFormData] = useState({
    front: "",
    back: "",
    subject: "",
    topic: "",
    tier: "" as "Foundation" | "Higher" | "",
  });

  // Bulk Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user]);

  // Handle generated flashcards from Knowledge Organizers
  // Handle generated flashcards from Knowledge Organizers
  useEffect(() => {
    const handleGeneration = async () => {
      if (!user) return;

      // Case 1: Pre-generated cards (legacy support or if passed directly)
      if (location.state?.generatedFlashcards) {
        await saveGeneratedCards(location.state.generatedFlashcards, location.state.subject || "General");
        return;
      }

      // Case 2: Content passed to be generated
      if (location.state?.organizerContent) {
        const content = location.state.organizerContent;
        const subject = location.state.subject || "General";

        try {
          toast({
            title: "Generating flashcards...",
            description: "AI is creating flashcards from your organizer content. This may take a moment.",
          });

          const result = await generateFlashcards(
            {
              notes: content,
              subject: subject,
              count: 10,
            },
            supabase
          );

          if (result.error) throw new Error(result.error);

          if (result.data?.flashcards) {
            await saveGeneratedCards(result.data.flashcards, subject);
          }
        } catch (error: any) {
          console.error("Error generating flashcards:", error);
          toast({
            title: "Generation Failed",
            description: error.message || "Failed to generate flashcards. Please try again.",
            variant: "destructive",
          });
        }
      }
    };

    handleGeneration();
  }, [location.state, user]);

  const saveGeneratedCards = async (generatedCards: any[], subject: string) => {
    try {
      if (!user) return;

      const cardsToInsert = generatedCards.map((card: any) => ({
        user_id: user.id,
        front: card.question,
        back: card.answer,
        subject: card.subject || subject,
        topic: null,
        difficulty: 1,
        review_count: 0,
      }));

      const { error } = await supabase.from("flashcards").insert(cardsToInsert);

      if (error) throw error;

      toast({
        title: "Flashcards Created!",
        description: `${generatedCards.length} flashcards have been added to your collection.`,
      });

      // Clear location state
      window.history.replaceState({}, document.title);

      // Refresh cards
      fetchCards();
    } catch (error: any) {
      console.error("Error saving generated flashcards:", error);
      toast({
        title: "Error",
        description: "Failed to save generated flashcards.",
        variant: "destructive",
      });
    }
  };

  const fetchCards = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (error: any) {
      console.error("Error fetching flashcards:", error);
      toast({
        title: "Error",
        description: "Failed to load flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = () => {
    setEditingCard(null);
    setFormData({
      front: "",
      back: "",
      subject: "",
      topic: "",
      tier: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card);
    setFormData({
      front: card.front,
      back: card.back,
      subject: card.subject || "",
      topic: card.topic || "",
      tier: card.tier || "",
    });
    setIsDialogOpen(true);
  };

  const handleSaveCard = async () => {
    if (!user || !formData.front.trim() || !formData.back.trim()) {
      toast({
        title: "Error",
        description: "Both front and back are required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.tier) {
      toast({
        title: "Error",
        description: "Please select a Tier (Foundation or Higher)",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCard) {
        // Update existing card
        const { error } = await supabase
          .from("flashcards")
          .update({
            front: formData.front,
            back: formData.back,
            subject: formData.subject || null,
            topic: formData.topic || null,
            tier: formData.tier || null,
          })
          .eq("id", editingCard.id)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Flashcard updated successfully",
        });
      } else {
        // Create new card
        const { error } = await supabase.from("flashcards").insert({
          user_id: user.id,
          front: formData.front,
          back: formData.back,
          subject: formData.subject || null,
          topic: formData.topic || null,
          tier: formData.tier || null,
          difficulty: 1,
          review_count: 0,
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Flashcard created successfully",
        });
      }

      setIsDialogOpen(false);
      fetchCards();
    } catch (error: any) {
      console.error("Error saving flashcard:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save flashcard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this flashcard?")) return;

    try {
      const { error } = await supabase
        .from("flashcards")
        .delete()
        .eq("id", cardId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flashcard deleted successfully",
      });

      fetchCards();
    } catch (error: any) {
      console.error("Error deleting flashcard:", error);
      toast({
        title: "Error",
        description: "Failed to delete flashcard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkReview = async (cardId: string, correct: boolean) => {
    if (!user) return;

    try {
      // Get current card to increment review_count
      const { data: currentCard } = await supabase
        .from("flashcards")
        .select("review_count")
        .eq("id", cardId)
        .eq("user_id", user.id)
        .single();

      const { error } = await supabase
        .from("flashcards")
        .update({
          last_reviewed: new Date().toISOString(),
          review_count: (currentCard?.review_count || 0) + 1,
        })
        .eq("id", cardId)
        .eq("user_id", user.id);

      if (error) throw error;
      fetchCards();
    } catch (error: any) {
      console.error("Error updating review:", error);
      console.error("Error updating review:", error);
    }
  };

  // Bulk Actions
  const handleToggleSelectMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedCards(new Set()); // Clear selection when toggling
  };

  const handleSelectCard = (cardId: string) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setSelectedCards(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCards.size === filteredCards.length) {
      setSelectedCards(new Set());
    } else {
      const allIds = new Set(filteredCards.map((c) => c.id));
      setSelectedCards(allIds);
    }
  };
  //yes
  const handleBulkDelete = async () => {
    if (!user || selectedCards.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedCards.size} flashcards? This action cannot be undone.`)) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("flashcards")
        .delete()
        .in("id", Array.from(selectedCards))
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Deleted ${selectedCards.size} flashcards successfully`,
      });

      setSelectedCards(new Set());
      setIsSelectionMode(false);
      fetchCards();
    } catch (error: any) {
      console.error("Error deleting flashcards:", error);
      toast({
        title: "Error",
        description: "Failed to delete flashcards. Please try again.",
        variant: "destructive",
      });
      setLoading(false); // Only set loading false on error, fetchCards will handle it on success
    }
  };

  const filteredCards = cards.filter((card) => {
    const matchesSubject =
      selectedSubject === "All Subjects" || card.subject === selectedSubject;
    const matchesTopic =
      selectedTopic === "All Topics" || card.topic === selectedTopic;
    const matchesTier =
      selectedTier === "All Tiers" || card.tier === selectedTier;
    const matchesSearch =
      (card.front || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.back || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesTopic && matchesTier && matchesSearch;
  });

  // Group cards by subject and topic for organization
  const groupedCards = filteredCards.reduce((acc, card) => {
    const subject = card.subject || "Uncategorized";
    const topic = card.topic || "General";
    if (!acc[subject]) {
      acc[subject] = {};
    }
    if (!acc[subject][topic]) {
      acc[subject][topic] = [];
    }
    acc[subject][topic].push(card);
    return acc;
  }, {} as Record<string, Record<string, Flashcard[]>>);

  const subjects = Array.from(new Set(cards.map((c) => c.subject).filter(Boolean)));
  const topics = selectedSubject !== "All Subjects"
    ? Array.from(new Set(cards.filter(c => c.subject === selectedSubject).map((c) => c.topic).filter(Boolean)))
    : Array.from(new Set(cards.map((c) => c.topic).filter(Boolean)));

  const currentCard = filteredCards[currentIndex];
  const progress =
    filteredCards.length > 0
      ? ((currentIndex + 1) / filteredCards.length) * 100
      : 0;

  const handleNext = () => {
    setIsFlipped(false);
    // Remove delay for faster quiz mode
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    // Remove delay for faster quiz mode
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = async (correct: boolean) => {
    // Update score immediately for instant feedback
    if (correct) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    // Move to next card immediately
    handleNext();

    // Mark review in background (non-blocking)
    if (currentCard) {
      handleMarkReview(currentCard.id, correct).catch(console.error);
    }
  };

  const resetQuiz = () => {
    setScore({ correct: 0, incorrect: 0 });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const shuffleCards = () => {
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("flashcards.title")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("flashcards.totalCards", {
                count: cards.length,
                plural: cards.length !== 1 ? "s" : ""
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isSelectionMode ? (
              <>
                <Button variant="outline" onClick={handleToggleSelectMode}>
                  {t("flashcards.select")}
                </Button>
                <Button variant={quizMode ? "default" : "outline"} onClick={() => setQuizMode(!quizMode)}>
                  <Play className="h-4 w-4 mr-2" />
                  {quizMode ? t("flashcards.exitQuiz") : t("flashcards.quizMode")}
                </Button>
                <Button onClick={handleCreateCard}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("flashcards.addCard")}
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium mr-2">
                  {t("flashcards.selected", { count: selectedCards.size })}
                </span>
                <Button variant="outline" onClick={handleSelectAll}>
                  {selectedCards.size === filteredCards.length ? t("flashcards.deselectAll") : t("flashcards.selectAll")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={selectedCards.size === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("flashcards.deleteSelected", { count: selectedCards.size })}
                </Button>
                <Button variant="ghost" onClick={handleToggleSelectMode}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flashcards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedSubject} onValueChange={(value) => {
            setSelectedSubject(value);
            setSelectedTopic("All Topics"); // Reset topic when subject changes
          }}>
            <SelectTrigger className="w-full sm:w-[180px]">
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
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Topics">All Topics</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Tiers">All Tiers</SelectItem>
              <SelectItem value="Higher">Higher Tier</SelectItem>
              <SelectItem value="Foundation">Foundation Tier</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={shuffleCards}>
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>

        {filteredCards.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("flashcards.noCards")}</h3>
            <p className="text-muted-foreground mb-4">
              {t("flashcards.createFirst")}
            </p>
            <Button onClick={handleCreateCard}>
              <Plus className="h-4 w-4 mr-2" />
              {t("flashcards.addCard")}
            </Button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Card {currentIndex + 1} of {filteredCards.length}
                </span>
                {quizMode && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-secondary flex items-center gap-1">
                      <Check className="h-4 w-4" /> {score.correct}
                    </span>
                    <span className="text-destructive flex items-center gap-1">
                      <X className="h-4 w-4" /> {score.incorrect}
                    </span>
                  </div>
                )}
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Flashcard */}
            {currentCard && (
              <div
                className={cn(
                  "flip-card h-80 md:h-96 cursor-pointer animate-scale-in relative",
                  isFlipped && "flipped"
                )}
                style={{ animationDelay: "0.3s" }}
                onClick={handleFlip}
              >
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCard(currentCard);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCard(currentCard.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="flip-card-inner">
                  {/* Front */}
                  <div className="flip-card-front glass-card p-8 flex flex-col items-center justify-center text-center">
                    <div className="absolute top-4 left-4 flex gap-2">
                      {currentCard.subject && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {currentCard.subject}
                        </span>
                      )}
                      {currentCard.tier && (
                        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", currentCard.tier === "Higher" ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500")}>
                          {currentCard.tier}
                        </span>
                      )}
                    </div>
                    <BookOpen className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-xl md:text-2xl font-semibold text-foreground">
                      {currentCard.front}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-4">Click to reveal answer</p>
                  </div>

                  {/* Back */}
                  <div className="flip-card-back glass-card p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-secondary/10 to-primary/10">
                    <div className="absolute top-4 left-4">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary/20 text-secondary-foreground">
                        Answer
                      </span>
                    </div>
                    <p className="text-lg md:text-xl text-foreground leading-relaxed">
                      {currentCard.back}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <Button variant="outline" size="icon" onClick={handlePrev} className="h-12 w-12 rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {quizMode ? (
                <>
                  <Button
                    variant="outline"
                    className="h-12 px-6 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleAnswer(false)}
                  >
                    <X className="h-5 w-5 mr-2" />
                    Incorrect
                  </Button>
                  <Button
                    className="h-12 px-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    onClick={() => handleAnswer(true)}
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Correct
                  </Button>
                  {score.correct + score.incorrect > 0 && (
                    <Button variant="outline" onClick={resetQuiz} className="h-12 px-6">
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Reset
                    </Button>
                  )}
                </>
              ) : (
                <Button variant="outline" onClick={handleFlip} className="h-12 px-6">
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Flip Card
                </Button>
              )}

              <Button variant="outline" size="icon" onClick={handleNext} className="h-12 w-12 rounded-full">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Card Grid Preview */}
            {filteredCards.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">All Cards</h3>
                <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up" style={{ animationDelay: "0.5s" }}>
                    {filteredCards.map((card, index) => (
                      <button
                        key={card.id}
                        onClick={() => {
                          if (isSelectionMode) {
                            handleSelectCard(card.id);
                          } else {
                            setCurrentIndex(index);
                            setIsFlipped(false);
                          }
                        }}
                        className={cn(
                          "p-4 rounded-xl text-left transition-all duration-200 relative group",
                          currentIndex === index && !isSelectionMode
                            ? "bg-primary text-primary-foreground shadow-glow"
                            : "bg-muted/50 hover:bg-muted text-foreground",
                          isSelectionMode && selectedCards.has(card.id) && "ring-2 ring-primary bg-primary/10"
                        )}
                      >
                        {isSelectionMode && (
                          <div className="absolute top-2 right-2 z-10">
                            <Checkbox
                              checked={selectedCards.has(card.id)}
                              onCheckedChange={() => handleSelectCard(card.id)}
                              className={cn(
                                "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                                selectedCards.has(card.id) ? "border-primary" : "border-muted-foreground/50"
                              )}
                            />
                          </div>
                        )}
                        <p className={cn("text-xs font-medium mb-1 opacity-70", isSelectionMode && "mr-6")}>{card.subject || "General"}</p>
                        <p className="text-sm font-medium line-clamp-2">{card.front}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCard ? "Edit Flashcard" : "Create New Flashcard"}</DialogTitle>
            <DialogDescription>
              {editingCard
                ? "Update your flashcard details below"
                : "Fill in the details to create a new flashcard"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Biology"
                />
              </div>
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
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Higher">Higher</SelectItem>
                    <SelectItem value="Foundation">Foundation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="front">Front (Question) *</Label>
              <Textarea
                id="front"
                value={formData.front}
                onChange={(e) => setFormData({ ...formData, front: e.target.value })}
                placeholder="Enter the question or prompt..."
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="back">Back (Answer) *</Label>
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCard}>
              {editingCard ? "Update" : "Create"} Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
