import { XpRewardPopup } from "@/components/XpRewardPopup";
import { AppLayout } from "@/components/layout/AppLayout";
import { LimitReachedDialog } from "@/components/premium/LimitReachedDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { chatWithAI, evaluateAnswer } from "@/lib/ai-client";
import { hasPremium } from "@/lib/premium";
import { cn } from "@/lib/utils";
import { awardXP, XP_REWARDS } from "@/lib/xp";
import {
    ArrowRight,
    Brain,
    CheckCircle2,
    Crown,
    Eye,
    GraduationCap,
    HelpCircle,
    Loader2,
    RotateCcw,
    Sparkles,
    Trophy,
    XCircle,
    Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const GCSE_SUBJECTS = [
    "Mathematics",
    "English Language",
    "English Literature",
    "Biology",
    "Chemistry",
    "Physics",
    "Combined Science",
    "History",
    "Geography",
    "Computer Science",
    "Religious Studies",
    "French",
    "Spanish",
    "German",
    "Art & Design",
    "Business Studies",
    "Economics",
    "Psychology",
    "Sociology",
    "Music",
    "Drama",
    "Physical Education",
    "Food Technology",
    "Design & Technology",
];

interface QuizState {
    question: string;
    modelAnswer: string;
    subject: string;
    difficulty: string;
}

interface EvalResult {
    isCorrect: boolean;
    similarity: number;
    feedback: string;
}

export default function UnlimitedQuizzes() {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [isPremium, setIsPremium] = useState(false);
    const [checkingPremium, setCheckingPremium] = useState(true);

    // Quiz config
    const [subject, setSubject] = useState("");
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

    // Quiz state
    const [currentQuiz, setCurrentQuiz] = useState<QuizState | null>(null);
    const [studentAnswer, setStudentAnswer] = useState("");
    const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
    const [generating, setGenerating] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
    const [limitReached, setLimitReached] = useState(false);

    // New: Try Again & Show Answer state
    const [showingAnswer, setShowingAnswer] = useState(false);
    const [retryMode, setRetryMode] = useState(false);

    // XP Popup state
    const [xpPopup, setXpPopup] = useState<{ show: boolean; amount: number; reason: string }>({
        show: false,
        amount: 0,
        reason: "",
    });

    // Check premium
    useEffect(() => {
        const check = async () => {
            if (!user || !supabase) {
                setCheckingPremium(false);
                return;
            }
            try {
                setIsPremium(await hasPremium(supabase));
            } catch {
                setIsPremium(false);
            } finally {
                setCheckingPremium(false);
            }
        };
        check();
    }, [user, supabase]);

    const showXpReward = (amount: number, reason: string) => {
        setXpPopup({ show: true, amount, reason });
    };

    const generateQuizQuestion = async () => {
        if (!subject) {
            toast({ title: "Select a subject", description: "Please choose a subject first.", variant: "destructive" });
            return;
        }

        setGenerating(true);
        setEvalResult(null);
        setStudentAnswer("");
        setCurrentQuiz(null);
        setShowingAnswer(false);
        setRetryMode(false);

        try {
            const topicContext = topic ? ` specifically about "${topic}"` : "";
            const avoidList = previousQuestions.length > 0
                ? `\n\nIMPORTANT: Do NOT repeat any of these previously asked questions:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\nGenerate a COMPLETELY DIFFERENT question.`
                : "";
            const prompt = `Generate a single ${difficulty} difficulty GCSE ${subject} quiz question${topicContext}. 

IMPORTANT: You MUST respond with ONLY valid JSON, no other text. Use this exact format:
{"question": "Your question here?", "answer": "The correct model answer here"}

Rules:
- The question should test understanding, not just recall
- Make it clear, specific, and answerable in 1-3 sentences
- The answer should be concise but complete (1-3 sentences)
- Do NOT include any text outside the JSON object${avoidList}`;

            const result = await chatWithAI(
                { message: prompt, language: "en" },
                supabase
            );

            if (result.error) {
                if (result.error.includes("limit")) {
                    setLimitReached(true);
                    return;
                }
                throw new Error(result.error);
            }

            const reply = (result.data as any)?.reply;
            if (!reply) throw new Error("No response from AI");

            // Parse the JSON response
            let parsed: { question: string; answer: string };
            try {
                const jsonMatch = reply.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error("No JSON found");
                }
            } catch {
                try {
                    parsed = JSON.parse(reply);
                } catch {
                    throw new Error("Failed to parse question. Please try again.");
                }
            }

            if (!parsed.question || !parsed.answer) {
                throw new Error("Invalid question format. Please try again.");
            }

            setCurrentQuiz({
                question: parsed.question,
                modelAnswer: parsed.answer,
                subject,
                difficulty,
            });
            setPreviousQuestions(prev => [...prev, parsed.question]);
            setQuestionCount(prev => prev + 1);

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to generate question. Please try again.",
                variant: "destructive",
            });
        } finally {
            setGenerating(false);
        }
    };

    const submitAnswer = async () => {
        if (!currentQuiz || !studentAnswer.trim()) {
            toast({ title: "Write an answer", description: "Please type your answer before submitting.", variant: "destructive" });
            return;
        }

        setEvaluating(true);

        try {
            const result = await evaluateAnswer(
                {
                    correctAnswer: currentQuiz.modelAnswer,
                    studentAnswer: studentAnswer.trim(),
                    threshold: 0.5,
                },
                supabase
            );

            if (result.error) {
                if (result.error.includes("limit")) {
                    setLimitReached(true);
                    return;
                }
                throw new Error(result.error);
            }

            const data = result.data as any;
            const evalData: EvalResult = {
                isCorrect: data.isCorrect,
                similarity: data.similarity,
                feedback: data.feedback,
            };

            setEvalResult(evalData);
            setRetryMode(false);

            // Award XP
            if (user) {
                if (evalData.isCorrect) {
                    setCorrectCount(prev => prev + 1);
                    await awardXP(supabase, user.id, XP_REWARDS.QUIZ_CORRECT, "quiz_correct");
                    showXpReward(XP_REWARDS.QUIZ_CORRECT, "Correct Answer!");
                } else {
                    await awardXP(supabase, user.id, XP_REWARDS.QUIZ_ATTEMPT, "quiz_attempt");
                    showXpReward(XP_REWARDS.QUIZ_ATTEMPT, "Good Attempt!");
                }
            }

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to evaluate answer.",
                variant: "destructive",
            });
        } finally {
            setEvaluating(false);
        }
    };

    const handleTryAgain = () => {
        setEvalResult(null);
        setStudentAnswer("");
        setRetryMode(true);
        setShowingAnswer(false);
    };

    const handleShowAnswer = () => {
        setShowingAnswer(true);
    };

    const resetQuiz = () => {
        setCurrentQuiz(null);
        setStudentAnswer("");
        setEvalResult(null);
        setQuestionCount(0);
        setCorrectCount(0);
        setPreviousQuestions([]);
        setShowingAnswer(false);
        setRetryMode(false);
    };

    // Loading state
    if (checkingPremium) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AppLayout>
        );
    }

    const FREE_DAILY_LIMIT = 5;

    return (
        <AppLayout>
            <LimitReachedDialog open={limitReached} onOpenChange={setLimitReached} />
            <XpRewardPopup
                amount={xpPopup.amount}
                reason={xpPopup.reason}
                show={xpPopup.show}
                onDone={() => setXpPopup(p => ({ ...p, show: false }))}
            />

            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">

                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 rounded-xl bg-violet-500/10 text-violet-500">
                        <Zap className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            {isPremium ? "Unlimited Quizzes" : "Five-a-Day"}
                            {isPremium && (
                                <Crown className="w-6 h-6 text-amber-500" />
                            )}
                        </h1>
                        <p className="text-muted-foreground">
                            {isPremium
                                ? "AI-generated questions — test yourself on any GCSE topic"
                                : `${FREE_DAILY_LIMIT} free questions per day — upgrade for unlimited`}
                        </p>
                    </div>
                </div>

                {/* Stats Bar */}
                {questionCount > 0 && (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{questionCount} questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">{correctCount} correct</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                {questionCount > 0 ? Math.round((correctCount / questionCount) * 100) : 0}% accuracy
                            </span>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-auto gap-1" onClick={resetQuiz}>
                            <RotateCcw className="w-3 h-3" />
                            Reset
                        </Button>
                    </div>
                )}

                {/* Subject & Topic Selection */}
                {!currentQuiz && !generating && (
                    <Card className="border-2 border-violet-500/20 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-violet-500" />
                                Start a Quiz
                            </CardTitle>
                            <CardDescription>
                                Choose your subject and topic, then let AI generate questions for you
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Subject *</Label>
                                    <Select value={subject} onValueChange={setSubject}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {GCSE_SUBJECTS.map(s => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Difficulty</Label>
                                    <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="easy">Easy</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="hard">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Topic (optional)</Label>
                                <Input
                                    placeholder="e.g. Photosynthesis, Quadratic equations, WW2..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md"
                                size="lg"
                                onClick={generateQuizQuestion}
                                disabled={generating || !subject}
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating Question...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 mr-2" />
                                        Generate Question
                                    </>
                                )}
                            </Button>
                            {!isPremium && (
                                <p className="text-xs text-center text-muted-foreground">
                                    Free users: {FREE_DAILY_LIMIT} questions/day · <button onClick={() => navigate("/premium-dashboard")} className="text-violet-500 hover:underline font-medium">Upgrade for unlimited</button>
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Loading State */}
                {!currentQuiz && generating && (
                    <Card className="border-2 border-violet-500/20 shadow-lg">
                        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="p-4 rounded-full bg-violet-500/10 animate-pulse">
                                <Brain className="w-8 h-8 text-violet-500" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-lg font-semibold">Generating your question...</p>
                                <p className="text-sm text-muted-foreground">The AI is crafting a new {difficulty} {subject} question</p>
                            </div>
                            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                        </CardContent>
                    </Card>
                )}

                {/* Quiz Question */}
                {currentQuiz && (
                    <div className="space-y-4">
                        {/* Question Card */}
                        <Card className={cn(
                            "border-2 transition-all duration-300",
                            evalResult
                                ? evalResult.isCorrect
                                    ? "border-green-500/50 bg-green-500/5"
                                    : "border-red-500/50 bg-red-500/5"
                                : "border-violet-500/30"
                        )}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-violet-500/10">
                                            <Brain className="w-5 h-5 text-violet-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                                {currentQuiz.subject} · {currentQuiz.difficulty}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Question #{questionCount}
                                                {retryMode && <span className="text-amber-500 ml-1">(Retry)</span>}
                                            </p>
                                        </div>
                                    </div>
                                    {/* XP Badge */}
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium">
                                        <Zap className="w-3 h-3" />
                                        +{XP_REWARDS.QUIZ_CORRECT} XP
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Question */}
                                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                                    <p className="text-lg font-medium leading-relaxed">
                                        {currentQuiz.question}
                                    </p>
                                </div>

                                {/* Show Answer (before submitting) */}
                                {showingAnswer && !evalResult && (
                                    <div className="space-y-1 animate-fade-in">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Model answer (revealed)</p>
                                        <p className="text-sm p-3 rounded-lg bg-violet-500/5 border border-violet-500/20 text-violet-900 dark:text-violet-100 font-medium">{currentQuiz.modelAnswer}</p>
                                        <p className="text-xs text-muted-foreground italic mt-1">This question has been marked as viewed. Try the next one!</p>
                                        <Button
                                            className="w-full mt-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md"
                                            size="lg"
                                            onClick={generateQuizQuestion}
                                            disabled={generating}
                                        >
                                            {generating ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowRight className="w-4 h-4 mr-2" />
                                                    Next Question
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}

                                {/* Answer Input */}
                                {!evalResult && !showingAnswer && (
                                    <div className="space-y-3">
                                        <Label className="text-base font-medium">Your Answer</Label>
                                        <textarea
                                            className="w-full min-h-[100px] p-3 rounded-xl border border-border bg-background resize-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all text-sm"
                                            placeholder="Type your answer here..."
                                            value={studentAnswer}
                                            onChange={(e) => setStudentAnswer(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && e.ctrlKey) {
                                                    submitAnswer();
                                                }
                                            }}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                                                onClick={submitAnswer}
                                                disabled={evaluating || !studentAnswer.trim()}
                                            >
                                                {evaluating ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Checking...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                                        Submit Answer
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleShowAnswer}
                                                title="Reveal the answer"
                                                className="gap-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Show Answer
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={generateQuizQuestion}
                                                disabled={generating}
                                                title="Skip this question"
                                            >
                                                Skip
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground text-center">
                                            Press <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">Enter</kbd> to submit
                                        </p>
                                    </div>
                                )}

                                {/* Result */}
                                {evalResult && (
                                    <div className="space-y-4 animate-fade-in">
                                        {/* Correct/Incorrect Banner */}
                                        <div className={cn(
                                            "flex items-center gap-3 p-4 rounded-xl",
                                            evalResult.isCorrect
                                                ? "bg-green-500/10 border border-green-500/30"
                                                : "bg-red-500/10 border border-red-500/30"
                                        )}>
                                            {evalResult.isCorrect ? (
                                                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                            )}
                                            <div className="flex-1">
                                                <p className={cn(
                                                    "font-semibold text-lg",
                                                    evalResult.isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                                )}>
                                                    {evalResult.isCorrect ? "Correct! 🎉" : "Not quite right"}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    {evalResult.feedback}
                                                </p>
                                            </div>
                                            {/* XP earned indicator */}
                                            <div className={cn(
                                                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold",
                                                evalResult.isCorrect
                                                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                                    : "bg-muted text-muted-foreground"
                                            )}>
                                                <Zap className="w-3 h-3" />
                                                +{evalResult.isCorrect ? XP_REWARDS.QUIZ_CORRECT : XP_REWARDS.QUIZ_ATTEMPT} XP
                                            </div>
                                        </div>

                                        {/* Your Answer */}
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your answer</p>
                                            <p className="text-sm p-3 rounded-lg bg-muted/50 border border-border/50">{studentAnswer}</p>
                                        </div>

                                        {/* Model Answer */}
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Model answer</p>
                                            <p className="text-sm p-3 rounded-lg bg-violet-500/5 border border-violet-500/20 text-violet-900 dark:text-violet-100 font-medium">{currentQuiz.modelAnswer}</p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            {/* Try Again (only if wrong) */}
                                            {!evalResult.isCorrect && (
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 gap-2 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                                                    onClick={handleTryAgain}
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                    Try Again
                                                </Button>
                                            )}

                                            {/* Next Question */}
                                            <Button
                                                className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md"
                                                size="lg"
                                                onClick={generateQuizQuestion}
                                                disabled={generating}
                                            >
                                                {generating ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArrowRight className="w-4 h-4 mr-2" />
                                                        Next Question
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {/* AI Examiner Promotion Banner */}
                                        <div
                                            className="mt-4 p-4 rounded-xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 border border-rose-500/20 cursor-pointer hover:border-rose-500/40 transition-all group"
                                            onClick={() => navigate('/premium/ai-examiner')}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-500 group-hover:bg-rose-500/25 transition-colors">
                                                    <GraduationCap className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-foreground">Want exam-style marking?</p>
                                                    <p className="text-xs text-muted-foreground">Try AI Examiner — get detailed mark schemes and examiner feedback on your answers →</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
