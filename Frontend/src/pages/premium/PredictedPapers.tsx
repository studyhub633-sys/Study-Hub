import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { hasPremium } from "@/lib/premium";
import {
  Crown,
  Download,
  FileText,
  Link as LinkIcon,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PredictedPaper {
  id: string;
  title: string;
  subject: string | null;
  year: number | null;
  exam_board: string | null;
  tier: "Foundation" | "Higher" | null;
  file_url: string | null;
  file_type: "link" | "upload" | null;
  description: string | null;
  release_date: string | null;
  created_at: string;
}

export default function PredictedPapers() {
  const { supabase, user } = useAuth();
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);
  const [papers, setPapers] = useState<PredictedPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedBoard, setSelectedBoard] = useState("All Boards");
  const [selectedTier, setSelectedTier] = useState("All Tiers");

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
      fetchPapers();
    }
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user || !supabase) return;
    try {
      const premium = await hasPremium(supabase);
      setIsPremium(premium);
      if (!premium) {
        toast.error("This is a premium feature. Please upgrade to access.");
        navigate("/premium-dashboard");
      }
    } catch (error) {
      console.error("Error checking premium status:", error);
    } finally {
      setCheckingPremium(false);
    }
  };

  const fetchPapers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("premium_predicted_papers")
        .select("*")
        .eq("is_premium", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPapers(data || []);
    } catch (error: any) {
      console.error("Error fetching predicted papers:", error);
      toast.error("Failed to load predicted papers.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPapers = () => {
    return papers.filter((paper) => {
      const matchesSearch =
        !searchQuery ||
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.subject?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject =
        selectedSubject === "All Subjects" || paper.subject === selectedSubject;

      const matchesBoard =
        selectedBoard === "All Boards" || paper.exam_board === selectedBoard;

      const matchesTier =
        selectedTier === "All Tiers" ||
        !paper.tier ||
        paper.tier === selectedTier;

      return matchesSearch && matchesSubject && matchesBoard && matchesTier;
    });
  };

  const getUniqueSubjects = () => {
    const subjects = papers
      .map((p) => p.subject)
      .filter((s): s is string => s !== null);
    return Array.from(new Set(subjects)).sort();
  };

  const getUniqueBoards = () => {
    const boards = papers
      .map((p) => p.exam_board)
      .filter((b): b is string => b !== null);
    return Array.from(new Set(boards)).sort();
  };

  const handleOpenPaper = (paper: PredictedPaper) => {
    if (paper.file_url) {
      if (paper.file_type === "link") {
        window.open(paper.file_url, "_blank");
      } else {
        window.open(paper.file_url, "_blank");
      }
    }
  };

  if (checkingPremium) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!isPremium) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-[60vh] gap-4">
          <Crown className="h-16 w-16 text-premium" />
          <h2 className="text-2xl font-bold">Premium Feature</h2>
          <p className="text-muted-foreground">
            This feature is available for premium members only.
          </p>
          <Button onClick={() => navigate("/premium-dashboard")}>
            Upgrade to Premium
          </Button>
        </div>
      </AppLayout>
    );
  }

  const filteredPapers = getFilteredPapers();
  const uniqueSubjects = getUniqueSubjects();
  const uniqueBoards = getUniqueBoards();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-premium/10">
              <Sparkles className="h-6 w-6 text-premium" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                2026 Predicted Papers
              </h1>
              <p className="text-muted-foreground">
                Exclusive predicted exam papers available to premium members
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-6 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search papers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Subjects">All Subjects</SelectItem>
                {uniqueSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBoard} onValueChange={setSelectedBoard}>
              <SelectTrigger>
                <SelectValue placeholder="All Boards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Boards">All Boards</SelectItem>
                {uniqueBoards.map((board) => (
                  <SelectItem key={board} value={board}>
                    {board}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger>
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Tiers">All Tiers</SelectItem>
                <SelectItem value="Foundation">Foundation</SelectItem>
                <SelectItem value="Higher">Higher</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Papers Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredPapers.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {papers.length === 0
                ? "No Predicted Papers Available Yet"
                : "No Papers Match Your Filters"}
            </h3>
            <p className="text-muted-foreground">
              {papers.length === 0
                ? "Check back soon for exclusive 2026 predicted papers!"
                : "Try adjusting your search or filter criteria."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPapers.map((paper) => (
              <Card
                key={paper.id}
                className="hover-lift transition-all cursor-pointer group"
                onClick={() => handleOpenPaper(paper)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="bg-premium/10 text-premium">
                      {paper.year || 2026}
                    </Badge>
                    {paper.file_type === "link" ? (
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-premium transition-colors">
                    {paper.title}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap gap-2 mt-2">
                    {paper.subject && (
                      <Badge variant="outline">{paper.subject}</Badge>
                    )}
                    {paper.exam_board && (
                      <Badge variant="outline">{paper.exam_board}</Badge>
                    )}
                    {paper.tier && (
                      <Badge variant="outline">{paper.tier}</Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paper.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {paper.description}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-premium group-hover:text-premium-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPaper(paper);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    View Paper
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        {papers.length > 0 && (
          <Card className="mt-8 bg-premium/5 border-premium/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-premium mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Exclusive Premium Content
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    These predicted papers are exclusively available to premium
                    members. They are designed to help you prepare for your 2026
                    exams with the most up-to-date predictions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

