import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { generateFlashcards } from "@/lib/ai-client";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronRight,
  Clock,
  Layers,
  Loader2,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

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

interface Deck {
  subject: string;
  cards: Flashcard[];
  totalCards: number;
  newCards: number;
  learning: number;
  almostDone: number;
  mastered: number;
  lastStudied: string | null;
  topics: string[];
}

function getMasteryLevel(reviewCount: number): "new" | "learning" | "almostDone" | "mastered" {
  if (reviewCount === 0) return "new";
  if (reviewCount <= 2) return "learning";
  if (reviewCount <= 4) return "almostDone";
  return "mastered";
}

function getMasteryPercent(deck: Deck): number {
  if (deck.totalCards === 0) return 0;
  // Weighted progress: learning=33%, almostDone=66%, mastered=100%
  const weightedScore = (deck.learning * 0.33) + (deck.almostDone * 0.66) + (deck.mastered * 1);
  return Math.round((weightedScore / deck.totalCards) * 100);
}

export default function Flashcards() {
  const { supabase, user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  // AI generation state
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generateTopic, setGenerateTopic] = useState("");
  const [generateSubject, setGenerateSubject] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user]);

  // Handle generated flashcards from Knowledge Organizers
  useEffect(() => {
    const handleGeneration = async () => {
      if (!user) return;

      if (location.state?.generatedFlashcards) {
        await saveGeneratedCards(location.state.generatedFlashcards, location.state.subject || "General");
        return;
      }

      if (location.state?.organizerContent) {
        const content = location.state.organizerContent;
        const subject = location.state.subject || "General";

        try {
          toast({
            title: t("flashcards.generating"),
            description: t("flashcards.generatingDesc"),
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
        title: t("flashcards.successCreated"),
        description: t("flashcards.successCreatedDesc", { count: generatedCards.length }),
      });

      window.history.replaceState({}, document.title);
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

  const handleCreateDeck = async () => {
    if (!user || !newDeckName.trim()) return;

    // Create a placeholder card for the new deck
    try {
      const { error } = await supabase.from("flashcards").insert({
        user_id: user.id,
        front: "Sample Question",
        back: "Sample Answer — edit or delete this card",
        subject: newDeckName.trim(),
        topic: "General",
        difficulty: 1,
        review_count: 0,
      });

      if (error) throw error;

      toast({
        title: "Deck Created",
        description: `"${newDeckName.trim()}" deck has been created.`,
      });

      setIsCreateDeckOpen(false);
      setNewDeckName("");
      fetchCards();

      // Navigate to the new deck
      navigate(`/flashcards/${encodeURIComponent(newDeckName.trim())}`);
    } catch (error: any) {
      console.error("Error creating deck:", error);
      toast({
        title: "Error",
        description: "Failed to create deck. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateCards = async () => {
    if (!user || !generateTopic.trim()) return;

    setGenerating(true);
    try {
      const subject = generateSubject.trim() || "General";

      const result = await generateFlashcards(
        {
          notes: generateTopic,
          subject: subject,
          count: 10,
        },
        supabase
      );

      if (result.error) throw new Error(result.error);

      if (result.data?.flashcards) {
        await saveGeneratedCards(result.data.flashcards, subject);
        setIsGenerateOpen(false);
        setGenerateTopic("");
        setGenerateSubject("");
      }
    } catch (error: any) {
      console.error("Error generating flashcards:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate flashcards.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  // Group cards into decks by subject
  const decks: Deck[] = (() => {
    const grouped: Record<string, Flashcard[]> = {};
    cards.forEach((card) => {
      const subject = card.subject || "Uncategorised";
      if (!grouped[subject]) grouped[subject] = [];
      grouped[subject].push(card);
    });

    return Object.entries(grouped).map(([subject, deckCards]) => {
      const newCards = deckCards.filter((c) => getMasteryLevel(c.review_count) === "new").length;
      const learning = deckCards.filter((c) => getMasteryLevel(c.review_count) === "learning").length;
      const almostDone = deckCards.filter((c) => getMasteryLevel(c.review_count) === "almostDone").length;
      const mastered = deckCards.filter((c) => getMasteryLevel(c.review_count) === "mastered").length;
      const topics = Array.from(new Set(deckCards.map((c) => c.topic).filter(Boolean)));
      const lastStudied = deckCards
        .map((c) => c.last_reviewed)
        .filter(Boolean)
        .sort()
        .reverse()[0] || null;

      return {
        subject,
        cards: deckCards,
        totalCards: deckCards.length,
        newCards,
        learning,
        almostDone,
        mastered,
        lastStudied,
        topics,
      };
    });
  })();

  const filteredDecks = decks.filter((deck) =>
    deck.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <Layers className="h-7 w-7 text-primary" />
              </div>
              {t("flashcards.title")}
            </h1>
            <p className="text-muted-foreground mt-1.5 ml-14">
              {decks.length} {decks.length === 1 ? "deck" : "decks"} • {cards.length} total cards
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsGenerateOpen(true)}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              AI Generate
            </Button>
            <Button onClick={() => setIsCreateDeckOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Deck
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search decks by name or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Deck Grid */}
        {filteredDecks.length === 0 ? (
          <div className="glass-card p-12 text-center animate-fade-in">
            <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {cards.length === 0 ? "No flashcard decks yet" : "No decks match your search"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {cards.length === 0
                ? "Create your first deck to start organising your flashcards"
                : "Try a different search term"}
            </p>
            {cards.length === 0 && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => setIsCreateDeckOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create a Deck
                </Button>
                <Button variant="outline" onClick={() => setIsGenerateOpen(true)} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Generate Cards
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {filteredDecks.map((deck, index) => {
              const masteryPercent = getMasteryPercent(deck);
              return (
                <button
                  key={deck.subject}
                  onClick={() => navigate(`/flashcards/${encodeURIComponent(deck.subject)}`)}
                  className={cn(
                    "group glass-card p-5 text-left transition-all duration-300",
                    "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20",
                    "hover:translate-y-[-2px] active:translate-y-0"
                  )}
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  {/* Deck Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-base truncate group-hover:text-primary transition-colors">
                        {deck.subject}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {deck.totalCards} {deck.totalCards === 1 ? "card" : "cards"}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-all group-hover:translate-x-0.5 flex-shrink-0 mt-0.5" />
                  </div>

                  {/* Mastery Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Progress</span>
                      <span className={cn(
                        "font-semibold",
                        masteryPercent >= 80 ? "text-emerald-500" :
                          masteryPercent >= 40 ? "text-blue-500" :
                            "text-muted-foreground"
                      )}>{masteryPercent}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full flex">
                        {deck.mastered > 0 && (
                          <div
                            className="bg-emerald-500 transition-all duration-500"
                            style={{ width: `${(deck.mastered / deck.totalCards) * 100}%` }}
                          />
                        )}
                        {deck.almostDone > 0 && (
                          <div
                            className="bg-blue-500 transition-all duration-500"
                            style={{ width: `${(deck.almostDone / deck.totalCards) * 100}%` }}
                          />
                        )}
                        {deck.learning > 0 && (
                          <div
                            className="bg-amber-500 transition-all duration-500"
                            style={{ width: `${(deck.learning / deck.totalCards) * 100}%` }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mastery Breakdown */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400/80" />
                      <span className="text-muted-foreground">New</span>
                      <span className="ml-auto font-medium text-foreground">{deck.newCards}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-muted-foreground">Learning</span>
                      <span className="ml-auto font-medium text-foreground">{deck.learning}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-muted-foreground">Almost</span>
                      <span className="ml-auto font-medium text-foreground">{deck.almostDone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">Mastered</span>
                      <span className="ml-auto font-medium text-foreground">{deck.mastered}</span>
                    </div>
                  </div>

                  {/* Topics & Last Studied */}
                  <div className="mt-4 pt-3 border-t border-border/50">
                    {deck.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {deck.topics.slice(0, 3).map((topic) => (
                          <span
                            key={topic}
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                          >
                            {topic}
                          </span>
                        ))}
                        {deck.topics.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{deck.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    {deck.lastStudied && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Last studied {new Date(deck.lastStudied).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Deck Dialog */}
      <Dialog open={isCreateDeckOpen} onOpenChange={setIsCreateDeckOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Deck</DialogTitle>
            <DialogDescription>
              Give your flashcard deck a name. You can add cards after creating it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deckName">Deck Name</Label>
              <Input
                id="deckName"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="e.g., Cold War, Cell Biology, Macbeth..."
                onKeyDown={(e) => e.key === "Enter" && handleCreateDeck()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDeckOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDeck} disabled={!newDeckName.trim()}>
              Create Deck
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Generate Dialog */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Flashcard Generator
            </DialogTitle>
            <DialogDescription>
              Enter your study notes or a topic and our AI will generate flashcards for you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="genSubject">Deck Name (Subject)</Label>
              <Input
                id="genSubject"
                value={generateSubject}
                onChange={(e) => setGenerateSubject(e.target.value)}
                placeholder="e.g., Biology, History..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genTopic">Topic or Notes</Label>
              <textarea
                id="genTopic"
                value={generateTopic}
                onChange={(e) => setGenerateTopic(e.target.value)}
                placeholder="Paste your notes or enter a topic..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateCards}
              disabled={!generateTopic.trim() || generating}
              className="bg-gradient-to-r from-purple-500 to-blue-600 text-white"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Cards
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
