import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { EXAM_BOARDS } from "@/lib/constants";
import { SmartPaperParser } from "@/lib/paper-parser";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Eye,
  FileText,
  Layers,
  Loader2,
  Play,
  Plus,
  Search,
  Sparkles,
  Star,
  Timer
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Paper {
  id: string;
  title: string;
  subject: string | null;
  year: number | null;
  exam_board: string | null;
  tier: "Foundation" | "Higher" | null;
  file_url: string | null;
  file_type: "link" | "upload" | null; // New field to distinguish
  score: number | null;
  max_score: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function PastPapers() {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedBoard, setSelectedBoard] = useState("All Boards");
  const [selectedTier, setSelectedTier] = useState(searchParams.get("tier") || "All Tiers");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    year: "",
    exam_board: "",
    tier: "" as "Foundation" | "Higher" | "",
    file_url: "",
    file_type: "link" as "link",
    score: "",
    max_score: "",
  });


  const [reviewPaper, setReviewPaper] = useState<Paper | null>(null);
  const [studyTime, setStudyTime] = useState<number>(0);
  const [currentSessionStart, setCurrentSessionStart] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      fetchPapers();
      fetchStudyTime();
    }
  }, [user]);

  // Real-time study time tracking
  useEffect(() => {
    if (!reviewPaper || !user) {
      setCurrentSessionStart(null);
      return;
    }

    // Start tracking when review dialog opens
    const startTime = new Date();
    setCurrentSessionStart(startTime);
    let sessionStartRef = startTime;

    // Update study time every second
    const interval = setInterval(() => {
      setStudyTime(prev => prev + 1);
    }, 1000);

    // Save study time when dialog closes
    return () => {
      clearInterval(interval);
      const elapsed = Math.floor((new Date().getTime() - sessionStartRef.getTime()) / 1000);
      if (elapsed > 0 && reviewPaper) {
        saveStudyTime(reviewPaper.id, elapsed);
      }
    };
  }, [reviewPaper, user]);

  const fetchStudyTime = async () => {
    if (!user) return;
    try {
      // Calculate total study time from review sessions
      // For now, we'll estimate based on completed papers and time spent
      // In a full implementation, you'd track this in a study_sessions table
      const completedPapers = papers.filter(p => p.completed_at);
      // Estimate: average 1 hour per completed paper
      const estimatedHours = completedPapers.length * 1;
      setStudyTime(estimatedHours * 3600);
    } catch (error) {
      console.error("Error fetching study time:", error);
    }
  };

  const saveStudyTime = async (paperId: string, seconds: number) => {
    if (!user || seconds <= 0) return;
    try {
      // In a full implementation, save to study_sessions table
      // For now, we'll just update the local state
      setStudyTime(prev => prev + seconds);
    } catch (error) {
      console.error("Error saving study time:", error);
    }
  };

  const fetchPapers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("past_papers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPapers(data || []);
    } catch (error: any) {
      console.error("Error fetching papers:", error);
      toast({
        title: "Error",
        description: "Failed to load past papers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaper = () => {
    setEditingPaper(null);
    setFormData({
      title: "",
      subject: "",
      year: "",
      exam_board: "",
      tier: "",
      file_url: "",
      file_type: "link",
      score: "",
      max_score: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditPaper = (paper: Paper) => {
    setEditingPaper(paper);
    setFormData({
      title: paper.title,
      subject: paper.subject || "",
      year: paper.year?.toString() || "",
      exam_board: paper.exam_board || "",
      tier: paper.tier || "",
      file_url: paper.file_url || "",
      file_type: "link",
      score: paper.score?.toString() || "",
      max_score: paper.max_score?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  // File upload removed to prevent hosting copyrighted exam board content

  const handleAutoFill = () => {
    if (!formData.file_url) {
      toast({
        title: "No Link Found",
        description: "Please paste a link first to use auto-fill.",
        variant: "destructive",
      });
      return;
    }

    const metadata = SmartPaperParser.parse(formData.file_url);

    if (metadata.board === 'Unknown' && metadata.type === 'Other' && !metadata.subjectCode) {
      toast({
        title: "Could not parse link",
        description: "This link format is not recognized for auto-fill.",
        variant: "destructive",
      });
      return;
    }

    // Generate a title if we have metadata
    let generatedTitle = formData.title;
    if (metadata.subjectCode || metadata.board !== 'Unknown') {
      const parts = [];
      if (metadata.subjectCode) parts.push(metadata.subjectCode);
      if (metadata.type !== 'Other') parts.push(metadata.type);
      if (metadata.year) parts.push(metadata.year);
      if (metadata.month) parts.push(metadata.month);
      if (metadata.board !== 'Unknown') parts.push(`(${metadata.board})`);

      generatedTitle = parts.join(' ');
    }

    setFormData(prev => ({
      ...prev,
      title: generatedTitle || prev.title,
      subject: metadata.subjectCode || prev.subject,
      exam_board: metadata.board !== 'Unknown' ? metadata.board : prev.exam_board,
      year: metadata.year || prev.year,
    }));

    toast({
      title: "Auto-filled!",
      description: `Parsed ${metadata.board} paper details.`,
    });
  };

  const handleSavePaper = async () => {
    if (!user || !formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
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
      let fileUrl = formData.file_url?.trim() || null;

      const updateData: any = {
        user_id: user.id,
        title: formData.title,
        subject: formData.subject || null,
        year: formData.year ? parseInt(formData.year) : null,
        exam_board: formData.exam_board || null,
        tier: formData.tier || null,
        file_url: fileUrl,
        file_type: formData.file_type,
        score: formData.score ? parseInt(formData.score) : null,
        max_score: formData.max_score ? parseInt(formData.max_score) : null,
        completed_at: formData.score ? new Date().toISOString() : null,
      };

      if (editingPaper) {
        const { error } = await supabase
          .from("past_papers")
          .update(updateData)
          .eq("id", editingPaper.id)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Past paper updated successfully",
        });
      } else {
        const { error } = await supabase.from("past_papers").insert(updateData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Past paper created successfully",
        });
      }

      setIsDialogOpen(false);
      fetchPapers();
    } catch (error: any) {
      console.error("Error saving paper:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save past paper. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePaper = async (paperId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this past paper?")) return;

    try {
      const { error } = await supabase
        .from("past_papers")
        .delete()
        .eq("id", paperId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Past paper deleted successfully",
      });

      fetchPapers();
    } catch (error: any) {
      console.error("Error deleting paper:", error);
      toast({
        title: "Error",
        description: "Failed to delete past paper. Please try again.",
        variant: "destructive",
      });
    }
  };

  // All papers now open in new tabs - no downloading or hosting of copyrighted content
  const handleOpenPaper = (paper: Paper) => {
    if (!paper.file_url) {
      toast({
        title: "No link available",
        description: "This paper doesn't have a link attached yet.",
        variant: "destructive",
      });
      return;
    }
    window.open(paper.file_url, "_blank", "noopener,noreferrer");
  };

  const handleReview = (paper: Paper) => {
    setReviewPaper(paper);
    setCurrentSessionStart(new Date());
  };

  const formatStudyTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleGenerateFlashcards = (paper: Paper) => {
    if (!paper.subject) {
      toast({
        title: "No subject available",
        description: "This paper needs a subject to generate flashcards.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to flashcards page with paper info to generate cards
    navigate("/flashcards", {
      state: {
        organizerContent: `Generate flashcards for ${paper.subject} based on the ${paper.exam_board || "GCSE"} syllabus. Year: ${paper.year || "recent"}. Paper title: ${paper.title}. Focus on key concepts, definitions, and exam-style questions that would appear in this type of paper.`,
        subject: paper.subject,
        topic: paper.title,
      },
    });

    toast({
      title: "Generating flashcards...",
      description: `Creating flashcards for ${paper.subject}`,
    });
  };

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = (paper.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All Subjects" || paper.subject === selectedSubject;
    const matchesBoard = selectedBoard === "All Boards" || paper.exam_board === selectedBoard;

    // Smart Tier Filtering: Check implicit tags (metadata) OR explicit title keywords
    let paperTier = paper.tier;

    // If no explicit tier is set, try to infer from title
    if (!paperTier && paper.title) {
      const titleLower = paper.title.toLowerCase();

      const isFoundation =
        titleLower.includes("foundation") ||
        titleLower.includes(" 1f") || titleLower.includes(" 2f") || titleLower.includes(" 3f") ||
        titleLower.endsWith("1f") || titleLower.endsWith("2f") || titleLower.endsWith("3f") ||
        /\b[1-3]f\b/.test(titleLower);

      const isHigher =
        titleLower.includes("higher") ||
        titleLower.includes(" 1h") || titleLower.includes(" 2h") || titleLower.includes(" 3h") ||
        titleLower.endsWith("1h") || titleLower.endsWith("2h") || titleLower.endsWith("3h") ||
        /\b[1-3]h\b/.test(titleLower);

      if (isFoundation) paperTier = "Foundation";
      else if (isHigher) paperTier = "Higher";
    }

    const matchesTier = selectedTier === "All Tiers" ||
      (selectedTier === "Unassigned" && !paperTier) ||
      (paperTier?.toLowerCase() === selectedTier.toLowerCase());

    return matchesSearch && matchesSubject && matchesBoard && matchesTier;
  });

  const completedCount = papers.filter((p) => p.completed_at).length;
  const completedWithScores = papers.filter((p) => p.score !== null && p.max_score !== null);
  const averageScore =
    completedWithScores.length > 0
      ? completedWithScores.reduce((acc, p) => acc + ((p.score || 0) / (p.max_score || 1)) * 100, 0) /
      completedWithScores.length
      : 0;

  const subjects = Array.from(new Set(papers.map((p) => p.subject).filter(Boolean)));
  // Removed dynamic examBoards generation since we now have fixed constant, but could mix both if needed
  // For now, let's just use the constant for filtering to guide the user potentially

  // Concise title logic - auto-generate concise titles
  useEffect(() => {
    if (!editingPaper && formData.year && formData.subject && formData.tier) {
      const tierShort = formData.tier === "Higher" ? "H" : "F";
      const examBoardShort = formData.exam_board ? ` ${formData.exam_board}` : "";
      const suggestedTitle = `${formData.year}${tierShort} ${formData.subject}${examBoardShort}`;
      if (!formData.title || formData.title.trim() === "") {
        setFormData(prev => ({ ...prev, title: suggestedTitle }));
      }
    }
  }, [formData.year, formData.subject, formData.tier, formData.exam_board, editingPaper]);

  // Make existing paper titles more concise while keeping paper number
  const getConciseTitle = (paper: Paper) => {
    if (paper.year && paper.subject && paper.tier) {
      const tierShort = paper.tier === "Higher" ? "H" : "F";
      const examBoardShort = paper.exam_board ? ` ${paper.exam_board}` : "";

      // Extract paper number from title (e.g., "Paper 1", "Paper 2", "Component 1")
      const paperMatch = paper.title.match(/(?:Paper|Component)\s*(\d+)/i);
      const paperNumber = paperMatch ? ` P${paperMatch[1]}` : "";

      return `${paper.year}${tierShort} ${paper.subject}${paperNumber}${examBoardShort}`;
    }
    return paper.title;
  };

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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("pastPapers.title")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("pastPapers.subtitle", {
                count: papers.length,
                plural: papers.length !== 1 ? "s" : ""
              })}
            </p>
          </div>
          <Button onClick={handleCreatePaper}>
            <Plus className="h-4 w-4 mr-2" />
            {t("pastPapers.addPaper")}
          </Button>
        </div>

        {/* Copyright Disclaimer Banner */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Copyright Notice</p>
            <p>
              All past examination papers are the copyright of their respective exam boards (AQA, Pearson Edexcel, OCR, Eduqas/WJEC).
              Revisely.ai does not host, store, or reproduce any exam board content. Links provided open directly on the official exam board websites.
              Revisely.ai is not affiliated with, endorsed by, or connected to any exam board.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {[
            { label: t("pastPapers.totalPapers"), value: papers.length, icon: FileText },
            { label: t("pastPapers.completed"), value: completedCount, icon: CheckCircle },
            { label: t("pastPapers.averageScore"), value: `${Math.round(averageScore)}%`, icon: Star },
            { label: t("pastPapers.studyTime"), value: formatStudyTime(studyTime), icon: Timer },
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
        <div className="flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("pastPapers.searchPlaceholder")}
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
              <SelectItem value="All Subjects">{t("common.allSubjects")}</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedBoard} onValueChange={setSelectedBoard}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Boards">{t("common.allBoards")}</SelectItem>
              {EXAM_BOARDS.map((board) => (
                <SelectItem key={board} value={board}>
                  {board}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Tiers">{t("common.allTiers")}</SelectItem>
              <SelectItem value="Higher">{t("flashcards.higher")}</SelectItem>
              <SelectItem value="Foundation">{t("flashcards.foundation")}</SelectItem>
              <SelectItem value="Unassigned">{t("pastPapers.unassigned")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Papers Grid */}
        {papers.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("pastPapers.noPapers")}</h3>
            <p className="text-muted-foreground mb-4">
              {t("pastPapers.createFirst")}
            </p>
            <Button onClick={handleCreatePaper}>
              <Plus className="h-4 w-4 mr-2" />
              {t("pastPapers.addPaper")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPapers.map((paper, index) => {
              const isCompleted = !!paper.completed_at;
              const scorePercentage =
                paper.score && paper.max_score ? (paper.score / paper.max_score) * 100 : 0;

              return (
                <div
                  key={paper.id}
                  className="glass-card p-5 hover-lift animate-slide-up"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {paper.subject && (
                        <Badge variant="outline">{paper.subject}</Badge>
                      )}
                      {paper.exam_board && (
                        <Badge variant="outline">{paper.exam_board}</Badge>
                      )}
                      {paper.tier && (
                        <Badge variant="secondary" className={paper.tier === "Higher" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"}>
                          {paper.tier}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">{getConciseTitle(paper)}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {paper.subject} • {paper.year}
                  </p>

                  {isCompleted && paper.score !== null && paper.max_score !== null ? (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{t("pastPapers.yourScore")}</span>
                        <span
                          className={cn(
                            "font-bold",
                            scorePercentage >= 70
                              ? "text-secondary"
                              : scorePercentage >= 50
                                ? "text-accent-foreground"
                                : "text-destructive"
                          )}
                        >
                          {Math.round(scorePercentage)}%
                        </span>
                      </div>
                      <Progress value={scorePercentage} className="h-2" />
                    </div>
                  ) : (
                    <div className="mb-4 p-3 rounded-lg bg-muted/50 flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span>{t("pastPapers.notAttempted")}</span>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isCompleted ? "outline" : "default"}
                      className="flex-1"
                      onClick={() => handleReview(paper)}
                    >
                      {isCompleted ? (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          {t("common.review")}
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          {t("pastPapers.startQuiz")}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleGenerateFlashcards(paper)}
                      title={t("pastPapers.generateFlashcards")}
                    >
                      <Layers className="h-4 w-4" />
                    </Button>
                    {paper.file_url && (
                      <>
                        {/* Open paper on official exam board website in new tab */}
                        <Button variant="outline" size="icon" onClick={() => handleOpenPaper(paper)} title="Open on exam board website">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {/* Edit/Delete buttons hidden as requested
              <Button
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => handleEditPaper(paper)}
              >
                <Edit className="h-4 w-4" />
              </Button>
               <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDeletePaper(paper.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              */}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredPapers.length === 0 && papers.length > 0 && (
          <div className="glass-card p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No papers found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPaper ? "Edit Past Paper" : "Create New Past Paper"}</DialogTitle>
            <DialogDescription>
              {editingPaper
                ? "Update your past paper details below"
                : "Fill in the details to create a new past paper"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter paper title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="exam_board">Exam Board</Label>
                {/* Replaced Input with Select */}
                <Select
                  value={formData.exam_board}
                  onValueChange={(value) => setFormData({ ...formData, exam_board: value })}
                >
                  <SelectTrigger id="exam_board">
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_BOARDS.map((board) => (
                      <SelectItem key={board} value={board}>
                        {board}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tier">Tier</Label>
                <Select
                  value={formData.tier}
                  onValueChange={(val: "Foundation" | "Higher") => setFormData({ ...formData, tier: val })}
                >
                  <SelectTrigger id="tier">
                    <SelectValue placeholder="Select Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Higher">Higher Tier</SelectItem>
                    <SelectItem value="Foundation">Foundation Tier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Link to Paper (Official Exam Board URL)</Label>
              <div className="flex gap-2">
                <Input
                  id="file_url"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  placeholder="https://www.aqa.org.uk/find-past-papers-and-mark-schemes"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={handleAutoFill}
                  title="Auto-fill from link"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a link to the official exam board past papers page. Links must point to official exam board websites only (e.g. aqa.org.uk, pearson.com, ocr.org.uk, eduqas.co.uk).
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  type="number"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  placeholder="82"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_score">Max Score</Label>
                <Input
                  id="max_score"
                  type="number"
                  value={formData.max_score}
                  onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                  placeholder="100"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePaper}>
              {editingPaper ? "Update" : "Create"} Paper
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={!!reviewPaper} onOpenChange={(open) => !open && setReviewPaper(null)}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {reviewPaper?.title}
            </DialogTitle>
            <DialogDescription>
              {reviewPaper?.subject} • {reviewPaper?.exam_board} • {reviewPaper?.year}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col md:flex-row border-t overflow-hidden">
            {/* Left: Link to open paper on official exam board site */}
            <div className="flex-1 bg-muted/30 relative min-h-[300px]">
              {reviewPaper?.file_url ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <ExternalLink className="h-12 w-12 text-primary mb-4 opacity-60" />
                  <h4 className="font-semibold mb-2 text-lg">View on Official Website</h4>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                    This paper is hosted on the official exam board website. Click below to open it in a new tab.
                  </p>
                  <Button onClick={() => window.open(reviewPaper.file_url!, "_blank", "noopener,noreferrer")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Paper in New Tab
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4 max-w-xs">
                    © {reviewPaper.exam_board || "Exam Board"}. All rights reserved. Revisely.ai is not affiliated with or endorsed by any exam board.
                  </p>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  No link available for this paper.
                </div>
              )}
            </div>

            {/* Right: Score Entry & Results */}
            <div className="w-full md:w-80 border-l bg-background p-6 space-y-6 overflow-y-auto">
              <div>
                <Label className="text-sm font-medium mb-3 block">Review Results</Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="review-score">Your Score</Label>
                    <Input
                      id="review-score"
                      type="number"
                      placeholder="e.g. 85"
                      defaultValue={reviewPaper?.score || ""}
                      onChange={(e) => {
                        if (reviewPaper) {
                          setReviewPaper({ ...reviewPaper, score: parseInt(e.target.value) || null });
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-max">Max Score</Label>
                    <Input
                      id="review-max"
                      type="number"
                      placeholder="e.g. 100"
                      defaultValue={reviewPaper?.max_score || ""}
                      onChange={(e) => {
                        if (reviewPaper) {
                          setReviewPaper({ ...reviewPaper, max_score: parseInt(e.target.value) || null });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {reviewPaper && reviewPaper.score !== null && reviewPaper.max_score !== null && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Percentage</span>
                    <span className="font-bold text-primary">
                      {Math.round((reviewPaper.score / reviewPaper.max_score) * 100)}%
                    </span>
                  </div>
                  <Progress value={(reviewPaper.score / reviewPaper.max_score) * 100} className="h-2" />
                </div>
              )}

              <div className="pt-4 border-t space-y-2">
                <Button
                  className="w-full"
                  onClick={async () => {
                    if (!reviewPaper || !user) return;
                    try {
                      const { error } = await supabase
                        .from("past_papers")
                        .update({
                          score: reviewPaper.score,
                          max_score: reviewPaper.max_score,
                          completed_at: reviewPaper.score !== null ? new Date().toISOString() : null,
                        })
                        .eq("id", reviewPaper.id);

                      if (error) throw error;

                      toast({
                        title: "Review Saved",
                        description: "Your scores have been updated.",
                      });
                      setReviewPaper(null);
                      fetchPapers();
                    } catch (e: any) {
                      toast({
                        title: "Error",
                        description: e.message,
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Save Results
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setReviewPaper(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>

  );
}
