import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Plus,
  Edit,
  Trash2,
  Loader2,
  Upload,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Paper {
  id: string;
  title: string;
  subject: string | null;
  year: number | null;
  exam_board: string | null;
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
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedBoard, setSelectedBoard] = useState("All Boards");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    year: "",
    exam_board: "",
    file_url: "",
    file_type: "link" as "link" | "upload",
    file: null as File | null,
    score: "",
    max_score: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPapers();
    }
  }, [user]);

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
      file_url: "",
      file_type: "link",
      file: null,
      score: "",
      max_score: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditPaper = (paper: Paper) => {
    setEditingPaper(paper);
    // Determine file type: if file_url exists and starts with http, it's a link, otherwise it's an upload
    const isLink = paper.file_url?.startsWith("http://") || paper.file_url?.startsWith("https://");
    setFormData({
      title: paper.title,
      subject: paper.subject || "",
      year: paper.year?.toString() || "",
      exam_board: paper.exam_board || "",
      file_url: paper.file_url || "",
      file_type: (paper.file_type || (isLink ? "link" : "upload")) as "link" | "upload",
      file: null,
      score: paper.score?.toString() || "",
      max_score: paper.max_score?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `past-papers/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from("past-papers")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from("past-papers").getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
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

    try {
      let fileUrl = formData.file_url;

      // If uploading a file, upload it first
      if (formData.file_type === "upload" && formData.file) {
        const uploadedUrl = await handleFileUpload(formData.file);
        if (!uploadedUrl) {
          return; // Error already shown in handleFileUpload
        }
        fileUrl = uploadedUrl;
      } else if (formData.file_type === "link" && !formData.file_url.trim()) {
        fileUrl = null;
      }

      const updateData: any = {
        user_id: user.id,
        title: formData.title,
        subject: formData.subject || null,
        year: formData.year ? parseInt(formData.year) : null,
        exam_board: formData.exam_board || null,
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

  const handleDownload = async (paper: Paper) => {
    if (!paper.file_url) {
      toast({
        title: "No file available",
        description: "This paper doesn't have a file attached yet.",
        variant: "destructive",
      });
      return;
    }

    // If it's an uploaded file, download it
    if (paper.file_type === "upload" || (!paper.file_type && !paper.file_url.startsWith("http"))) {
      try {
        const response = await fetch(paper.file_url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${paper.title.replace(/\s+/g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        // Fallback to opening in new tab
        window.open(paper.file_url, "_blank");
      }
    } else {
      // For links, just open in new tab
      window.open(paper.file_url, "_blank");
    }
  };

  const handleReview = (paper: Paper) => {
    // Open review dialog or navigate to review page
    toast({
      title: "Review Paper",
      description: `Reviewing ${paper.title}. Feature coming soon!`,
    });
  };

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All Subjects" || paper.subject === selectedSubject;
    const matchesBoard = selectedBoard === "All Boards" || paper.exam_board === selectedBoard;
    return matchesSearch && matchesSubject && matchesBoard;
  });

  const completedCount = papers.filter((p) => p.completed_at).length;
  const completedWithScores = papers.filter((p) => p.score !== null && p.max_score !== null);
  const averageScore =
    completedWithScores.length > 0
      ? completedWithScores.reduce((acc, p) => acc + ((p.score || 0) / (p.max_score || 1)) * 100, 0) /
        completedWithScores.length
      : 0;

  const subjects = Array.from(new Set(papers.map((p) => p.subject).filter(Boolean)));
  const examBoards = Array.from(new Set(papers.map((p) => p.exam_board).filter(Boolean)));

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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Past Papers</h1>
            <p className="text-muted-foreground mt-1">
              {papers.length} paper{papers.length !== 1 ? "s" : ""} from various exam boards
            </p>
          </div>
          <Button onClick={handleCreatePaper}>
            <Plus className="h-4 w-4 mr-2" />
            Add Paper
          </Button>
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
              <SelectItem value="All Subjects">All Subjects</SelectItem>
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
              <SelectItem value="All Boards">All Boards</SelectItem>
              {examBoards.map((board) => (
                <SelectItem key={board} value={board}>
                  {board}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Papers Grid */}
        {papers.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No past papers yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first past paper to get started
            </p>
            <Button onClick={handleCreatePaper}>
              <Plus className="h-4 w-4 mr-2" />
              Add Paper
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
                  style={{ animationDelay: `${0.1 * index}s`, opacity: 0 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {paper.subject && (
                        <Badge variant="outline">{paper.subject}</Badge>
                      )}
                      {paper.exam_board && (
                        <Badge variant="outline">{paper.exam_board}</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditPaper(paper)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeletePaper(paper.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">{paper.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {paper.subject} • {paper.year}
                  </p>

                  {isCompleted && paper.score !== null && paper.max_score !== null ? (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Your Score</span>
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
                      <span>Not attempted yet</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant={isCompleted ? "outline" : "default"}
                      className="flex-1"
                      onClick={() => handleReview(paper)}
                    >
                      {isCompleted ? (
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
                    {paper.file_url && (
                      <>
                        {/* Show Download button only for uploaded files */}
                        {(paper.file_type === "upload" || (!paper.file_type && paper.file_url && !paper.file_url.startsWith("http"))) && (
                          <Button variant="outline" size="icon" onClick={() => handleDownload(paper)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {/* For links, we only show Review button (already shown above) */}
                      </>
                    )}
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
                <Input
                  id="exam_board"
                  value={formData.exam_board}
                  onChange={(e) => setFormData({ ...formData, exam_board: e.target.value })}
                  placeholder="e.g., AQA"
                />
              </div>
            </div>
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
              <Label>File Attachment</Label>
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant={formData.file_type === "link" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, file_type: "link", file: null })}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Link
                </Button>
                <Button
                  type="button"
                  variant={formData.file_type === "upload" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, file_type: "upload", file_url: "" })}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
              {formData.file_type === "link" ? (
                <div className="space-y-2">
                  <Input
                    id="file_url"
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    placeholder="https://example.com/past-paper.pdf"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a link to the past paper (e.g., Google Drive, Dropbox, etc.)
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Validate file size (max 10MB)
                        if (file.size > 10 * 1024 * 1024) {
                          toast({
                            title: "File too large",
                            description: "Please upload a file smaller than 10MB.",
                            variant: "destructive",
                          });
                          return;
                        }
                        setFormData({ ...formData, file });
                      }
                    }}
                    className="cursor-pointer"
                  />
                  {formData.file && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload PDF, Word, or text files (max 10MB)
                  </p>
                </div>
              )}
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
            <Button onClick={handleSavePaper} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  {editingPaper ? "Update" : "Create"} Paper
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
