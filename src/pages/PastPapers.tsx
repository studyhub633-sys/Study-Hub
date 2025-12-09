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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  FileText,
  Clock,
  Play,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Timer,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Paper {
  id: string;
  title: string;
  subject: string;
  examBoard: string;
  year: string;
  difficulty: "easy" | "medium" | "hard";
  duration: number;
  questions: number;
  completed: boolean;
  score?: number;
  hasMarkScheme: boolean;
  starred: boolean;
}

const mockPapers: Paper[] = [
  {
    id: "1",
    title: "Cell Biology & Genetics",
    subject: "Biology",
    examBoard: "AQA",
    year: "2024",
    difficulty: "medium",
    duration: 75,
    questions: 25,
    completed: true,
    score: 82,
    hasMarkScheme: true,
    starred: true,
  },
  {
    id: "2",
    title: "Organic Chemistry Paper 1",
    subject: "Chemistry",
    examBoard: "Edexcel",
    year: "2024",
    difficulty: "hard",
    duration: 90,
    questions: 30,
    completed: true,
    score: 68,
    hasMarkScheme: true,
    starred: false,
  },
  {
    id: "3",
    title: "Mechanics & Motion",
    subject: "Physics",
    examBoard: "OCR",
    year: "2023",
    difficulty: "medium",
    duration: 60,
    questions: 20,
    completed: false,
    hasMarkScheme: true,
    starred: true,
  },
  {
    id: "4",
    title: "Pure Mathematics Paper 2",
    subject: "Mathematics",
    examBoard: "AQA",
    year: "2024",
    difficulty: "hard",
    duration: 120,
    questions: 15,
    completed: false,
    hasMarkScheme: true,
    starred: false,
  },
  {
    id: "5",
    title: "Ecology & Ecosystems",
    subject: "Biology",
    examBoard: "AQA",
    year: "2023",
    difficulty: "easy",
    duration: 45,
    questions: 18,
    completed: true,
    score: 91,
    hasMarkScheme: true,
    starred: false,
  },
  {
    id: "6",
    title: "Atomic Structure",
    subject: "Chemistry",
    examBoard: "OCR",
    year: "2023",
    difficulty: "easy",
    duration: 50,
    questions: 22,
    completed: false,
    hasMarkScheme: false,
    starred: false,
  },
];

const difficultyConfig = {
  easy: { label: "Easy", color: "bg-secondary/10 text-secondary border-secondary/20" },
  medium: { label: "Medium", color: "bg-accent/20 text-accent-foreground border-accent/30" },
  hard: { label: "Hard", color: "bg-destructive/10 text-destructive border-destructive/20" },
};

const subjects = ["All Subjects", "Biology", "Chemistry", "Physics", "Mathematics"];
const examBoards = ["All Boards", "AQA", "Edexcel", "OCR", "WJEC"];

export default function PastPapers() {
  const [papers] = useState<Paper[]>(mockPapers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedBoard, setSelectedBoard] = useState("All Boards");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All Subjects" || paper.subject === selectedSubject;
    const matchesBoard = selectedBoard === "All Boards" || paper.examBoard === selectedBoard;
    const matchesDifficulty = selectedDifficulty === "All" || paper.difficulty === selectedDifficulty;
    return matchesSearch && matchesSubject && matchesBoard && matchesDifficulty;
  });

  const completedCount = papers.filter((p) => p.completed).length;
  const averageScore = papers.filter((p) => p.score).reduce((acc, p) => acc + (p.score || 0), 0) / completedCount || 0;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Past Papers</h1>
            <p className="text-muted-foreground mt-1">
              Practice with {papers.length} papers from various exam boards
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Start Random Quiz
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
          {[
            { label: "Total Papers", value: papers.length, icon: FileText },
            { label: "Completed", value: completedCount, icon: CheckCircle },
            { label: "Average Score", value: `${Math.round(averageScore)}%`, icon: Star },
            { label: "Study Time", value: "12.5h", icon: Timer },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedBoard} onValueChange={setSelectedBoard}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {examBoards.map((board) => (
                <SelectItem key={board} value={board}>{board}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Papers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map((paper, index) => {
            const difficulty = difficultyConfig[paper.difficulty];
            
            return (
              <div
                key={paper.id}
                className="glass-card p-5 hover-lift animate-slide-up"
                style={{ animationDelay: `${0.1 * index}s`, opacity: 0 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={difficulty.color}>
                      {difficulty.label}
                    </Badge>
                    <Badge variant="outline">{paper.examBoard}</Badge>
                  </div>
                  <button className="text-muted-foreground hover:text-accent transition-colors">
                    <Star className={cn("h-5 w-5", paper.starred && "text-accent fill-accent")} />
                  </button>
                </div>

                <h3 className="font-semibold text-foreground mb-1">{paper.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {paper.subject} • {paper.year}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{paper.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{paper.questions} questions</span>
                  </div>
                </div>

                {paper.completed ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Your Score</span>
                      <span className={cn(
                        "font-bold",
                        (paper.score || 0) >= 70 ? "text-secondary" : 
                        (paper.score || 0) >= 50 ? "text-accent-foreground" : "text-destructive"
                      )}>
                        {paper.score}%
                      </span>
                    </div>
                    <Progress value={paper.score} className="h-2" />
                  </div>
                ) : (
                  <div className="mb-4 p-3 rounded-lg bg-muted/50 flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>Not attempted yet</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant={paper.completed ? "outline" : "default"}
                    className="flex-1"
                  >
                    {paper.completed ? (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Quiz
                      </>
                    )}
                  </Button>
                  {paper.hasMarkScheme && (
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredPapers.length === 0 && (
          <div className="glass-card p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No papers found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
