import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Sparkles, Upload } from "lucide-react";
import { useState } from "react";

export default function HomeworkSolver() {
    const [question, setQuestion] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [solution, setSolution] = useState<string | null>(null);

    const handleSolve = () => {
        setIsAnalyzing(true);
        // Mock API call
        setTimeout(() => {
            setIsAnalyzing(false);
            setSolution("Here is a step-by-step solution to your problem...\n\n1. First, identify the key variables...\n2. Apply the relevant formula...\n3. Calculate the result...");
        }, 2000);
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                        <Brain className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">AI Homework Solver</h1>
                        <p className="text-muted-foreground">Get instant, step-by-step solutions for any subject.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Input Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Question</CardTitle>
                            <CardDescription>Type your question or upload an image</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Paste your homework question here..."
                                className="min-h-[200px] resize-none"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                            />
                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Image
                                </Button>
                                <Button
                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    onClick={handleSolve}
                                    disabled={!question && !isAnalyzing}
                                >
                                    {isAnalyzing ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Solve with AI
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Solution Section */}
                    <Card className={`border-purple-500/20 ${solution ? 'bg-purple-500/5' : ''}`}>
                        <CardHeader>
                            <CardTitle>AI Solution</CardTitle>
                            <CardDescription>
                                {solution ? "Analysis complete" : "Solution will appear here"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {solution ? (
                                <div className="prose dark:prose-invert">
                                    <p className="whitespace-pre-line">{solution}</p>

                                    <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                        <h4 className="font-semibold text-purple-400 mb-2 flex items-center">
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Key Concept
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            This problem relates to [Topic Name]. Mastering this concept will help you solve similar problems in the future.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                    <Brain className="w-12 h-12 mb-4" />
                                    <p>Ready to solve</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
