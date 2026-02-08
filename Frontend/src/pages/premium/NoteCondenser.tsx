import { AppLayout } from "@/components/layout/AppLayout";
import { LimitReachedDialog } from "@/components/premium/LimitReachedDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { chatWithAI } from "@/lib/ai-client";
import { ArrowRight, Copy, FileText, Minimize2 } from "lucide-react";
import { useState } from "react";

export default function NoteCondenser() {
    const { supabase } = useAuth();
    const { toast } = useToast();
    const [notes, setNotes] = useState("");
    const [isCondensing, setIsCondensing] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);

    const handleCondense = async () => {
        if (!notes.trim()) {
            toast({
                title: "Error",
                description: "Please enter some notes to condense.",
                variant: "destructive",
            });
            return;
        }

        setIsCondensing(true);
        setSummary(null);

        try {
            const prompt = `Please condense the following notes into a clear, concise summary. Format your response as follows:

# Summary

- Key point 1: [main point]
- Key point 2: [main point]
- Key point 3: [main point]
[Add more key points as needed]

## Review Questions
1. What is [key concept]?
2. How does [key process] work?
3. [Add 1-2 more review questions]

Notes to condense:
${notes}`;

            const result = await chatWithAI(
                {
                    message: prompt,
                    context: "You are an expert at condensing educational content into clear summaries and review questions.",
                },
                supabase
            );

            if (result.error) {
                // Check for usage limit error
                if (result.error.includes("limit") || result.error.includes("429")) {
                    setLimitReached(true);
                    return;
                }
                throw new Error(result.error);
            }

            const reply = (result.data as any)?.reply;
            if (reply) {
                setSummary(reply);
                toast({
                    title: "Success",
                    description: "Notes condensed successfully!",
                });
            } else {
                throw new Error("No response from AI");
            }
        } catch (error: any) {
            console.error("Error condensing notes:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to condense notes. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsCondensing(false);
        }
    };

    // Limit Reached State
    const [limitReached, setLimitReached] = useState(false);

    return (
        <AppLayout>
            <LimitReachedDialog open={limitReached} onOpenChange={setLimitReached} />
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                        <Minimize2 className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">AI Note Condenser</h1>
                        <p className="text-muted-foreground">Turn long pages of text into concise summaries and cheat sheets.</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr,auto,1fr]">
                    {/* Input Section */}
                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle>Original Notes</CardTitle>
                            <CardDescription>Paste your lecture notes or text here</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Paste your notes here..."
                                className="min-h-[400px] resize-none font-mono text-sm"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    {/* Action Button */}
                    <div className="flex flex-col justify-center gap-4">
                        <Button
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg"
                            onClick={handleCondense}
                            disabled={!notes || isCondensing}
                        >
                            {isCondensing ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <ArrowRight className="w-6 h-6" />
                            )}
                        </Button>
                    </div>

                    {/* Output Section */}
                    <Card className={`flex-1 border-blue-500/20 ${summary ? 'bg-blue-500/5' : ''}`}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>Condensed Summary</span>
                                {summary && (
                                    <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(summary)}>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy
                                    </Button>
                                )}
                            </CardTitle>
                            <CardDescription>
                                {summary ? "AI generated summary" : "Processed notes will appear here"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {summary ? (
                                <div className="prose dark:prose-invert text-sm">
                                    <pre className="whitespace-pre-wrap font-sans">{summary}</pre>
                                </div>
                            ) : (
                                <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground opacity-50 border-2 border-dashed rounded-lg">
                                    <FileText className="w-12 h-12 mb-4" />
                                    <p>Ready to condense</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
