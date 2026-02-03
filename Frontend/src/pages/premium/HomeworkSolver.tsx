import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { chatWithAI } from "@/lib/ai-client";
import { Brain, Sparkles, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

export default function HomeworkSolver() {
    const { supabase } = useAuth();
    const { toast } = useToast();
    const [question, setQuestion] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [solution, setSolution] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [imageFileName, setImageFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                description: "Describe the problem in the text area to get AI assistance.",
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

            if (uploadedImage) {
                prompt += `\n\nNote: The student has uploaded an image of their homework. They have described the question as follows:`;
            }

            prompt += `\n\nQuestion: ${question || "Please analyze and solve the problem shown in the uploaded image."}`;

            const result = await chatWithAI(
                {
                    message: prompt,
                    context: "You are an expert tutor who provides clear, step-by-step solutions to homework problems. Always show your work and explain your reasoning.",
                },
                supabase
            );

            if (result.error) {
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
                                    ? "Describe what you need help with from the image..."
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
