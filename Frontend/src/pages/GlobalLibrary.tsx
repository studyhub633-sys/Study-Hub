
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SmartPaperParser } from "@/lib/paper-parser";
import { Brain, Calendar, ExternalLink, FileText, Filter, Globe, Info, Library, Plus, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

export default function GlobalLibrary() {
    const { supabase, user } = useAuth();
    const [papers, setPapers] = useState<GlobalPaper[]>([]);
    const [organizers, setOrganizers] = useState<GlobalOrganizer[]>([]);
    const [search, setSearch] = useState("");
    const [yearFilter, setYearFilter] = useState<string>("all");
    const [subjectFilter, setSubjectFilter] = useState<string>("all");
    const [activeTab, setActiveTab] = useState("papers");
    const [quickAddUrl, setQuickAddUrl] = useState("");
    const [isParsing, setIsParsing] = useState(false);
    const { toast } = useToast();

    // Get unique years and subjects for filters
    const availableYears = useMemo(() => {
        const years = [...new Set(papers.map(p => p.year))].filter(Boolean).sort((a, b) => b - a);
        return years;
    }, [papers]);

    const availableSubjects = useMemo(() => {
        const pSubjects = papers.map(p => p.subject);
        const oSubjects = organizers.map(o => o.subject);
        const subjects = [...new Set([...pSubjects, ...oSubjects])].filter(Boolean).sort();
        return subjects;
    }, [papers, organizers]);

    useEffect(() => {
        fetchGlobalPapers();
        fetchGlobalOrganizers();
    }, []);

    const fetchGlobalPapers = async () => {
        const { data, error } = await supabase
            .from("global_past_papers")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast({
                title: "Error",
                description: "Failed to fetch global papers.",
                variant: "destructive",
            });
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

    const handleQuickAdd = async () => {
        if (!quickAddUrl.trim()) return;
        setIsParsing(true);

        try {
            const metadata = SmartPaperParser.parse(quickAddUrl);

            const { error } = await supabase.from("past_papers").insert({
                user_id: user?.id,
                title: `${metadata.board} ${metadata.subjectCode || ''} ${metadata.type} ${metadata.year || ''} ${metadata.month || ''}`,
                subject: metadata.subjectCode || "AQA General",
                year: metadata.year ? parseInt(metadata.year) : null,
                exam_board: metadata.board,
                file_url: quickAddUrl,
                file_type: "link",
            });

            if (error) throw error;

            toast({
                title: "Smart Add Successful",
                description: "The paper has been added to your collection using AI parsing.",
            });
            setQuickAddUrl("");
        } catch (e: any) {
            toast({
                title: "Parsing Error",
                description: "We couldn't parse that link. Try adding it manually or check the URL.",
                variant: "destructive",
            });
        } finally {
            setIsParsing(false);
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

            const { error } = await supabase.from("knowledge_organizers").insert({
                user_id: user.id,
                title: org.title,
                subject: org.subject,
                topic: org.topic,
                content: org.content,
            });

            if (error) throw error;

            toast({
                title: "Added to Library",
                description: `${org.title} has been added to your organizers.`,
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
        const matchesSearch = paper.title.toLowerCase().includes(search.toLowerCase()) ||
            paper.subject?.toLowerCase().includes(search.toLowerCase()) ||
            paper.exam_board?.toLowerCase().includes(search.toLowerCase());
        const matchesYear = yearFilter === "all" || paper.year?.toString() === yearFilter;
        const matchesSubject = subjectFilter === "all" || paper.subject === subjectFilter;
        return matchesSearch && matchesYear && matchesSubject;
    });

    const filteredOrganizers = organizers.filter((org) => {
        const matchesSearch = org.title.toLowerCase().includes(search.toLowerCase()) ||
            org.subject?.toLowerCase().includes(search.toLowerCase()) ||
            org.topic?.toLowerCase().includes(search.toLowerCase());
        const matchesSubject = subjectFilter === "all" || org.subject === subjectFilter;
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
                            <h1 className="text-4xl font-extrabold tracking-tight">Global Library</h1>
                        </div>
                        <p className="text-muted-foreground text-lg">
                            Discover verified past papers and pre-made knowledge organizers.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-sm font-bold uppercase tracking-wider">Trusted Sources Only</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Search className="h-5 w-5" />
                        </div>
                        <Input
                            placeholder="Search library..."
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
                                        <SelectItem value="all">All Years</SelectItem>
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
                                    <SelectItem value="all">All Subjects</SelectItem>
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
                            <FileText className="h-4 w-4" /> Past Papers
                        </TabsTrigger>
                        <TabsTrigger value="organizers" className="rounded-lg font-bold text-base flex gap-2">
                            <Brain className="h-4 w-4" /> Knowledge Organizers
                        </TabsTrigger>
                        <TabsTrigger value="search" className="rounded-lg font-bold text-base flex gap-2">
                            <Globe className="h-4 w-4" /> Resource Center
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Past Papers */}
                    <TabsContent value="papers" className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {filteredPapers.map((paper) => (
                                        <Card key={paper.id} className="hover:shadow-lg transition-all border-primary/5 group">
                                            <CardHeader className="p-4 pb-2">
                                                <div className="flex justify-between items-start">
                                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                                                        {paper.exam_board}
                                                    </Badge>
                                                    <Button size="icon" variant="ghost" onClick={() => handleAddPaper(paper)} className="h-8 w-8 text-primary hover:bg-primary/10">
                                                        <Plus className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                                <CardTitle className="text-base mt-2 line-clamp-2">{paper.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0 flex justify-between items-center">
                                                <span className="text-xs font-medium text-muted-foreground">{paper.subject} • {paper.year}</span>
                                                <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">Verified</div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {filteredPapers.length === 0 && (
                                        <div className="col-span-full py-20 text-center text-muted-foreground">
                                            No papers found matching your criteria.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-1">
                                <div className="sticky top-24">
                                    <Card className="border-primary/20 shadow-xl overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                                        <CardHeader className="bg-primary/5">
                                            <CardTitle className="flex items-center gap-2 text-primary">
                                                <Sparkles className="h-5 w-5" /> Smart Link Importer
                                            </CardTitle>
                                            <CardDescription>
                                                Found a paper link on PMT or PapaCambridge? Paste it below and we''ll auto-format it for you.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-4">
                                            <Input
                                                placeholder="https://..."
                                                value={quickAddUrl}
                                                onChange={(e) => setQuickAddUrl(e.target.value)}
                                                className="border-primary/10 focus:border-primary focus:ring-primary h-12"
                                            />
                                            <Button
                                                className="w-full h-12 font-bold gap-2 text-lg shadow-primary/20"
                                                onClick={handleQuickAdd}
                                                disabled={isParsing || !quickAddUrl}
                                            >
                                                {isParsing ? "Working Magic..." : "Add with Smart Parser"}
                                            </Button>
                                            <div className="pt-4 border-t border-primary/5">
                                                <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                                    <Info className="h-3 w-3" /> Note: This uses URLs only. Scientia.ai does not host or redistribute any PDF files.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab 2: Knowledge Organizers */}
                    <TabsContent value="organizers" className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredOrganizers.map((org) => (
                                <Card key={org.id} className="hover:shadow-xl transition-all border-primary/5 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3">
                                        <Button size="icon" variant="secondary" onClick={() => handleAddOrganizer(org)} className="h-10 w-10 shadow-lg">
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
                                            {org.content?.sections?.length || 0} Professional Sections
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {filteredOrganizers.length === 0 && (
                                <div className="col-span-full py-20 text-center text-muted-foreground">
                                    No organizers found matching your criteria.
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Tab 3: External Resources */}
                    <TabsContent value="search" className="space-y-6">
                        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-amber-500/20">
                                    <ShieldCheck className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">100% Legal & Safe</h3>
                                    <p className="text-sm text-muted-foreground">
                                        These links open official third-party resources in a <strong>new tab</strong>.
                                        Scientia.ai does not host, frame, or redistribute any copyrighted materials.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-2 border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-xl group">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                                            Recommended
                                        </Badge>
                                        <div className="text-xs text-muted-foreground">STEM & Core Subjects</div>
                                    </div>
                                    <CardTitle className="text-2xl mt-4">Physics & Maths Tutor</CardTitle>
                                    <CardDescription className="text-base">
                                        The UK''s most trusted student resource for Science, Maths, and English past papers.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">Biology</Badge>
                                        <Badge variant="outline">Chemistry</Badge>
                                        <Badge variant="outline">Physics</Badge>
                                        <Badge variant="outline">Maths</Badge>
                                        <Badge variant="outline">English</Badge>
                                        <Badge variant="outline">History</Badge>
                                        <Badge variant="outline">Geography</Badge>
                                    </div>
                                    <Button
                                        className="w-full h-14 text-lg font-bold gap-3 bg-blue-600 hover:bg-blue-700"
                                        asChild
                                    >
                                        <a href="https://www.physicsandmathstutor.com/past-papers/" target="_blank" rel="noopener noreferrer">
                                            Open PMT Past Papers <ExternalLink className="h-5 w-5" />
                                        </a>
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground">
                                        Opens in a new tab • physicsandmathstutor.com
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-xl group">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                                            Full Coverage
                                        </Badge>
                                        <div className="text-xs text-muted-foreground">All AQA Subjects</div>
                                    </div>
                                    <CardTitle className="text-2xl mt-4">PapaCambridge</CardTitle>
                                    <CardDescription className="text-base">
                                        Comprehensive archive covering every AQA subject including Business & Languages.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">Business</Badge>
                                        <Badge variant="outline">French</Badge>
                                        <Badge variant="outline">Spanish</Badge>
                                        <Badge variant="outline">German</Badge>
                                        <Badge variant="outline">PE</Badge>
                                        <Badge variant="outline">+ All Others</Badge>
                                    </div>
                                    <Button
                                        className="w-full h-14 text-lg font-bold gap-3 bg-purple-600 hover:bg-purple-700"
                                        asChild
                                    >
                                        <a href="https://pastpapers.papacambridge.com/papers/aqa/gcse" target="_blank" rel="noopener noreferrer">
                                            Open PapaCambridge <ExternalLink className="h-5 w-5" />
                                        </a>
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground">
                                        Opens in a new tab • papacambridge.com
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

