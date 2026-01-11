import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { hasPremium } from "@/lib/premium";
import { AlertCircle, FileCheck, GraduationCap, Loader2, Plus, Send, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Answer {
    questionNumber: string;
    studentAnswer: string;
    maxMarks: number;
    markScheme?: string;
}

interface GradedAnswer {
    questionNumber: string;
    studentAnswer: string;
    maxMarks: number;
    marksAwarded: number;
    feedback: string;
    strengths?: string[];
    improvements?: string[];
}

interface Results {
    paperTitle: string;
    subject: string;
    examBoard: string;
    year: number;
    totalMarks: number;
    achievedMarks: number;
    percentage: number;
    grade: string;
    gradedAnswers: GradedAnswer[];
}

export default function AIExaminer() {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paperTitle, setPaperTitle] = useState("");
    const [subject, setSubject] = useState("Mathematics");
    const [examBoard, setExamBoard] = useState("AQA");
    const [year, setYear] = useState(2024);
    const [answers, setAnswers] = useState<Answer[]>([
        { questionNumber: "1", studentAnswer: "", maxMarks: 5 }
    ]);
    const [results, setResults] = useState<Results | null>(null);

    useEffect(() => {
        checkPremiumStatus();
    }, [user]);

    const checkPremiumStatus = async () => {
        if (!user || !supabase) return;
        const premium = await hasPremium(supabase);
        setIsPremium(premium);
    };

    const addAnswer = () => {
        setAnswers([
            ...answers,
            { questionNumber: `${answers.length + 1}`, studentAnswer: "", maxMarks: 5 }
        ]);
    };

    const updateAnswer = (index: number, field: keyof Answer, value: any) => {
        const updated = [...answers];
        updated[index] = { ...updated[index], [field]: value };
        setAnswers(updated);
    };

    const removeAnswer = (index: number) => {
        if (answers.length > 1) {
            setAnswers(answers.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async () => {
        if (!paperTitle || answers.some(a => !a.studentAnswer.trim())) {
            toast({
                title: "Error",
                description: "Please fill in paper title and all answers",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const session = await supabase.auth.getSession();
            const response = await fetch('/api/ai/grade-exam', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.data.session?.access_token}`
                },
                body: JSON.stringify({
                    paperTitle,
                    subject,
                    examBoard,
                    year,
                    answers,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to grade exam');
            }

            // Save to database
            const { error } = await supabase.from('exam_submissions').insert({
                user_id: user?.id,
                paper_title: paperTitle,
                subject,
                exam_board: examBoard,
                year,
                total_marks: data.totalMarks,
                achieved_marks: data.achievedMarks,
                grade: data.grade,
                ai_feedback: data,
            });

            if (error) {
                console.error('Error saving submission:', error);
            }

            setResults(data);
            toast({
                title: "Success!",
                description: `Paper marked! You achieved Grade ${data.grade}`,
            });

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isPremium) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto py-12">
                    <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCap className="w-6 h-6 text-amber-500" />
                                Premium Feature
                            </CardTitle>
                            <CardDescription>
                                AI Examiner is a premium feature
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Upgrade to premium to get your past papers marked and graded by AI instantly.
                            </p>
                            <Button
                                onClick={() => window.location.href = '/premium'}
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
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
            <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                        <GraduationCap className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">AI Examiner</h1>
                        <p className="text-muted-foreground">Get your past papers marked and graded by AI</p>
                    </div>
                </div>

                {/* Paper Details */}
                <Card className="animate-slide-up">
                    <CardHeader>
                        <CardTitle>Paper Details</CardTitle>
                        <CardDescription>Enter information about your completed past paper</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Paper Title *</Label>
                                <Input
                                    placeholder="e.g., June 2024 Paper 1"
                                    value={paperTitle}
                                    onChange={(e) => setPaperTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Exam Board</Label>
                                <Input
                                    value={examBoard}
                                    onChange={(e) => setExamBoard(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Year</Label>
                                <Input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(parseInt(e.target.value) || 2024)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Answers */}
                <Card className="animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                    <CardHeader>
                        <CardTitle>Your Answers</CardTitle>
                        <CardDescription>Enter your answers for each question</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {answers.map((answer, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold">Question {answer.questionNumber}</Label>
                                    {answers.length > 1 && (
                                        <Button variant="ghost" size="sm" onClick={() => removeAnswer(index)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Question Number</Label>
                                        <Input
                                            value={answer.questionNumber}
                                            onChange={(e) => updateAnswer(index, 'questionNumber', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Max Marks</Label>
                                        <Input
                                            type="number"
                                            value={answer.maxMarks}
                                            onChange={(e) => updateAnswer(index, 'maxMarks', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Your Answer *</Label>
                                    <Textarea
                                        placeholder="Type your answer here..."
                                        className="min-h-[100px]"
                                        value={answer.studentAnswer}
                                        onChange={(e) => updateAnswer(index, 'studentAnswer', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Mark Scheme (Optional)</Label>
                                    <Textarea
                                        placeholder="Paste mark scheme if available..."
                                        className="min-h-[60px]"
                                        value={answer.markScheme || ""}
                                        onChange={(e) => updateAnswer(index, 'markScheme', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full border-dashed" onClick={addAnswer}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Another Question
                        </Button>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 animate-slide-up"
                    style={{ animationDelay: '0.2s', opacity: 0 }}
                    size="lg"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Marking...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5 mr-2" />
                            Submit for AI Marking
                        </>
                    )}
                </Button>

                {/* Results */}
                {results && (
                    <Card className="border-green-500/20 bg-green-500/5 animate-slide-up">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <FileCheck className="w-6 h-6 text-green-500" />
                                <div>
                                    <CardTitle className="text-green-700 dark:text-green-400">
                                        Results: Grade {results.grade}
                                    </CardTitle>
                                    <CardDescription>
                                        {results.achievedMarks}/{results.totalMarks} marks ({results.percentage}%)
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {results.gradedAnswers?.map((answer, index) => (
                                <div key={index} className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold">Question {answer.questionNumber}</span>
                                        <span className={`text-sm font-medium px-2 py-1 rounded ${(answer.marksAwarded / answer.maxMarks) >= 0.7 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                (answer.marksAwarded / answer.maxMarks) >= 0.5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {answer.marksAwarded}/{answer.maxMarks} marks
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3 italic">{answer.feedback}</p>
                                    {answer.strengths && answer.strengths.length > 0 && (
                                        <div className="text-sm mb-2">
                                            <span className="font-medium text-green-600 dark:text-green-400">✓ Strengths:</span>
                                            <ul className="list-disc list-inside ml-2 mt-1">
                                                {answer.strengths.map((s, i) => (
                                                    <li key={i} className="text-muted-foreground">{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {answer.improvements && answer.improvements.length > 0 && (
                                        <div className="text-sm">
                                            <span className="font-medium text-amber-600 dark:text-amber-400">⚠ Improvements:</span>
                                            <ul className="list-disc list-inside ml-2 mt-1">
                                                {answer.improvements.map((s, i) => (
                                                    <li key={i} className="text-muted-foreground">{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Info */}
                {!results && (
                    <Card className="border-blue-500/20 bg-blue-500/5 animate-slide-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-1">How it works</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Our AI examiner uses advanced language models to mark your answers against GCSE marking criteria.
                                        You'll receive detailed feedback, marks for each question, and an overall grade. Results are saved
                                        to your performance analytics for tracking progress over time.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
