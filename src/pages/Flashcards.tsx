import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Play,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Shuffle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject: string;
  topic: string;
  mastered: boolean;
}

const mockFlashcards: Flashcard[] = [
  {
    id: "1",
    question: "What is the powerhouse of the cell?",
    answer: "Mitochondria - responsible for cellular respiration and ATP production",
    subject: "Biology",
    topic: "Cell Biology",
    mastered: true,
  },
  {
    id: "2",
    question: "What is Newton's Second Law of Motion?",
    answer: "F = ma (Force equals mass times acceleration)",
    subject: "Physics",
    topic: "Mechanics",
    mastered: false,
  },
  {
    id: "3",
    question: "What is the chemical formula for water?",
    answer: "H₂O - Two hydrogen atoms bonded to one oxygen atom",
    subject: "Chemistry",
    topic: "Basic Chemistry",
    mastered: true,
  },
  {
    id: "4",
    question: "Define photosynthesis",
    answer: "The process by which plants convert light energy into chemical energy, producing glucose and oxygen from carbon dioxide and water",
    subject: "Biology",
    topic: "Plant Biology",
    mastered: false,
  },
  {
    id: "5",
    question: "What is the Pythagorean theorem?",
    answer: "a² + b² = c², where c is the hypotenuse of a right triangle",
    subject: "Mathematics",
    topic: "Geometry",
    mastered: false,
  },
];

const subjects = ["All Subjects", "Biology", "Physics", "Chemistry", "Mathematics"];

export default function Flashcards() {
  const [cards] = useState<Flashcard[]>(mockFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [searchQuery, setSearchQuery] = useState("");
  const [quizMode, setQuizMode] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });

  const filteredCards = cards.filter((card) => {
    const matchesSubject = selectedSubject === "All Subjects" || card.subject === selectedSubject;
    const matchesSearch =
      card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const currentCard = filteredCards[currentIndex];
  const progress = ((currentIndex + 1) / filteredCards.length) * 100;
  const masteredCount = cards.filter((c) => c.mastered).length;

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    }, 200);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    }, 200);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
    handleNext();
  };

  const resetQuiz = () => {
    setScore({ correct: 0, incorrect: 0 });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Flashcards</h1>
            <p className="text-muted-foreground mt-1">
              {masteredCount} of {cards.length} cards mastered
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={quizMode ? "default" : "outline"} onClick={() => setQuizMode(!quizMode)}>
              <Play className="h-4 w-4 mr-2" />
              {quizMode ? "Exit Quiz" : "Quiz Mode"}
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flashcards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
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
          <Progress value={progress} className="h-2" />
        </div>

        {/* Flashcard */}
        {currentCard && (
          <div
            className="flip-card h-80 md:h-96 cursor-pointer animate-scale-in"
            style={{ animationDelay: "0.3s", opacity: 0 }}
            onClick={handleFlip}
          >
            <div className={cn("flip-card-inner", isFlipped && "flipped")}>
              {/* Front */}
              <div className="flip-card-front glass-card p-8 flex flex-col items-center justify-center text-center">
                <div className="absolute top-4 left-4">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {currentCard.subject}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="text-xs text-muted-foreground">{currentCard.topic}</span>
                </div>
                <BookOpen className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl md:text-2xl font-semibold text-foreground">
                  {currentCard.question}
                </h3>
                <p className="text-sm text-muted-foreground mt-4">Click to reveal answer</p>
              </div>

              {/* Back */}
              <div className="flip-card-back glass-card p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-secondary/10 to-primary/10">
                <div className="absolute top-4 left-4">
                  <span className="success-badge">Answer</span>
                </div>
                <p className="text-lg md:text-xl text-foreground leading-relaxed">
                  {currentCard.answer}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.4s", opacity: 0 }}>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up" style={{ animationDelay: "0.5s", opacity: 0 }}>
          {filteredCards.slice(0, 8).map((card, index) => (
            <button
              key={card.id}
              onClick={() => {
                setCurrentIndex(index);
                setIsFlipped(false);
              }}
              className={cn(
                "p-4 rounded-xl text-left transition-all duration-200",
                currentIndex === index
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-muted/50 hover:bg-muted text-foreground"
              )}
            >
              <p className="text-xs font-medium mb-1 opacity-70">{card.subject}</p>
              <p className="text-sm font-medium line-clamp-2">{card.question}</p>
              {card.mastered && (
                <span className="inline-flex items-center gap-1 text-xs mt-2 opacity-70">
                  <Check className="h-3 w-3" /> Mastered
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
