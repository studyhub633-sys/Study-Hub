import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { hasPremium } from "@/lib/premium";
import { cn } from "@/lib/utils";
import { chatWithAI } from "@/lib/ai-client";
import {
  Bold,
  ChevronLeft,
  Clock,
  Crown,
  FileText,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Plus,
  Printer,
  Search,
  Sparkles,
  Trash2,
  Underline,
  Wand2,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface Document {
  id: string;
  title: string;
  content: string;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export default function Docs() {
  const { supabase, user } = useAuth();
  const { toast } = useToast();

  const [docs, setDocs] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Auto-save timer
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      loadDocs();
      checkPremium();
    }
  }, [user]);

  const checkPremium = async () => {
    if (!supabase) return;
    try {
      setIsPremium(await hasPremium(supabase));
    } catch { setIsPremium(false); }
  };

  const loadDocs = async () => {
    if (!user || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        if (error.code === "42P01") {
          // Table doesn't exist — use localStorage fallback
          const localDocs = localStorage.getItem(`docs_${user.id}`);
          if (localDocs) setDocs(JSON.parse(localDocs));
        } else {
          console.error("Error loading docs:", error);
        }
      } else {
        setDocs(data || []);
        if (!selectedDoc && data && data.length > 0) {
          setSelectedDoc(data[0]);
        }
      }
    } catch (error) {
      console.error("Error loading docs:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveDocsLocally = (updatedDocs: Document[]) => {
    if (user) {
      localStorage.setItem(`docs_${user.id}`, JSON.stringify(updatedDocs));
    }
  };

  const createDoc = async () => {
    if (!user) return;
    const newDoc: Document = {
      id: crypto.randomUUID(),
      title: "Untitled Document",
      content: "",
      word_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      if (supabase) {
        const { error } = await supabase.from("documents").insert({
          id: newDoc.id,
          user_id: user.id,
          title: newDoc.title,
          content: newDoc.content,
          word_count: 0,
        });
        if (error && error.code !== "42P01") {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Error creating doc:", error);
    }

    const updatedDocs = [newDoc, ...docs];
    setDocs(updatedDocs);
    setSelectedDoc(newDoc);
    setMobileShowDetail(true);
    saveDocsLocally(updatedDocs);

    // Focus the title input
    setTimeout(() => titleRef.current?.focus(), 100);
  };

  const saveDoc = async (doc: Document) => {
    if (!user) return;
    setSaving(true);

    const content = editorRef.current?.innerHTML || doc.content;
    const wordCount = (editorRef.current?.innerText || "").trim().split(/\s+/).filter(Boolean).length;
    const updatedDoc = {
      ...doc,
      content,
      word_count: wordCount,
      updated_at: new Date().toISOString(),
    };

    try {
      if (supabase) {
        const { error } = await supabase
          .from("documents")
          .upsert({
            id: updatedDoc.id,
            user_id: user.id,
            title: updatedDoc.title,
            content: updatedDoc.content,
            word_count: updatedDoc.word_count,
            updated_at: updatedDoc.updated_at,
          }, { onConflict: "id" });

        if (error && error.code !== "42P01") {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Error saving doc:", error);
    }

    const updatedDocs = docs.map(d => d.id === updatedDoc.id ? updatedDoc : d);
    setDocs(updatedDocs);
    setSelectedDoc(updatedDoc);
    saveDocsLocally(updatedDocs);
    setSaving(false);
  };

  const deleteDoc = async (docId: string) => {
    if (!confirm("Delete this document?")) return;

    try {
      if (supabase) {
        await supabase.from("documents").delete().eq("id", docId);
      }
    } catch (error) {
      console.error("Error deleting doc:", error);
    }

    const updatedDocs = docs.filter(d => d.id !== docId);
    setDocs(updatedDocs);
    saveDocsLocally(updatedDocs);

    if (selectedDoc?.id === docId) {
      setSelectedDoc(updatedDocs.length > 0 ? updatedDocs[0] : null);
    }

    toast({ title: "Document deleted" });
  };

  // Auto-save on content change
  const handleContentChange = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (selectedDoc) saveDoc(selectedDoc);
    }, 1500);
  };

  const handleTitleChange = (newTitle: string) => {
    if (!selectedDoc) return;
    const updated = { ...selectedDoc, title: newTitle };
    setSelectedDoc(updated);

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDoc(updated);
    }, 1500);
  };

  // Formatting commands
  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  // Print
  const handlePrint = () => {
    if (!selectedDoc || !editorRef.current) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedDoc.title}</title>
        <style>
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            max-width: 700px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.8;
            color: #1a1a1a;
            font-size: 14pt;
          }
          h1 { font-size: 24pt; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          h2 { font-size: 18pt; margin-top: 20px; }
          p { margin-bottom: 12px; }
          @media print {
            body { margin: 0; padding: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>${selectedDoc.title}</h1>
        ${editorRef.current.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // AI Writing Assistant (Premium)
  const handleAiImprove = async () => {
    if (!selectedDoc || !editorRef.current || !supabase) return;

    const text = editorRef.current.innerText.trim();
    if (!text || text.length < 10) {
      toast({ title: "Write more first", description: "The AI needs at least a sentence to work with.", variant: "destructive" });
      return;
    }

    setAiLoading(true);
    try {
      const result = await chatWithAI({
        message: `You are a writing assistant like Grammarly. Improve the following creative writing text. Fix grammar, spelling, and style issues. Make the writing clearer and more engaging while keeping the author's voice and intent. Return ONLY the improved text with no explanations or comments:\n\n${text}`,
        language: "en",
      }, supabase);

      if (result.error) throw new Error(result.error);

      const improved = (result.data as any)?.reply;
      if (improved) {
        editorRef.current.innerText = improved;
        handleContentChange();
        toast({ title: "Writing improved! ✨", description: "Your text has been enhanced by AI." });
      }
    } catch (error: any) {
      toast({ title: "AI Error", description: error.message || "Failed to improve writing.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const getWordCount = () => {
    if (!editorRef.current) return selectedDoc?.word_count || 0;
    return editorRef.current.innerText.trim().split(/\s+/).filter(Boolean).length;
  };

  const getCharCount = () => {
    if (!editorRef.current) return 0;
    return editorRef.current.innerText.length;
  };

  const filteredDocs = docs.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Docs</h1>
              <p className="text-muted-foreground text-sm">Creative writing & documents</p>
            </div>
          </div>
          <Button onClick={createDoc} className="gap-1">
            <Plus className="w-4 h-4" />
            New Document
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Doc List */}
          <div className={cn(
            "lg:col-span-1 space-y-3",
            mobileShowDetail ? "hidden lg:block" : "block"
          )}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No documents yet</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[calc(100vh-250px)] overflow-y-auto">
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setMobileShowDetail(true);
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-xl transition-all text-sm border group",
                      selectedDoc?.id === doc.id
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-card hover:bg-muted/50 border-transparent hover:border-border/50"
                    )}
                  >
                    <p className="font-medium truncate">{doc.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(doc.updated_at)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Editor */}
          <div className={cn(
            "lg:col-span-3",
            mobileShowDetail ? "block" : "hidden lg:block"
          )}>
            {selectedDoc ? (
              <Card className="overflow-hidden">
                {/* Mobile Back */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden m-2"
                  onClick={() => setMobileShowDetail(false)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>

                {/* Toolbar */}
                <div className="border-b px-3 py-2 flex items-center gap-1 flex-wrap bg-muted/30">
                  <button onClick={() => execCmd("bold")} className="p-2 rounded hover:bg-muted transition" title="Bold">
                    <Bold className="w-4 h-4" />
                  </button>
                  <button onClick={() => execCmd("italic")} className="p-2 rounded hover:bg-muted transition" title="Italic">
                    <Italic className="w-4 h-4" />
                  </button>
                  <button onClick={() => execCmd("underline")} className="p-2 rounded hover:bg-muted transition" title="Underline">
                    <Underline className="w-4 h-4" />
                  </button>
                  <div className="w-px h-5 bg-border mx-1" />
                  <button onClick={() => execCmd("formatBlock", "h1")} className="p-2 rounded hover:bg-muted transition" title="Heading 1">
                    <Heading1 className="w-4 h-4" />
                  </button>
                  <button onClick={() => execCmd("formatBlock", "h2")} className="p-2 rounded hover:bg-muted transition" title="Heading 2">
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <div className="w-px h-5 bg-border mx-1" />
                  <button onClick={() => execCmd("insertUnorderedList")} className="p-2 rounded hover:bg-muted transition" title="Bullet List">
                    <List className="w-4 h-4" />
                  </button>
                  <button onClick={() => execCmd("insertOrderedList")} className="p-2 rounded hover:bg-muted transition" title="Numbered List">
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <div className="flex-1" />

                  {/* AI Improve (Premium) */}
                  {isPremium ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
                      onClick={handleAiImprove}
                      disabled={aiLoading}
                    >
                      {aiLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Wand2 className="w-3 h-3" />
                      )}
                      AI Improve
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs opacity-60"
                      disabled
                      title="Premium feature"
                    >
                      <Crown className="w-3 h-3" />
                      AI Improve
                    </Button>
                  )}

                  <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1 text-xs">
                    <Printer className="w-3 h-3" />
                    Print
                  </Button>
                </div>

                {/* Title */}
                <div className="px-6 pt-4">
                  <input
                    ref={titleRef}
                    type="text"
                    value={selectedDoc.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Untitled Document"
                    className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
                  />
                </div>

                {/* Content editable area */}
                <CardContent className="p-6">
                  <div
                    ref={editorRef}
                    contentEditable
                    className="min-h-[50vh] prose dark:prose-invert max-w-none focus:outline-none text-base leading-relaxed"
                    style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                    dangerouslySetInnerHTML={{ __html: selectedDoc.content }}
                    onInput={handleContentChange}
                    suppressContentEditableWarning
                  />
                </CardContent>

                {/* Footer */}
                <div className="border-t px-6 py-2 flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
                  <div className="flex items-center gap-4">
                    <span>{getWordCount()} words</span>
                    <span>{getCharCount()} characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {saving ? (
                      <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>
                    ) : (
                      <span>Saved</span>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-semibold mb-1">No document selected</h3>
                <p className="text-sm text-muted-foreground mb-4">Create a new document or select one from the sidebar</p>
                <Button onClick={createDoc}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Document
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
