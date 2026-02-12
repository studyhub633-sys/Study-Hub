import { AppLayout } from "@/components/layout/AppLayout";
import { LimitReachedDialog } from "@/components/premium/LimitReachedDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { chatWithAI } from "@/lib/ai-client";
import { hasPremium } from "@/lib/premium";
import { Brain, Loader2, Sparkles, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function HomeworkSolver() {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const [question, setQuestion] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [solution, setSolution] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [imageFileName, setImageFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkPremiumStatus = async () => {
            if (!user || !supabase) {
                setChecking(false);
                return;
            }
            try {
                const premium = await hasPremium(supabase);
                setIsPremium(premium);
            } catch (error) {
                console.error("Error checking premium status:", error);
            } finally {
                setChecking(false);
            }
        };
        checkPremiumStatus();
    }, [user]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid file",
                description: "Please upload an image file (PNG, JPG, GIF, etc.)",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please upload an image smaller than 5MB",
                variant: "destructive",
            });
            return;
        }

        // Read and display the image
        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadedImage(e.target?.result as string);
            setImageFileName(file.name);
            toast({
                title: "Image uploaded",
                description: "You can add a specific question or just click Solve to analyze the image.",
            });
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setUploadedImage(null);
        setImageFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSolve = async () => {
        if (!question.trim() && !uploadedImage) {
            toast({
                title: "Error",
                description: "Please enter a question or upload an image to solve.",
                variant: "destructive",
            });
            return;
        }

        setIsAnalyzing(true);
        setSolution(null);

        try {
            let prompt = `Please solve this homework question step-by-step. Provide a clear explanation of each step, show your work, and explain the reasoning behind each step. If applicable, identify the key concepts being tested.`;

            if (question) {
                prompt += `\n\nQuestion: ${question}`;
            }

            const result = await chatWithAI(
                {
                    message: prompt,
                    context: "You are an expert tutor who provides clear, step-by-step solutions to homework problems. Always show your work and explain your reasoning.",
                    image: uploadedImage || undefined
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
                setSolution(reply);
                toast({
                    title: "Success",
                    description: "Solution generated successfully!",
                });
            } else {
                throw new Error("No response from AI");
            }
        } catch (error: any) {
            console.error("Error solving homework:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to solve question. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Limit Reached State
    const [limitReached, setLimitReached] = useState(false);

    if (checking) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AppLayout>
        );
    }

    if (!isPremium) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto py-12">
                    <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="w-6 h-6 text-amber-500" />
                                Premium Feature
                            </CardTitle>
                            <CardDescription>
                                AI Homework Solver is a premium feature
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Upgrade to premium to get instant, step-by-step solutions for any subject.
                            </p>
                            <Button
                                onClick={() => window.location.href = '/premium-dashboard'}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                View Premium Plans
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <LimitReachedDialog open={limitReached} onOpenChange={setLimitReached} />
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
                            {/* Image Preview */}
                            {uploadedImage && (
                                <div className="relative rounded-lg border-2 border-dashed border-purple-500/30 p-2 bg-purple-500/5">
                                    <img
                                        src={uploadedImage}
                                        alt="Uploaded homework"
                                        className="max-h-[150px] w-full object-contain rounded"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                        onClick={handleRemoveImage}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-1 text-center truncate">
                                        {imageFileName}
                                    </p>
                                </div>
                            )}

                            <Textarea
                                placeholder={uploadedImage
                                    ? "Add any specific instructions or context for the image..."
                                    : "Paste your homework question here..."}
                                className="min-h-[150px] resize-none"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                            />

                            {/* Hidden file input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />

                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {uploadedImage ? "Change Image" : "Upload Image"}
                                </Button>
                                <Button
                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    onClick={handleSolve}
                                    disabled={(!question && !uploadedImage) || isAnalyzing}
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
                                <div className="prose dark:prose-invert max-h-[400px] overflow-y-auto">
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
