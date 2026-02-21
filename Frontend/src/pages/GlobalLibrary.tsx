import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Brain, Calendar, ChevronDown, ExternalLink, FileText, Filter, Layers, Library, Plus, Search, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface GlobalPaper {
    id: string;
    title: string;
    subject: string;
    year: number;
    exam_board: string;
    file_url: string;
    file_type: string;
}

interface GlobalOrganizer {
    id: string;
    title: string;
    subject: string;
    topic: string;
    content: any;
}

interface GlobalFlashcard {
    id: string;
    front: string;
    back: string;
    subject: string;
    topic: string;
}

export default function GlobalLibrary() {
    const { supabase, user } = useAuth();
    const { t } = useTranslation();
    const [papers, setPapers] = useState<GlobalPaper[]>([]);
    const [organizers, setOrganizers] = useState<GlobalOrganizer[]>([]);
    const [flashcards, setFlashcards] = useState<GlobalFlashcard[]>([]);
    const [search, setSearch] = useState("");
    const [yearFilter, setYearFilter] = useState<string>("all");
    const [subjectFilter, setSubjectFilter] = useState<string>("all");
    const [activeTab, setActiveTab] = useState("papers");
    const [viewingOrganizer, setViewingOrganizer] = useState<GlobalOrganizer | null>(null);
    const [openSections, setOpenSections] = useState<string[]>([]);
    const { toast } = useToast();

    // Get unique years and subjects for filters
    const availableYears = useMemo(() => {
        const years = [...new Set(papers.map(p => p.year))].filter(Boolean).sort((a, b) => b - a);
        return years;
    }, [papers]);

    const availableSubjects = useMemo(() => {
        const pSubjects = papers.map(p => p.subject);
        const oSubjects = organizers.map(o => o.subject);
        const fSubjects = flashcards.map(f => f.subject);
        const subjects = [...new Set([...pSubjects, ...oSubjects, ...fSubjects])].filter(Boolean).sort();
        return subjects;
    }, [papers, organizers, flashcards]);

    useEffect(() => {
        if (!supabase) return;
        fetchGlobalPapers();
        fetchGlobalOrganizers();
        fetchGlobalFlashcards();
    }, [supabase]);

    const fetchGlobalPapers = async () => {
        const { data, error } = await supabase
            .from("global_past_papers")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching global papers:", error);
        } else {
            setPapers(data || []);
        }
    };

    const fetchGlobalOrganizers = async () => {
        const { data, error } = await supabase
            .from("global_knowledge_organizers")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching global organizers:", error);
        } else {
            setOrganizers(data || []);
        }
    };

    const fetchGlobalFlashcards = async () => {
        const { data, error } = await supabase
            .from("global_flashcards")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching global flashcards:", error);
        } else {
            setFlashcards(data || []);
        }
    };



    const handleAddPaper = async (paper: GlobalPaper) => {
        if (!user) {
            toast({
                title: "Login Required",
                description: "You must be logged in to add papers.",
                variant: "destructive",
            });
            return;
        }

        try {
            const { data: existing } = await supabase
                .from("past_papers")
                .select("id")
                .eq("user_id", user.id)
                .eq("file_url", paper.file_url)
                .maybeSingle();

            if (existing) {
                toast({
                    title: "Already Added",
                    description: "This paper is already in your collection.",
                });
                return;
            }

            const { error } = await supabase.from("past_papers").insert({
                user_id: user.id,
                title: paper.title,
                subject: paper.subject,
                year: paper.year,
                exam_board: paper.exam_board,
                file_url: paper.file_url,
                file_type: paper.file_type,
            });

            if (error) throw error;

            toast({
                title: "Added to Library",
                description: `${paper.title} has been added to your papers.`,
            });
        } catch (e: any) {
            toast({
                title: "Error",
                description: e.message,
                variant: "destructive",
            });
        }
    };

    const handleAddOrganizer = async (org: GlobalOrganizer) => {
        if (!user) {
            toast({
                title: "Login Required",
                description: "You must be logged in to add organizers.",
                variant: "destructive",
            });
            return;
        }

        try {
            console.log("Adding organizer:", org);
            const { data: existing } = await supabase
                .from("knowledge_organizers")
                .select("id")
                .eq("user_id", user.id)
                .eq("title", org.title)
                .maybeSingle();

            if (existing) {
                toast({
                    title: "Already Added",
                    description: "This organizer is already in your collection.",
                });
                return;
            }

            // Extract extra metadata if available in content, otherwise default
            const examBoard = org.content?.exam_board || null;
            // Some schemas might have tier in content or it might be null
            const tier = null;

            const { error } = await supabase.from("knowledge_organizers").insert({
                user_id: user.id,
                title: org.title,
                subject: org.subject,
                topic: org.topic,
                content: org.content,
                tier: tier,
                // We don't insert exam_board column as it seems to be part of content in some schemas,
                // but if the table has it as a column (which Knowledge.tsx save doesn't seem to use?), 
                // we leave it out. If the DB requires it, this might fail, but checking Knowledge.tsx
                // suggested it wasn't used in insert.
            });

            if (error) {
                console.error("Database insert error:", error);
                throw error;
            }

            toast({
                title: "Added to Library",
                description: `${org.title} has been added to your organizers.`,
            });
        } catch (e: any) {
            console.error("Error adding organizer:", e);
            toast({
                title: "Error",
                description: e.message || "Failed to add organizer",
                variant: "destructive",
            });
        }
    };

    const handleAddFlashcard = async (card: GlobalFlashcard) => {
        if (!user) {
            toast({
                title: "Login Required",
                description: "You must be logged in to add flashcards.",
                variant: "destructive",
            });
            return;
        }

        try {
            // Check for duplicates
            const { data: existing } = await supabase
                .from("flashcards")
                .select("id")
                .eq("user_id", user.id)
                .eq("front", card.front)
                .maybeSingle();

            if (existing) {
                toast({
                    title: "Already Added",
                    description: "This flashcard is already in your collection.",
                });
                return;
            }

            const { error } = await supabase.from("flashcards").insert({
                user_id: user.id,
                front: card.front,
                back: card.back,
                subject: card.subject,
                topic: card.topic,
                difficulty: 1,
                review_count: 0
            });

            if (error) throw error;

            toast({
                title: "Added to Flashcards",
                description: "Flashcard added successfully.",
            });
        } catch (e: any) {
            toast({
                title: "Error",
                description: e.message,
                variant: "destructive",
            });
        }
    };

    const filteredPapers = papers.filter((paper) => {
        const matchesSearch = (paper.title || "").toLowerCase().includes(search.toLowerCase()) ||
            paper.subject?.toLowerCase().includes(search.toLowerCase()) ||
            paper.exam_board?.toLowerCase().includes(search.toLowerCase());
        const matchesYear = yearFilter === "all" || paper.year?.toString() === yearFilter;
        const matchesSubject = subjectFilter === "all" || paper.subject === subjectFilter;
        return matchesSearch && matchesYear && matchesSubject;
    });

    const filteredOrganizers = organizers.filter((org) => {
        const matchesSearch = (org.title || "").toLowerCase().includes(search.toLowerCase()) ||
            org.subject?.toLowerCase().includes(search.toLowerCase()) ||
            org.topic?.toLowerCase().includes(search.toLowerCase());
        const matchesSubject = subjectFilter === "all" || org.subject === subjectFilter;
        return matchesSearch && matchesSubject;
    });

    const filteredFlashcards = flashcards.filter((card) => {
        const matchesSearch = (card.front || "").toLowerCase().includes(search.toLowerCase()) ||
            (card.back || "").toLowerCase().includes(search.toLowerCase()) ||
            card.topic?.toLowerCase().includes(search.toLowerCase()) ||
            card.subject?.toLowerCase().includes(search.toLowerCase());
        const matchesSubject = subjectFilter === "all" || card.subject === subjectFilter;
        return matchesSearch && matchesSubject;
    });

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Library className="h-8 w-8 text-primary" />
                            <h1 className="text-4xl font-extrabold tracking-tight">{t("library.title")}</h1>
                        </div>
                        <p className="text-muted-foreground text-lg">
                            {t("library.subtitle")}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-sm font-bold uppercase tracking-wider">{t("library.trustedSources")}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Search className="h-5 w-5" />
                        </div>
                        <Input
                            placeholder={t("library.searchPlaceholder")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-12 bg-background border-primary/10 rounded-xl shadow-sm"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {activeTab === 'papers' && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <Select value={yearFilter} onValueChange={setYearFilter}>
                                    <SelectTrigger className="w-[130px] h-10">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("common.allYears")}</SelectItem>
                                        {availableYears.map(year => (
                                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                                <SelectTrigger className="w-[160px] h-10">
                                    <SelectValue placeholder="Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("common.allSubjects")}</SelectItem>
                                    {availableSubjects.map(subject => (
                                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8 h-12 p-1 bg-muted/50 backdrop-blur-sm rounded-xl">
                        <TabsTrigger value="papers" className="rounded-lg font-bold text-base flex gap-2">
                            <FileText className="h-4 w-4" /> {t("library.pastPapers")}
                        </TabsTrigger>
                        <TabsTrigger value="organizers" className="rounded-lg font-bold text-base flex gap-2">
                            <Brain className="h-4 w-4" /> {t("library.organisers")}
                        </TabsTrigger>
                        <TabsTrigger value="flashcards" className="rounded-lg font-bold text-base flex gap-2">
                            <Layers className="h-4 w-4" /> {t("library.flashcards")}
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Past Papers */}
                    <TabsContent value="papers" className="space-y-8">
                        {/* Copyright Disclaimer */}
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                            <div className="text-sm text-muted-foreground">
                                <p className="font-medium text-foreground mb-1">Copyright Notice</p>
                                <p>
                                    All past examination papers are the copyright of their respective exam boards (AQA, Pearson Edexcel, OCR, Eduqas/WJEC).
                                    Revisely.ai does not host, store, or reproduce any exam board content. Links open directly on the official exam board websites.
                                    Revisely.ai is not affiliated with, endorsed by, or connected to any exam board.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPapers.map((paper) => (
                                <Card
                                    key={paper.id}
                                    className="hover:shadow-lg transition-all border-primary/5 group cursor-pointer"
                                    onClick={() => window.open(paper.file_url, '_blank')}
                                >
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                                                {paper.exam_board}
                                            </Badge>
                                            <div className="flex items-center gap-1">
                                                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); window.open(paper.file_url, '_blank'); }} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleAddPaper(paper); }} className="h-8 w-8 text-primary hover:bg-primary/10">
                                                    <Plus className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardTitle className="text-base mt-2 line-clamp-2 group-hover:text-primary transition-colors">{paper.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 flex justify-between items-center">
                                        <span className="text-xs font-medium text-muted-foreground">{paper.subject} • {paper.year}</span>
                                        <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">Verified</div>
                                    </CardContent>
                                </Card>
                            ))}
                            {filteredPapers.length === 0 && (
                                <div className="col-span-full py-20 text-center text-muted-foreground">
                                    {t("library.noPapersFound")}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Tab 2: Knowledge Organizers */}
                    <TabsContent value="organizers" className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredOrganizers.map((org) => (
                                <Card
                                    key={org.id}
                                    className="hover:shadow-xl transition-all border-primary/5 group relative overflow-hidden cursor-pointer"
                                    onClick={() => {
                                        setViewingOrganizer(org);
                                        setOpenSections(org.content?.sections?.slice(0, 1).map((s: any) => s.title) || []);
                                    }}
                                >
                                    <div className="absolute top-0 right-0 p-3">
                                        <Button size="icon" variant="secondary" onClick={(e) => { e.stopPropagation(); handleAddOrganizer(org); }} className="h-10 w-10 shadow-lg">
                                            <Plus className="h-6 w-6" />
                                        </Button>
                                    </div>
                                    <CardHeader>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className="bg-primary/10 text-primary border-none">
                                                {org.content?.exam_board || "General"}
                                            </Badge>
                                            <Badge variant="outline" className="text-muted-foreground">
                                                {org.subject}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{org.title}</CardTitle>
                                        <CardDescription className="line-clamp-2 mt-2">
                                            {org.topic}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                                            <Brain className="h-3 w-3" />
                                            {t("knowledge.sections", { count: org.content?.sections?.length || 0 })}
                                            <span className="ml-auto text-primary text-xs font-medium">Click to view →</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {filteredOrganizers.length === 0 && (
                                <div className="col-span-full py-20 text-center text-muted-foreground">
                                    {t("common.noResults")}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Tab 3: Flashcards */}
                    <TabsContent value="flashcards" className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFlashcards.map((card) => (
                                <Card key={card.id} className="hover:shadow-xl transition-all border-primary/5 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3">
                                        <Button size="icon" variant="secondary" onClick={() => handleAddFlashcard(card)} className="h-10 w-10 shadow-lg">
                                            <Plus className="h-6 w-6" />
                                        </Button>
                                    </div>
                                    <CardHeader>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="text-muted-foreground">
                                                {card.subject}
                                            </Badge>
                                            <Badge className="bg-primary/10 text-primary border-none">
                                                {card.topic}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">{card.front}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {card.back}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                            {filteredFlashcards.length === 0 && (
                                <div className="col-span-full py-20 text-center text-muted-foreground">
                                    {t("common.noResults")}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                </Tabs>
            </div>

            {/* Organizer View Dialog */}
            <Dialog open={!!viewingOrganizer} onOpenChange={(open) => !open && setViewingOrganizer(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-primary/10 text-primary border-none">
                                {viewingOrganizer?.content?.exam_board || "General"}
                            </Badge>
                            <Badge variant="outline" className="text-muted-foreground">
                                {viewingOrganizer?.subject}
                            </Badge>
                        </div>
                        <DialogTitle className="text-2xl">{viewingOrganizer?.title}</DialogTitle>
                        <DialogDescription>{viewingOrganizer?.topic}</DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 pr-4">
                        <div className="space-y-4 pb-4">
                            {viewingOrganizer?.content?.sections?.map((section: any, idx: number) => (
                                <Collapsible
                                    key={idx}
                                    open={openSections.includes(section.title)}
                                    onOpenChange={() => {
                                        setOpenSections(prev =>
                                            prev.includes(section.title)
                                                ? prev.filter(t => t !== section.title)
                                                : [...prev, section.title]
                                        );
                                    }}
                                >
                                    <CollapsibleTrigger className="w-full">
                                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-3 w-3 rounded-full bg-${section.color || 'primary'}`} />
                                                <span className="font-semibold text-left">{section.title}</span>
                                            </div>
                                            <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes(section.title) ? 'rotate-180' : ''}`} />
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="p-4 border border-t-0 rounded-b-lg space-y-4">
                                            <p className="text-muted-foreground">{section.content}</p>
                                            {section.keyPoints && section.keyPoints.length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-sm">Key Points:</h4>
                                                    <ul className="space-y-1">
                                                        {section.keyPoints.map((kp: any, kpIdx: number) => (
                                                            <li key={kpIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                                <span className="text-primary mt-1">•</span>
                                                                <span>{typeof kp === 'string' ? kp : kp.text}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => setViewingOrganizer(null)}>
                            Close
                        </Button>
                        <Button onClick={() => {
                            if (viewingOrganizer) {
                                handleAddOrganizer(viewingOrganizer);
                                setViewingOrganizer(null);
                            }
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add to My Library
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

