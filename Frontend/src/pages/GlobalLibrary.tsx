
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SmartPaperParser } from "@/lib/paper-parser";
import { ExternalLink, Globe, Info, Library, Plus, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface GlobalPaper {
    id: string;
    title: string;
    subject: string;
    year: number;
    exam_board: string;
    file_url: string;
    file_type: string;
}

export default function GlobalLibrary() {
    const { supabase, user } = useAuth();
    const [papers, setPapers] = useState<GlobalPaper[]>([]);
    const [search, setSearch] = useState("");
    const [quickAddUrl, setQuickAddUrl] = useState("");
    const [isParsing, setIsParsing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchGlobalPapers();
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

    const filteredPapers = papers.filter((paper) =>
        paper.title.toLowerCase().includes(search.toLowerCase()) ||
        paper.subject?.toLowerCase().includes(search.toLowerCase()) ||
        paper.exam_board?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Library className="h-8 w-8 text-primary" />
                            <h1 className="text-4xl font-extrabold tracking-tight">Paper Discovery</h1>
                        </div>
                        <p className="text-muted-foreground text-lg">
                            Explore 100% of AQA papers through our verified study partners.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-sm font-bold uppercase tracking-wider">Trusted Sources Only</span>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="discovery" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/50 backdrop-blur-sm rounded-xl">
                        <TabsTrigger value="discovery" className="rounded-lg font-bold text-base flex gap-2">
                            <Sparkles className="h-4 w-4" /> Recommended Starter Pack
                        </TabsTrigger>
                        <TabsTrigger value="search" className="rounded-lg font-bold text-base flex gap-2">
                            <Globe className="h-4 w-4" /> Live AQA Portal (100% Coverage)
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Discovery / Global Library */}
                    <TabsContent value="discovery" className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Search className="h-5 w-5" />
                                    </div>
                                    <Input
                                        placeholder="Search our curated starters..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 h-14 bg-background border-primary/10 rounded-xl text-lg shadow-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {filteredPapers.map((paper, index) => (
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
                                </div>
                            </div>

                            {/* Quick Add Sidebar */}
                            <Card className="h-fit sticky top-8 border-primary/20 shadow-xl overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                                <CardHeader className="bg-primary/5">
                                    <CardTitle className="flex items-center gap-2 text-primary">
                                        <Sparkles className="h-5 w-5" /> Smart Link Importer
                                    </CardTitle>
                                    <CardDescription>
                                        Found a paper link on PMT or PapaCambridge? Paste it below and we'll auto-format it for you.
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
                                            <Info className="h-3 w-3" /> Note: This uses URLs only. Study Hub does not host or redistribute any PDF files.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Tab 2: External Resources */}
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
                                        Study Hub does not host, frame, or redistribute any copyrighted materials.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* PMT Card */}
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
                                        The UK's most trusted student resource for Science, Maths, and English past papers.
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

                            {/* PapaCambridge Card */}
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

                        {/* How to Use Section */}
                        <Card className="bg-muted/30 border-dashed">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    How to Add Papers to Your Library
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                    <li>Click one of the buttons above to browse past papers</li>
                                    <li>Find a paper you want to practice</li>
                                    <li>Copy the URL from your browser's address bar</li>
                                    <li>Use our <strong className="text-foreground">Smart Link Importer</strong> (in the Starter Pack tab) to add it</li>
                                </ol>
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </AppLayout>
    );
}
