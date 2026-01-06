import { AppLayout } from "@/components/layout/AppLayout";
import { SimpleMarkdown } from "@/components/SimpleMarkdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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
import { hasPremium } from "@/lib/premium";
import { cn } from "@/lib/utils";
import {
  Bold,
  BookOpen,
  Clock,
  Download,
  Edit,
  Filter,
  Image as ImageIcon,
  LayoutTemplate,
  Link as LinkIcon,
  Loader2,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  topic: string;
  tags: string[];
  grade_level?: string;
  is_premium?: boolean;
  created_at: string;
  updated_at: string;
}

const NOTE_TEMPLATES = {
  definition: {
    label: "Definition",
    content: `# Term Name\n\n**Definition:**\n\n\n**Example:**\n\n\n**Related Concepts:**\n- `
  },
  process: {
    label: "Process",
    content: `# Process Name\n\n**Steps:**\n1. \n2. \n3. \n\n**Key Points:**\n- `
  },
  comparison: {
    label: "Comparison",
    content: `# Comparison: A vs B\n\n| Feature | A | B |\n|---------|---|---|\n|         |   |   |\n\n**Conclusion:**\n`
  }
};

export default function Notes() {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    subject: "",
    topic: "",
    tags: "",
  });

  const subjects = Array.from(new Set(notes.map((n) => n.subject).filter(Boolean)));

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
      fetchNotes();
    }
  }, [user]);

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

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N : New Note
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateNote();
      }
      // Ctrl/Cmd + S : Save (only if dialog is open)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (isDialogOpen) {
          // We can't call handleSaveNote directly easily due to closure staleness unless we wrap in useCallback
          // or access the current state ref. For simplicity in this functional component, 
          // we rely on the fact that this effect hook will re-run when dependencies change.
          // However, to avoid complexity, let's just trigger the form submit button click
          const saveBtn = document.getElementById("save-note-btn");
          if (saveBtn) saveBtn.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDialogOpen]);

  const fetchNotes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Fetch user's own notes
      const { data: userNotes, error: userError } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (userError) throw userError;

      let finalNotes: Note[] = userNotes || [];

      // If premium, also fetch Grade 9 premium notes
      if (isPremium) {
        const { data: premiumNotes, error: premiumError } = await supabase
          .from("global_premium_notes")
          .select("*")
          .eq("grade_level", "9")
          .order("created_at", { ascending: false });

        if (!premiumError && premiumNotes) {
          // Convert premium notes to Note format
          const formattedPremiumNotes = premiumNotes.map(note => ({
            id: note.id,
            title: note.title,
            content: note.content,
            subject: note.subject || "",
            topic: note.topic || "",
            tags: note.tags || [],
            grade_level: note.grade_level,
            is_premium: true,
            created_at: note.created_at,
            updated_at: note.created_at,
          }));
          finalNotes = [...finalNotes, ...formattedPremiumNotes];
        }
      }

      setNotes(finalNotes);

      // Select the first note if none selected
      if (!selectedNote && finalNotes.length > 0) {
        setSelectedNote(finalNotes[0]);
      }
    } catch (error: any) {
      console.error("Error fetching notes:", error);
      toast({
        title: "Error",
        description: "Failed to load notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setFormData({
      title: "",
      content: "",
      subject: "",
      topic: "",
      tags: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      subject: note.subject || "",
      topic: note.topic || "",
      tags: note.tags?.join(", ") || "",
    });
    setIsDialogOpen(true);
  };

  const handleSaveNote = async () => {
    console.log("Saving note. Form Data:", formData);

    const trimmedTitle = formData.title?.trim();
    if (!user || !trimmedTitle) {
      console.warn("Save blocked: Title is missing or empty.");
      toast({
        title: "Error",
        description: "A valid title is required to save your note.",
        variant: "destructive",
      });
      return;
    }

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      if (editingNote) {
        // Update existing note
        const { error } = await supabase
          .from("notes")
          .update({
            title: formData.title,
            content: formData.content,
            subject: formData.subject || null,
            topic: formData.topic || null,
            tags: tagsArray,
          })
          .eq("id", editingNote.id)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Note updated successfully",
        });

        // Update local state properly
        const updatedNote = { ...editingNote, ...formData, tags: tagsArray, updated_at: new Date().toISOString() };
        setNotes(notes.map(n => n.id === editingNote.id ? updatedNote as Note : n));
        setSelectedNote(updatedNote as Note);

      } else {
        // Create new note
        const { data, error } = await supabase.from("notes").insert({
          user_id: user.id,
          title: formData.title,
          content: formData.content,
          subject: formData.subject || null,
          topic: formData.topic || null,
          tags: tagsArray,
        }).select().single();

        if (error) throw error;

        toast({
          title: "Success",
          description: "Note created successfully",
        });

        setNotes([data, ...notes]);
        setSelectedNote(data);
      }

      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note deleted successfully",
      });

      const updatedNotes = notes.filter(n => n.id !== noteId);
      setNotes(updatedNotes);

      if (selectedNote?.id === noteId) {
        setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
      }
    } catch (error: any) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportNote = (note: Note) => {
    const element = document.createElement("a");
    const file = new Blob([note.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Exported",
      description: "Note downloaded as Markdown file",
    });
  };

  const applyTemplate = (templateKey: keyof typeof NOTE_TEMPLATES) => {
    const template = NOTE_TEMPLATES[templateKey];
    if (formData.content && !confirm("This will replace current content. Continue?")) return;

    setFormData({ ...formData, content: template.content });
  };

  // Helper for text insertion
  const insertText = (before: string, after: string = "") => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const beforeText = text.substring(0, start);
    const selectedText = text.substring(start, end);
    const afterText = text.substring(end);

    const newText = beforeText + before + selectedText + after + afterText;
    setFormData({ ...formData, content: newText });

    // Defer focus to allow state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleAddImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      insertText(`![Image](${url})`);
    }
  };

  const handleAddLink = () => {
    const url = prompt("Enter link URL:");
    if (url) {
      insertText("[Link Text](", `${url})`);
    }
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

  // Group notes by subject and topic
  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const subject = note.subject || "Uncategorized";
    const topic = note.topic || "General";

    if (!acc[subject]) {
      acc[subject] = {};
    }
    if (!acc[subject][topic]) {
      acc[subject][topic] = [];
    }
    acc[subject][topic].push(note);

    return acc;
  }, {} as Record<string, Record<string, Note[]>>);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Helper to determine tag color
  const getTagColor = (tag: string) => {
    const lowerTag = tag.toLowerCase();
    if (lowerTag.includes("important") || lowerTag.includes("exam") || lowerTag.includes("urgent")) {
      return "bg-destructive/10 text-destructive border-destructive/20";
    }
    if (lowerTag.includes("review") || lowerTag.includes("study")) {
      return "bg-secondary/10 text-secondary border-secondary/20";
    }
    return "bg-muted text-muted-foreground border-border";
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Exam Notes</h1>
            <p className="text-muted-foreground mt-1">
              {notes.length} note{notes.length !== 1 ? "s" : ""} across{" "}
              {subjects.length || 1} subject{subjects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={handleCreateNote} title="Create New Note (Ctrl+N)">
            <Plus className="h-4 w-4 mr-2" />
            Create Note
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes List (Accordion Style) */}
          <div className="lg:col-span-1 space-y-4 animate-slide-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            {Object.keys(groupedNotes).length === 0 ? (
              <div className="glass-card p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No notes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first note to get started
                </p>
                <Button onClick={handleCreateNote}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Note
                </Button>
              </div>
            ) : (
              Object.entries(groupedNotes).map(([subject, topics]) => (
                <div key={subject} className="glass-card p-4">
                  <h3 className="font-semibold text-foreground mb-3">{subject}</h3>
                  <Accordion type="multiple" className="space-y-2" defaultValue={Object.keys(topics)}>
                    {Object.entries(topics).map(([topic, topicNotes]) => (
                      <AccordionItem key={topic} value={topic} className="border-none">
                        <AccordionTrigger className="py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium hover:no-underline">
                          {topic}
                          <span className="ml-auto mr-2 text-xs text-muted-foreground">
                            {topicNotes.length}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-0">
                          <div className="space-y-2 pl-2">
                            {topicNotes.map((note) => (
                              <button
                                key={note.id}
                                onClick={() => setSelectedNote(note)}
                                className={cn(
                                  "w-full text-left p-3 rounded-lg transition-all duration-200 group border",
                                  selectedNote?.id === note.id
                                    ? "bg-primary/10 border-primary/30 shadow-sm"
                                    : "bg-card hover:bg-muted/50 border-transparent hover:border-border/50"
                                )}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className={cn("font-medium text-sm truncate", selectedNote?.id === note.id ? "text-primary" : "text-foreground")}>
                                      {note.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">
                                        {formatTimeAgo(note.updated_at)}
                                      </span>
                                    </div>
                                    {note.tags && note.tags.length > 0 && (
                                      <div className="flex gap-1 mt-2">
                                        {note.tags.slice(0, 2).map((tag, i) => (
                                          <span key={i} className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", getTagColor(tag))}>
                                            {tag}
                                          </span>
                                        ))}
                                        {note.tags.length > 2 && <span className="text-[10px] text-muted-foreground">...</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))
            )}
          </div>

          {/* Note Content */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
            {selectedNote ? (
              <div className="glass-card p-6 md:p-8 sticky top-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {selectedNote.subject && (
                        <>
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {selectedNote.subject}
                          </span>
                        </>
                      )}
                      {selectedNote.topic && (
                        <span className="text-xs text-muted-foreground/80 px-2 py-1 rounded-md bg-muted">
                          {selectedNote.topic}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                      {selectedNote.title}
                    </h2>

                    {selectedNote.tags && selectedNote.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedNote.tags.map((tag, index) => (
                          <span
                            key={index}
                            className={cn("text-xs px-2 py-0.5 rounded-full border", getTagColor(tag))}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleExportNote(selectedNote)}
                      title="Export Markdown"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditNote(selectedNote)}
                      title="Edit Note"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteNote(selectedNote.id)}
                      title="Delete Note"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-a:text-primary">
                  <SimpleMarkdown content={selectedNote.content} />
                </div>

                <div className="flex items-center gap-2 mt-8 pt-4 border-t border-border">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Last modified {formatTimeAgo(selectedNote.updated_at)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a note</h3>
                <p className="text-muted-foreground">
                  Choose a note from the list to view its content
                </p>
                <Button onClick={handleCreateNote} className="mt-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Note
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
            <DialogDescription>
              Use markdown to format your note.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter note title"
                className="text-lg font-medium"
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
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g., Cell Biology"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content</Label>
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" title="Use Template">
                        <LayoutTemplate className="h-4 w-4 mr-2" />
                        Template
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => applyTemplate("definition")}>Definition</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => applyTemplate("process")}>Process</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => applyTemplate("comparison")}>Comparison</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertText("**", "**")} title="Bold">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddLink} title="Add Link">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddImage} title="Add Image URL">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your note content here..."
                  className="min-h-[300px] font-mono text-sm leading-relaxed"
                />
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground opacity-50">
                  Markdown supported
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., important, exam, review"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Shortcuts: <kbd className="px-1 py-0.5 rounded bg-muted border">Ctrl+S</kbd> to save
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote} id="save-note-btn">
              {editingNote ? "Update" : "Create"} Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
