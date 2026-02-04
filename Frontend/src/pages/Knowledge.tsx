import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { generateKnowledgeOrganizer } from "@/lib/ai-client";
import { EXAM_BOARDS } from "@/lib/constants";
import { hasPremium } from "@/lib/premium";
import { cn } from "@/lib/utils";
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import {
  Brain,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Download,
  Edit,
  FileImage,
  FileText,
  Layers,
  Lightbulb,
  Loader2,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

interface KeyPoint {
  text: string;
  mastered?: boolean;
  lastReviewed?: string;
}

interface KnowledgeSection {
  title: string;
  content: string;
  keyPoints: KeyPoint[];
  color: string;
  reviewed?: boolean;
  lastReviewedAt?: string;
}

interface KnowledgeOrganizer {
  id: string;
  title: string;
  subject: string | null;
  topic: string | null;
  tier: "Foundation" | "Higher" | null;
  content: any; // JSONB from database
  created_at: string;
  updated_at: string;
}

export default function Knowledge() {
  const { supabase, user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [organizers, setOrganizers] = useState<KnowledgeOrganizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedBoard, setSelectedBoard] = useState("All Boards");
  const [selectedTier, setSelectedTier] = useState("All Tiers");
  const [selectedOrganizer, setSelectedOrganizer] = useState<KnowledgeOrganizer | null>(null);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrganizer, setEditingOrganizer] = useState<KnowledgeOrganizer | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    topic: "",
    exam_board: "",
    tier: "" as "Foundation" | "Higher" | "",
    sections: [] as KnowledgeSection[],
  });
  const [reviewingSection, setReviewingSection] = useState<number | null>(null);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSubject, setAiSubject] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiUsageCount, setAiUsageCount] = useState<number | null>(null);
  const [aiLimit, setAiLimit] = useState<number>(10);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const organizerContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchOrganizers();
      fetchAiUsageCount();
    }
  }, [user]);

  const fetchAiUsageCount = async () => {
    if (!user || !supabase) return;

    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from("ai_usage_tracking")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gt("created_at", oneDayAgo);

      if (error) {
        console.error("Error fetching AI usage count:", error);
        // Table might not exist yet, that's okay
        return;
      }

      const isPremium = await hasPremium(supabase);
      const limit = isPremium ? 1000000 : 10;

      setAiUsageCount(count || 0);
      setAiLimit(limit);
      setIsPremiumUser(isPremium);
    } catch (error) {
      console.error("Error fetching AI usage count:", error);
    }
  };

  // Handle navigation state from other pages (e.g., AI Tutor)
  useEffect(() => {
    if (location.state?.context && selectedOrganizer) {
      // Context was passed, could be used for future features
    }
  }, [location.state, selectedOrganizer]);

  // Auto-calculate progress based on reviewed sections
  const calculateProgress = (organizer: KnowledgeOrganizer): number => {
    const sections = organizer.content?.sections || [];
    if (sections.length === 0) return 0;

    const reviewedSections = sections.filter((s: KnowledgeSection) => s.reviewed).length;
    return Math.round((reviewedSections / sections.length) * 100);
  };

  const fetchOrganizers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("knowledge_organizers")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setOrganizers(data || []);
      if (data && data.length > 0 && !selectedOrganizer) {
        setSelectedOrganizer(data[0]);
        // Open first section by default
        const firstOrg = data[0];
        if (firstOrg.content?.sections && firstOrg.content.sections.length > 0) {
          setOpenSections([firstOrg.content.sections[0].title]);
        }
      }
    } catch (error: any) {
      console.error("Error fetching organizers:", error);
      toast({
        title: "Error",
        description: "Failed to load knowledge organizers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganizer = () => {
    setEditingOrganizer(null);
    setFormData({
      title: "",
      subject: "",
      topic: "",
      exam_board: "",
      tier: "",
      sections: [],
    });
    setIsDialogOpen(true);
  };

  const handleGenerateWithAI = async () => {
    if (!user || !aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate a knowledge organizer",
        variant: "destructive",
      });
      return;
    }

    // Check usage limit
    if (aiUsageCount !== null && aiUsageCount >= aiLimit) {
      toast({
        title: "Limit Reached",
        description: `You have reached the daily limit of AI generation attempts. Please upgrade to premium for higher limits (500/day).`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateKnowledgeOrganizer(
        {
          prompt: aiPrompt,
          subject: aiSubject || undefined,
          topic: aiTopic || undefined,
        },
        supabase
      );

      if (result.error) {
        if (result.error.includes("limit") || result.error.includes("429")) {
          toast({
            title: "Limit Reached",
            description: result.error,
            variant: "destructive",
          });
          fetchAiUsageCount(); // Refresh count
        } else {
          throw new Error(result.error);
        }
        return;
      }

      if (result.data?.sections) {
        // Pre-fill the form with generated content
        setFormData({
          title: aiTopic || aiSubject || "AI Generated Organizer",
          subject: aiSubject || "",
          topic: aiTopic || "",
          exam_board: "",
          tier: "",
          sections: result.data.sections,
        });
        setIsAiDialogOpen(false);
        setIsDialogOpen(true);
        setAiPrompt("");
        setAiSubject("");
        setAiTopic("");

        // Update usage count
        if (result.data.usageCount !== undefined) {
          setAiUsageCount(result.data.usageCount);
        }

        toast({
          title: "Success",
          description: `Generated ${result.data.sections.length} sections! Review and edit before saving.`,
        });
      }
    } catch (error: any) {
      console.error("Error generating knowledge organizer:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate knowledge organizer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditOrganizer = (org: KnowledgeOrganizer) => {
    setEditingOrganizer(org);
    const sections = org.content?.sections || [];
    // Normalize keyPoints: convert old string[] format to new KeyPoint[] format
    const normalizedSections = sections.map((section: any) => ({
      ...section,
      keyPoints: section.keyPoints?.map((kp: any) =>
        typeof kp === "string" ? { text: kp, mastered: false } : kp
      ) || [],
    }));
    setFormData({
      title: org.title,
      subject: org.subject || "",
      topic: org.topic || "",
      exam_board: org.content?.exam_board || "",
      tier: org.tier || "",
      sections: normalizedSections,
    });
    setIsDialogOpen(true);
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [
        ...formData.sections,
        {
          title: "",
          content: "",
          keyPoints: [],
          color: "primary",
        },
      ],
    });
  };

  const removeSection = (index: number) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter((_, i) => i !== index),
    });
  };

  const updateSection = (index: number, field: keyof KnowledgeSection, value: any) => {
    const newSections = [...formData.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setFormData({ ...formData, sections: newSections });
  };

  const addKeyPoint = (sectionIndex: number) => {
    const newSections = [...formData.sections];
    const currentKeyPoints = newSections[sectionIndex].keyPoints || [];
    const normalizedKeyPoints = currentKeyPoints.map((kp: any) =>
      typeof kp === "string" ? { text: kp, mastered: false } : kp
    );
    normalizedKeyPoints.push({ text: "", mastered: false });
    newSections[sectionIndex].keyPoints = normalizedKeyPoints;
    setFormData({ ...formData, sections: newSections });
  };

  const removeKeyPoint = (sectionIndex: number, pointIndex: number) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].keyPoints = newSections[sectionIndex].keyPoints.filter(
      (_, i) => i !== pointIndex
    );
    setFormData({ ...formData, sections: newSections });
  };

  const updateKeyPoint = (sectionIndex: number, pointIndex: number, value: string) => {
    const newSections = [...formData.sections];
    const currentKeyPoints = newSections[sectionIndex].keyPoints || [];
    const normalizedKeyPoints = currentKeyPoints.map((kp: any) =>
      typeof kp === "string" ? { text: kp, mastered: false } : kp
    );
    normalizedKeyPoints[pointIndex] = { ...normalizedKeyPoints[pointIndex], text: value };
    newSections[sectionIndex].keyPoints = normalizedKeyPoints;
    setFormData({ ...formData, sections: newSections });
  };

  const toggleKeyPointMastery = (sectionIndex: number, pointIndex: number) => {
    const newSections = [...formData.sections];
    const currentKeyPoints = newSections[sectionIndex].keyPoints || [];
    const normalizedKeyPoints = currentKeyPoints.map((kp: any) =>
      typeof kp === "string" ? { text: kp, mastered: false } : kp
    );
    normalizedKeyPoints[pointIndex] = {
      ...normalizedKeyPoints[pointIndex],
      mastered: !normalizedKeyPoints[pointIndex].mastered,
      lastReviewed: normalizedKeyPoints[pointIndex].mastered
        ? normalizedKeyPoints[pointIndex].lastReviewed
        : new Date().toISOString(),
    };
    newSections[sectionIndex].keyPoints = normalizedKeyPoints;
    setFormData({ ...formData, sections: newSections });
  };

  const handleSaveOrganizer = async () => {
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

    // Validate sections
    const validSections = formData.sections.filter(
      (s) => s.title.trim() && s.content.trim()
    );

    try {
      // Progress is now auto-calculated, don't store it manually
      const contentData = {
        sections: validSections,
        exam_board: formData.exam_board,
      };

      const updateData: any = {
        user_id: user.id,
        title: formData.title,
        subject: formData.subject || null,
        topic: formData.topic || null,
        tier: formData.tier || null,
        content: contentData,
      };

      if (editingOrganizer) {
        const { error } = await supabase
          .from("knowledge_organizers")
          .update(updateData)
          .eq("id", editingOrganizer.id)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Knowledge organizer updated successfully",
        });
      } else {
        const { error } = await supabase.from("knowledge_organizers").insert(updateData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Knowledge organizer created successfully",
        });
      }

      setIsDialogOpen(false);
      fetchOrganizers();
    } catch (error: any) {
      console.error("Error saving organizer:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save knowledge organizer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkSectionReviewed = async (sectionIndex: number) => {
    if (!selectedOrganizer || !user) return;

    try {
      setReviewingSection(sectionIndex);
      const sections = [...(selectedOrganizer.content?.sections || [])];

      if (sections[sectionIndex]) {
        sections[sectionIndex].reviewed = true;
        sections[sectionIndex].lastReviewedAt = new Date().toISOString();
      }

      // Update organizer in database
      const { error: updateError } = await supabase
        .from("knowledge_organizers")
        .update({ content: { sections } })
        .eq("id", selectedOrganizer.id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Track study session
      const { error: sessionError } = await supabase
        .from("study_sessions")
        .insert({
          user_id: user.id,
          organizer_id: selectedOrganizer.id,
          duration: 0, // Could be enhanced to track actual time
          sections_reviewed: [sectionIndex],
          date: new Date().toISOString(),
        });

      if (sessionError) {
        console.warn("Failed to track study session:", sessionError);
        // Don't fail the whole operation if session tracking fails
      }

      // Update local state
      const updatedOrganizer = {
        ...selectedOrganizer,
        content: { ...selectedOrganizer.content, sections },
      };
      setSelectedOrganizer(updatedOrganizer);

      // Update in organizers list
      setOrganizers((prev) =>
        prev.map((org) => (org.id === selectedOrganizer.id ? updatedOrganizer : org))
      );

      toast({
        title: "Section Reviewed",
        description: `"${sections[sectionIndex].title}" marked as reviewed`,
      });
    } catch (error: any) {
      console.error("Error marking section as reviewed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to mark section as reviewed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setReviewingSection(null);
    }
  };

  const handleToggleKeyPointMastery = async (sectionIndex: number, pointIndex: number) => {
    if (!selectedOrganizer || !user) return;

    try {
      const sections = [...(selectedOrganizer.content?.sections || [])];
      const section = sections[sectionIndex];
      if (!section || !section.keyPoints) return;

      // Normalize keyPoints
      const normalizedKeyPoints = section.keyPoints.map((kp: any) =>
        typeof kp === "string" ? { text: kp, mastered: false } : kp
      );

      // Toggle mastery
      normalizedKeyPoints[pointIndex] = {
        ...normalizedKeyPoints[pointIndex],
        mastered: !normalizedKeyPoints[pointIndex].mastered,
        lastReviewed: normalizedKeyPoints[pointIndex].mastered
          ? normalizedKeyPoints[pointIndex].lastReviewed
          : new Date().toISOString(),
      };

      sections[sectionIndex] = {
        ...section,
        keyPoints: normalizedKeyPoints,
      };

      // Update organizer in database
      const { error: updateError } = await supabase
        .from("knowledge_organizers")
        .update({ content: { sections } })
        .eq("id", selectedOrganizer.id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Update local state
      const updatedOrganizer = {
        ...selectedOrganizer,
        content: { ...selectedOrganizer.content, sections },
      };
      setSelectedOrganizer(updatedOrganizer);

      // Update in organizers list
      setOrganizers((prev) =>
        prev.map((org) => (org.id === selectedOrganizer.id ? updatedOrganizer : org))
      );
    } catch (error: any) {
      console.error("Error toggling key point mastery:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update key point. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrganizer = async (orgId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this knowledge organizer?")) return;

    try {
      const { error } = await supabase
        .from("knowledge_organizers")
        .delete()
        .eq("id", orgId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Knowledge organizer deleted successfully",
      });

      if (selectedOrganizer?.id === orgId) {
        setSelectedOrganizer(null);
      }

      fetchOrganizers();
    } catch (error: any) {
      console.error("Error deleting organizer:", error);
      toast({
        title: "Error",
        description: "Failed to delete knowledge organizer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (format: 'png' | 'pdf' = 'png') => {
    if (!selectedOrganizer || !organizerContentRef.current) {
      toast({
        title: "Error",
        description: "No organizer selected or content not ready",
        variant: "destructive",
      });
      return;
    }

    setDownloading(true);
    // Store current open sections to restore later
    const previousOpenSections = openSections;

    try {
      // Expand all sections to capture full content
      const allSections = selectedOrganizer.content?.sections?.map((s: KnowledgeSection) => s.title) || [];
      if (allSections.length > 0) {
        setOpenSections(allSections);
        // Wait for expansion animation (300ms should be enough given duration-200)
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Determine background color based on current theme to ensure text definition
      const isDarkMode = document.documentElement.classList.contains("dark");
      // Use Slate-950 for dark mode, White for light mode matches the bg-white dark:bg-slate-950 class
      const backgroundColor = isDarkMode ? '#020617' : '#ffffff';

      // Create a high-quality image from the organizer content
      const dataUrl = await htmlToImage.toPng(organizerContentRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: backgroundColor,
        filter: (node) => {
          // Exclude elements with 'export-exclude' class (buttons, etc)
          if (node instanceof HTMLElement && node.classList.contains('export-exclude')) {
            return false;
          }
          return true;
        }
      });

      const fileName = selectedOrganizer.title.replace(/\s+/g, "_");

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // PDF generation
        const pdf = new jsPDF({
          orientation: 'portrait',
        });
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${fileName}.pdf`);
      }

      toast({
        title: "Downloaded!",
        description: `Knowledge organizer saved as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Failed to download knowledge organizer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOpenSections(previousOpenSections);
      setDownloading(false);
    }
  };

  const handleTestKnowledge = () => {
    if (!selectedOrganizer) return;
    // Navigate to AI tutor with context from the organizer
    const context = selectedOrganizer.content?.sections
      ?.map((s: KnowledgeSection) => `${s.title}: ${s.content}`)
      .join("\n\n") || "";
    navigate("/ai-tutor", {
      state: {
        context,
        mode: "question",
        organizerTitle: selectedOrganizer.title,
      }
    });
  };

  const handleCreateFlashcards = async () => {
    if (!selectedOrganizer || !user) return;

    try {
      // Collect all content from sections
      const allContent = selectedOrganizer.content?.sections
        ?.map((s: any) => `${s.title}: ${s.content}\nKey Points: ${s.keyPoints?.map((kp: any) => typeof kp === "string" ? kp : kp.text).join(", ") || ""}`)
        .join("\n\n") || "";

      if (!allContent.trim()) {
        toast({
          title: "No content",
          description: "This organizer doesn't have any content to create flashcards from.",
          variant: "destructive",
        });
        return;
      }

      // Navigate to flashcards page with content to generate
      navigate("/flashcards", {
        state: {
          organizerContent: allContent,
          subject: selectedOrganizer.subject || "General",
          topic: selectedOrganizer.topic,
        },
      });
    } catch (error: any) {
      console.error("Error preparing flashcards:", error);
      toast({
        title: "Error",
        description: "Failed to proceed to flashcards.",
        variant: "destructive",
      });
    }
  };

  const filteredOrganizers = organizers.filter((org) => {
    const matchesSearch = (org.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All Subjects" || org.subject === selectedSubject;
    const orgBoard = org.content?.exam_board;
    const matchesBoard = selectedBoard === "All Boards" || orgBoard === selectedBoard;
    const matchesTier = selectedTier === "All Tiers" ||
      (selectedTier === "Unassigned" && !org.tier) ||
      (org.tier?.toLowerCase() === selectedTier.toLowerCase());
    return matchesSearch && matchesSubject && matchesBoard && matchesTier;
  });

  // Sync selectedOrganizer with filters - if current selection is no longer in filtered list, select first match
  useEffect(() => {
    if (selectedOrganizer && filteredOrganizers.length > 0) {
      const isSelectedInFiltered = filteredOrganizers.some(org => org.id === selectedOrganizer.id);
      if (!isSelectedInFiltered) {
        setSelectedOrganizer(filteredOrganizers[0]);
        if (filteredOrganizers[0].content?.sections?.length > 0) {
          setOpenSections([filteredOrganizers[0].content.sections[0].title]);
        }
      }
    } else if (selectedOrganizer && filteredOrganizers.length === 0) {
      setSelectedOrganizer(null);
    } else if (!selectedOrganizer && filteredOrganizers.length > 0) {
      setSelectedOrganizer(filteredOrganizers[0]);
      if (filteredOrganizers[0].content?.sections?.length > 0) {
        setOpenSections([filteredOrganizers[0].content.sections[0].title]);
      }
    }
  }, [searchQuery, selectedSubject, selectedBoard, selectedTier, filteredOrganizers.length]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const subjects = Array.from(new Set(organizers.map((o) => o.subject).filter(Boolean)));
  const sections = selectedOrganizer?.content?.sections || [];
  const progress = selectedOrganizer ? calculateProgress(selectedOrganizer) : 0;

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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("knowledge.title")}</h1>
            <p className="text-muted-foreground mt-1">{t("knowledge.subtitle")}</p>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => setIsAiDialogOpen(true)} className="whitespace-nowrap">
              <Brain className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="whitespace-nowrap">{t("knowledge.generateAI")}</span>
              {aiUsageCount !== null && (
                <span className="ml-2 text-xs opacity-70 whitespace-nowrap">
                  {isPremiumUser ? "(∞)" : `(${aiLimit - aiUsageCount})`}
                </span>
              )}
            </Button>
            <Button onClick={handleCreateOrganizer}>
              <Plus className="h-4 w-4 mr-2" />
              {t("knowledge.createOrganizer")}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("knowledge.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Subjects">{t("knowledge.allSubjects")}</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedBoard} onValueChange={setSelectedBoard}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Boards">{t("knowledge.allBoards")}</SelectItem>
              {EXAM_BOARDS.map((board) => (
                <SelectItem key={board} value={board}>
                  {board}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-full sm:w-[150px]">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Organizers List - Scrollable */}
          <div className={cn(
            "lg:col-span-1 animate-slide-up",
            mobileShowDetail ? "hidden lg:block" : "block"
          )} style={{ animationDelay: "0.2s", opacity: 0 }}>
            <ScrollArea className="h-[calc(100vh-280px)] lg:h-[calc(100vh-220px)] rounded-lg">
              <div className="space-y-3 pr-3">
                {organizers.length === 0 ? (
                  <div className="glass-card p-8 text-center">
                    <Brain className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">{t("knowledge.noOrganizers")}</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first knowledge organiser, generate one with AI, or add from the{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/library")}
                        className="text-primary hover:underline font-medium"
                      >
                        Global Library
                      </button>{" "}
                      (Organisers tab).
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button onClick={handleCreateOrganizer}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("knowledge.createOrganizer")}
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/library")}>
                        {t("library.title")}
                      </Button>
                    </div>
                  </div>
                ) : filteredOrganizers.length === 0 ? (
                  <div className="glass-card p-8 text-center">
                    <Brain className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No organizers found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or create a new organizer
                    </p>
                    <Button variant="outline" onClick={() => {
                      setSelectedSubject("All Subjects");
                      setSelectedBoard("All Boards");
                      setSelectedTier("All Tiers");
                      setSearchQuery("");
                    }}>
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  filteredOrganizers.map((org) => {
                    const orgProgress = calculateProgress(org);
                    return (
                      <button
                        key={org.id}
                        onClick={() => {
                          setSelectedOrganizer(org);
                          setMobileShowDetail(true);
                          if (org.content?.sections && org.content.sections.length > 0) {
                            setOpenSections([org.content.sections[0].title]);
                          }
                        }}
                        className={cn(
                          "w-full text-left p-4 rounded-xl transition-all duration-200",
                          selectedOrganizer?.id === org.id
                            ? "glass-card border-primary/30 shadow-glow"
                            : "bg-muted/50 hover:bg-muted"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                            <Brain className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">{org.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {org.subject || "General"} • {org.topic || "General"}
                              {org.tier && (
                                <Badge variant="secondary" className={cn("text-[10px] h-4 px-1 ml-1", org.tier === "Higher" ? "text-red-500 bg-red-500/10" : "text-green-500 bg-green-500/10")}>
                                  {org.tier}
                                </Badge>
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all duration-500"
                                  style={{ width: `${orgProgress}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">{orgProgress}%</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Organizer Detail */}
          <div className={cn(
            "lg:col-span-2",
            mobileShowDetail ? "block" : "hidden lg:block"
          )}>
            <div className="lg:sticky lg:top-24 animate-slide-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
              {selectedOrganizer ? (
                <div ref={organizerContentRef} className="glass-card p-6 md:p-8 bg-white dark:bg-slate-950">
                  {/* Mobile Back Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden mb-4 -ml-2 export-exclude"
                    onClick={() => setMobileShowDetail(false)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to List
                  </Button>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {selectedOrganizer.subject && (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {selectedOrganizer.subject}
                          </span>
                        )}
                        {selectedOrganizer.topic && (
                          <span className="text-xs text-muted-foreground">{selectedOrganizer.topic}</span>
                        )}
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground">
                        {selectedOrganizer.title}
                      </h2>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 max-w-[200px]">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Last updated {formatTimeAgo(selectedOrganizer.updated_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 export-exclude">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditOrganizer(selectedOrganizer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteOrganizer(selectedOrganizer.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" disabled={downloading}>
                            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownload('png')}>
                            <FileImage className="h-4 w-4 mr-2" />
                            Download as PNG
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                            <FileText className="h-4 w-4 mr-2" />
                            Download as PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Sections */}
                  {sections.length > 0 ? (
                    <div className="space-y-4">
                      {sections.map((section: KnowledgeSection, index: number) => (
                        <Collapsible
                          key={section.title}
                          open={openSections.includes(section.title)}
                          onOpenChange={() => toggleSection(section.title)}
                        >
                          <CollapsibleTrigger className="w-full">
                            <div
                              className={cn(
                                "flex items-center justify-between p-4 rounded-xl transition-all duration-200",
                                section.color === "primary" && "bg-primary/10 hover:bg-primary/15",
                                section.color === "secondary" && "bg-secondary/10 hover:bg-secondary/15",
                                section.color === "accent" && "bg-accent/20 hover:bg-accent/25"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                    section.color === "primary" && "bg-primary text-primary-foreground",
                                    section.color === "secondary" && "bg-secondary text-secondary-foreground",
                                    section.color === "accent" && "bg-accent text-accent-foreground"
                                  )}
                                >
                                  {index + 1}
                                </div>
                                <span className="font-semibold text-foreground">{section.title}</span>
                              </div>
                              <ChevronDown
                                className={cn(
                                  "h-5 w-5 text-muted-foreground transition-transform duration-200",
                                  openSections.includes(section.title) && "rotate-180"
                                )}
                              />
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="p-4 pt-2 ml-11 space-y-4">
                              <div className="flex items-start justify-between gap-4">
                                <p className="text-foreground whitespace-pre-wrap flex-1">{section.content}</p>
                                {!section.reviewed && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMarkSectionReviewed(index)}
                                    disabled={reviewingSection === index}
                                    className="flex-shrink-0"
                                  >
                                    {reviewingSection === index ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                    )}
                                    Mark as Reviewed
                                  </Button>
                                )}
                                {section.reviewed && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span>Reviewed</span>
                                    {section.lastReviewedAt && (
                                      <span className="text-xs">
                                        {formatTimeAgo(section.lastReviewedAt)}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {section.keyPoints && section.keyPoints.length > 0 && (
                                <div
                                  className={cn(
                                    "p-4 rounded-lg",
                                    section.color === "primary" && "bg-primary/5 border border-primary/20",
                                    section.color === "secondary" && "bg-secondary/5 border border-secondary/20",
                                    section.color === "accent" && "bg-accent/10 border border-accent/20"
                                  )}
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <Lightbulb
                                      className={cn(
                                        "h-4 w-4",
                                        section.color === "primary" && "text-primary",
                                        section.color === "secondary" && "text-secondary",
                                        section.color === "accent" && "text-accent-foreground"
                                      )}
                                    />
                                    <span className="text-sm font-semibold text-foreground">Key Points</span>
                                  </div>
                                  <ul className="space-y-2">
                                    {section.keyPoints.map((point: any, i: number) => {
                                      const pointText = typeof point === "string" ? point : point.text;
                                      const isMastered = typeof point === "object" ? point.mastered : false;
                                      return (
                                        <li key={i} className="flex items-start gap-2 text-sm text-foreground group">
                                          <button
                                            onClick={() => handleToggleKeyPointMastery(index, i)}
                                            className={cn(
                                              "h-4 w-4 mt-0.5 flex-shrink-0 transition-colors cursor-pointer",
                                              isMastered
                                                ? (section.color === "primary" && "text-primary") ||
                                                (section.color === "secondary" && "text-secondary") ||
                                                (section.color === "accent" && "text-accent-foreground") ||
                                                "text-primary"
                                                : "text-muted-foreground hover:text-foreground"
                                            )}
                                            title={isMastered ? "Mark as not mastered" : "Mark as mastered"}
                                          >
                                            {isMastered ? (
                                              <CheckCircle2 className="h-4 w-4" />
                                            ) : (
                                              <CheckCircle className="h-4 w-4" />
                                            )}
                                          </button>
                                          <span className={cn("flex-1", isMastered && "line-through opacity-60")}>
                                            {pointText}
                                          </span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>{t("knowledge.noSections")}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col md:flex-row gap-3 mt-6 pt-6 border-t border-border">
                    <Button variant="outline" className="w-full md:flex-1" onClick={handleCreateFlashcards}>
                      <Layers className="h-4 w-4 mr-2" />
                      Create Flashcards
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12 text-center">
                  <Brain className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Select an organizer</h3>
                  <p className="text-muted-foreground">
                    Choose a knowledge organizer to view its contents
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog - User Friendly Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrganizer ? "Edit Knowledge Organizer" : "Create New Knowledge Organizer"}
            </DialogTitle>
            <DialogDescription>
              {editingOrganizer
                ? "Update your knowledge organizer below"
                : "Create a visual summary of your study material"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Cell Biology Overview"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Biology"
                />
              </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exam_board">Exam Board</Label>
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

            {/* Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Sections</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSection}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>

              {formData.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Section {sectionIndex + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSection(sectionIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Section Title *</Label>
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(sectionIndex, "title", e.target.value)}
                      placeholder="e.g., Cell Structure"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Content *</Label>
                    <Textarea
                      value={section.content}
                      onChange={(e) => updateSection(sectionIndex, "content", e.target.value)}
                      placeholder="Describe this section..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Select
                      value={section.color}
                      onValueChange={(value) => updateSection(sectionIndex, "color", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary (Blue)</SelectItem>
                        <SelectItem value="secondary">Secondary (Purple)</SelectItem>
                        <SelectItem value="accent">Accent (Orange)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Key Points</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addKeyPoint(sectionIndex)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Point
                      </Button>
                    </div>
                    {section.keyPoints.map((point: any, pointIndex: number) => {
                      const pointText = typeof point === "string" ? point : point.text;
                      const isMastered = typeof point === "object" ? point.mastered : false;
                      return (
                        <div key={pointIndex} className="flex gap-2 items-center">
                          <Input
                            value={pointText}
                            onChange={(e) => updateKeyPoint(sectionIndex, pointIndex, e.target.value)}
                            placeholder="Enter key point..."
                            className={cn(isMastered && "line-through opacity-60")}
                          />
                          <Button
                            type="button"
                            variant={isMastered ? "default" : "outline"}
                            size="icon"
                            onClick={() => toggleKeyPointMastery(sectionIndex, pointIndex)}
                            title={isMastered ? "Mark as not mastered" : "Mark as mastered"}
                          >
                            {isMastered ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeKeyPoint(sectionIndex, pointIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {formData.sections.length === 0 && (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">No sections yet</p>
                  <Button type="button" variant="outline" onClick={addSection}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Section
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOrganizer}>
              {editingOrganizer ? "Update" : "Create"} Organizer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Generation Dialog */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Knowledge Organizer with AI</DialogTitle>
            <DialogDescription>
              Describe what you want to learn, and AI will create a structured knowledge organizer with sections and key points.
              {aiUsageCount !== null && (
                <span className="block mt-2 text-sm font-medium">
                  {aiUsageCount !== null && aiUsageCount >= aiLimit ? (
                    <span className="text-destructive">You've reached the daily limit.</span>
                  ) : (
                    <span>
                      {aiLimit > 1000
                        ? "You have Unlimited generation attempts."
                        : `You have ${aiUsageCount !== null ? aiLimit - aiUsageCount : '...'} generation attempts remaining today.`}
                    </span>
                  )}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">What would you like to learn? *</Label>
              <Textarea
                id="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Cell biology including organelles, their functions, and how they work together"
                className="min-h-[100px]"
                disabled={isGenerating || (aiUsageCount !== null && aiUsageCount >= aiLimit)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ai-subject">Subject (optional)</Label>
                <Input
                  id="ai-subject"
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value)}
                  placeholder="e.g., Biology"
                  disabled={isGenerating || (aiUsageCount !== null && aiUsageCount >= aiLimit)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-topic">Topic (optional)</Label>
                <Input
                  id="ai-topic"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g., Cell Biology"
                  disabled={isGenerating || (aiUsageCount !== null && aiUsageCount >= aiLimit)}
                />
              </div>
            </div>
            {aiUsageCount !== null && aiUsageCount >= aiLimit && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  You've reached the daily limit of {aiLimit} AI generation attempts. {aiLimit <= 10 ? 'Please upgrade to premium for higher limits.' : 'Please try again tomorrow.'}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAiDialogOpen(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateWithAI}
              disabled={isGenerating || !aiPrompt.trim() || (aiUsageCount !== null && aiUsageCount >= aiLimit)}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
