import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, ChevronRight, GraduationCap, Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface ModelAnswer {
    id: string;
    title: string;
    subject: string;
    exam_board: string | null;
    grade: string;
    content: string;
    created_at: string;
}

export default function ModelAnswers() {
    const { supabase } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [featuredAnswer, setFeaturedAnswer] = useState<ModelAnswer | null>(null);
    const [subjects, setSubjects] = useState<Array<{ name: string; count: number; color: string; bg: string }>>([]);

    useEffect(() => {
        fetchModelAnswers();
    }, []);

    const fetchModelAnswers = async () => {
        try {
            setLoading(true);
            // Try to fetch from model_answers table if it exists
            // For now, we'll use a fallback with sample data structure
            const { data, error } = await supabase
                .from("model_answers")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) {
                // Table doesn't exist yet - use sample data
                console.log("Model answers table not found, using sample data");
                const sampleSubjects = [
                    { name: "Mathematics", count: 120, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { name: "English Literature", count: 85, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                    { name: "Biology", count: 94, color: "text-green-500", bg: "bg-green-500/10" },
                    { name: "Chemistry", count: 88, color: "text-purple-500", bg: "bg-purple-500/10" },
                    { name: "Physics", count: 91, color: "text-red-500", bg: "bg-red-500/10" },
                ];
                setSubjects(sampleSubjects);
                setFeaturedAnswer({
                    id: "sample-1",
                    title: "Macbeth: The Theme of Ambition (Grade 9)",
                    subject: "English Literature",
                    exam_board: "AQA",
                    grade: "9",
                    content: "",
                    created_at: new Date().toISOString(),
                });
            } else if (data && data.length > 0) {
                // Process real data
                const subjectCounts: Record<string, number> = {};
                data.forEach((answer: any) => {
                    const subject = answer.subject || "Other";
                    subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
                });

                const subjectColors: Record<string, { color: string; bg: string }> = {
                    "Mathematics": { color: "text-blue-500", bg: "bg-blue-500/10" },
                    "English Literature": { color: "text-yellow-500", bg: "bg-yellow-500/10" },
                    "Biology": { color: "text-green-500", bg: "bg-green-500/10" },
                    "Chemistry": { color: "text-purple-500", bg: "bg-purple-500/10" },
                    "Physics": { color: "text-red-500", bg: "bg-red-500/10" },
                };

                const processedSubjects = Object.entries(subjectCounts).map(([name, count]) => ({
                    name,
                    count,
                    color: subjectColors[name]?.color || "text-gray-500",
                    bg: subjectColors[name]?.bg || "bg-gray-500/10",
                }));

                setSubjects(processedSubjects);
                setFeaturedAnswer(data[0] as ModelAnswer);
            }
        } catch (error: any) {
            console.error("Error fetching model answers:", error);
            // Fallback to sample data
            const sampleSubjects = [
                { name: "Mathematics", count: 120, color: "text-blue-500", bg: "bg-blue-500/10" },
                { name: "English Literature", count: 85, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                { name: "Biology", count: 94, color: "text-green-500", bg: "bg-green-500/10" },
                { name: "Chemistry", count: 88, color: "text-purple-500", bg: "bg-purple-500/10" },
                { name: "Physics", count: 91, color: "text-red-500", bg: "bg-red-500/10" },
            ];
            setSubjects(sampleSubjects);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">A* Model Answer Bank</h1>
                        <p className="text-muted-foreground">Learn from the best. Access full mark responses for every exam board.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {/* Featured Answer */}
                        {featuredAnswer && (
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 p-6 mb-8">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex-1">
                                        <Badge className="bg-yellow-500 text-white hover:bg-yellow-600 mb-3">Featured this week</Badge>
                                        <h3 className="text-2xl font-bold mb-2">{featuredAnswer.title}</h3>
                                        <p className="text-muted-foreground mb-4">
                                            {featuredAnswer.exam_board && `${featuredAnswer.exam_board} • `}Grade {featuredAnswer.grade} model answer
                                        </p>
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                                onClick={() => {
                                                    // In a real implementation, this would open the full answer
                                                    alert(`Viewing "${featuredAnswer.title}". This feature requires the model_answers table to be set up in the database.`);
                                                }}
                                            >
                                                Read Answer
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-background/50 rounded-xl border shadow-sm rotate-3 transform">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                        </div>
                                        <div className="space-y-2 w-48 opacity-50">
                                            <div className="h-2 bg-foreground rounded-full w-full"></div>
                                            <div className="h-2 bg-foreground rounded-full w-3/4"></div>
                                            <div className="h-2 bg-foreground rounded-full w-5/6"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <h2 className="text-xl font-semibold mb-4">Browse by Subject</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subjects.map((sub, i) => (
                                <Card 
                                    key={i} 
                                    className="hover:border-primary/50 transition-colors cursor-pointer group"
                                    onClick={() => {
                                        // In a real implementation, this would filter/show answers for this subject
                                        alert(`Browsing ${sub.name} model answers. This feature requires the model_answers table to be set up in the database.`);
                                    }}
                                >
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg ${sub.bg} flex items-center justify-center`}>
                                                <BookOpen className={`w-5 h-5 ${sub.color}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{sub.name}</h3>
                                                <p className="text-sm text-muted-foreground">{sub.count} answers</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
