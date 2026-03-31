import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { hasPremium } from "@/lib/premium";
import { Calculator, CheckCircle, Cloud, Loader2, Minus, Save, TrendingDown, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface SubjectGrade {
    name: string;
    grade: string;
    target: string;
}

interface SubjectPrediction {
    name: string;
    currentGrade: number;
    targetGrade: number;
    predictedGrade: number;
    predictedLabel: string;
    status: "exceeding" | "on-track" | "at-risk" | "below";
    message: string;
}

const GRADE_VALUES: Record<string, number> = {
    "9": 9, "8": 8, "7": 7, "6": 6, "5": 5, "4": 4, "3": 3, "2": 2, "1": 1,
};

const GRADE_LABELS: Record<string, string> = {
    "9": "9 (A**)",
    "8": "8 (A*)",
    "7": "7 (A)",
    "6": "6 (B)",
    "5": "5 (C)",
    "4": "4 (C-)",
    "3": "3 (D)",
    "2": "2 (E)",
    "1": "1 (F)",
};

const GRADE_FROM_VALUE = (value: number): string => {
    const clamped = Math.min(9, Math.max(1, Math.round(value)));
    return GRADE_LABELS[String(clamped)] || String(clamped);
};

const SUBJECT_LIST = [
    "Mathematics", "English Literature", "English Language", "Biology",
    "Chemistry", "Physics", "History", "Geography", "French",
    "Spanish", "Computer Science", "Art & Design", "Business Studies",
    "Design & Technology", "Drama", "Economics", "Food Preparation",
    "German", "Music", "PE", "Psychology", "Religious Studies", "Sociology",
];

export default function PredictedGrades() {
    const { supabase, user } = useAuth();
    const [isPremium, setIsPremium] = useState(false);
    const [checking, setChecking] = useState(true);
    const [subjects, setSubjects] = useState<SubjectGrade[]>([{ name: "", grade: "", target: "" }]);
    const [predictions, setPredictions] = useState<SubjectPrediction[] | null>(null);
    const [saved, setSaved] = useState(false);

    const storageKey = user ? `predicted_grades_${user.id}` : null;

    // Load saved data on mount — Supabase first, localStorage as fallback
    useEffect(() => {
        if (!user || !supabase) return;

        const loadData = async () => {
            // Try Supabase first
            try {
                const { data, error } = await supabase
                    .from("predicted_grades")
                    .select("subjects")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (!error && data?.subjects && Array.isArray(data.subjects) && data.subjects.length > 0) {
                    setSubjects(data.subjects);
                    // Sync to localStorage as cache
                    if (storageKey) {
                        localStorage.setItem(storageKey, JSON.stringify({ subjects: data.subjects }));
                    }
                    const validSubjects = data.subjects.filter((s: SubjectGrade) => s.name && s.grade && s.target);
                    if (validSubjects.length > 0) calculatePredictions(data.subjects);
                    return;
                }
            } catch {
                // Table may not exist yet — fall through to localStorage
            }

            // Fallback to localStorage
            if (!storageKey) return;
            try {
                const savedData = localStorage.getItem(storageKey);
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    if (parsed.subjects && Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
                        setSubjects(parsed.subjects);
                        const validSubjects = parsed.subjects.filter((s: SubjectGrade) => s.name && s.grade && s.target);
                        if (validSubjects.length > 0) calculatePredictions(parsed.subjects);
                    }
                }
            } catch (e) {
                console.error("Error loading saved predicted grades:", e);
            }
        };

        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, supabase]);

    // Save to both localStorage (instant) and Supabase (persistent)
    const saveData = useCallback(async () => {
        // Always write to localStorage immediately
        if (storageKey) {
            try {
                localStorage.setItem(storageKey, JSON.stringify({ subjects }));
            } catch { /* ignore */ }
        }

        // Persist to Supabase for cross-device access
        if (user && supabase) {
            try {
                await supabase
                    .from("predicted_grades")
                    .upsert(
                        { user_id: user.id, subjects, updated_at: new Date().toISOString() },
                        { onConflict: "user_id" }
                    );
            } catch {
                // Table may not exist — localStorage is the backup
            }
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }, [storageKey, subjects, user, supabase]);

    // Auto-save to localStorage on subject changes (debounced)
    useEffect(() => {
        if (!storageKey) return;
        const timer = setTimeout(() => {
            const hasAnyData = subjects.some(s => s.name || s.grade || s.target);
            if (hasAnyData) {
                localStorage.setItem(storageKey, JSON.stringify({ subjects }));
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [subjects, storageKey]);

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

    const addSubject = () => {
        setSubjects([...subjects, { name: "", grade: "", target: "" }]);
    };

    const updateSubject = (index: number, field: keyof SubjectGrade, value: string) => {
        const updated = [...subjects];
        updated[index] = { ...updated[index], [field]: value };
        setSubjects(updated);
    };

    const removeSubject = (index: number) => {
        if (subjects.length > 1) {
            setSubjects(subjects.filter((_, i) => i !== index));
        }
    };

    const calculatePredictions = (subjectsToCalc?: SubjectGrade[]) => {
        const data = subjectsToCalc || subjects;
        const validSubjects = data.filter(s => s.name && s.grade && s.target);

        if (validSubjects.length === 0) return;

        const results: SubjectPrediction[] = validSubjects.map(subject => {
            const currentGrade = GRADE_VALUES[subject.grade] || 0;
            const targetGrade = GRADE_VALUES[subject.target] || 0;

            // Predicted grade algorithm:
            // - Base: current grade
            // - If current < target: predict slight improvement (students tend to improve towards exams)
            // - If current >= target: predict maintaining or slight improvement
            // - Factor in how far from target they are
            let predictedValue: number;

            const gap = targetGrade - currentGrade;

            if (gap <= 0) {
                // Already at or above target — predict maintaining with slight possible improvement
                predictedValue = Math.min(9, currentGrade + 0.3);
            } else if (gap === 1) {
                // Close to target — likely to reach it with effort
                predictedValue = currentGrade + 0.7;
            } else if (gap === 2) {
                // Moderate gap — predict partial improvement
                predictedValue = currentGrade + 1.2;
            } else {
                // Large gap — predict some improvement but unlikely to close entirely
                predictedValue = currentGrade + Math.min(gap * 0.4, 2.5);
            }

            const predictedGrade = Math.min(9, Math.max(1, Math.round(predictedValue)));

            let status: SubjectPrediction["status"];
            let message: string;

            if (predictedGrade > targetGrade) {
                status = "exceeding";
                message = `You're on track to exceed your target! Predicted to achieve a ${GRADE_FROM_VALUE(predictedGrade)}.`;
            } else if (predictedGrade === targetGrade) {
                status = "on-track";
                message = `You're on track to hit your target of ${GRADE_FROM_VALUE(targetGrade)}.`;
            } else if (predictedGrade === targetGrade - 1) {
                status = "at-risk";
                message = `Just below your target. With focused revision, you can reach ${GRADE_FROM_VALUE(targetGrade)}.`;
            } else {
                status = "below";
                message = `Needs attention. Currently predicted ${GRADE_FROM_VALUE(predictedGrade)}, target is ${GRADE_FROM_VALUE(targetGrade)}.`;
            }

            return {
                name: subject.name,
                currentGrade,
                targetGrade,
                predictedGrade,
                predictedLabel: GRADE_FROM_VALUE(predictedGrade),
                status,
                message,
            };
        });

        setPredictions(results);
        saveData();
    };

    const getStatusColor = (status: SubjectPrediction["status"]) => {
        switch (status) {
            case "exceeding": return "text-emerald-500";
            case "on-track": return "text-green-500";
            case "at-risk": return "text-amber-500";
            case "below": return "text-red-500";
        }
    };

    const getStatusBg = (status: SubjectPrediction["status"]) => {
        switch (status) {
            case "exceeding": return "bg-emerald-500/10 border-emerald-500/20";
            case "on-track": return "bg-green-500/10 border-green-500/20";
            case "at-risk": return "bg-amber-500/10 border-amber-500/20";
            case "below": return "bg-red-500/10 border-red-500/20";
        }
    };

    const getStatusIcon = (status: SubjectPrediction["status"]) => {
        switch (status) {
            case "exceeding": return <TrendingUp className="w-5 h-5 text-emerald-500" />;
            case "on-track": return <TrendingUp className="w-5 h-5 text-green-500" />;
            case "at-risk": return <Minus className="w-5 h-5 text-amber-500" />;
            case "below": return <TrendingDown className="w-5 h-5 text-red-500" />;
        }
    };

    const getStatusLabel = (status: SubjectPrediction["status"]) => {
        switch (status) {
            case "exceeding": return "Exceeding Target";
            case "on-track": return "On Track";
            case "at-risk": return "At Risk";
            case "below": return "Below Target";
        }
    };

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
                                <Calculator className="w-6 h-6 text-amber-500" />
                                Premium Feature
                            </CardTitle>
                            <CardDescription>
                                Predicted Grades Calculator is a premium feature
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Upgrade to premium to track your performance and get AI-predicted grades for each subject.
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

    const summaryStats = predictions ? {
        exceeding: predictions.filter(p => p.status === "exceeding").length,
        onTrack: predictions.filter(p => p.status === "on-track").length,
        atRisk: predictions.filter(p => p.status === "at-risk").length,
        below: predictions.filter(p => p.status === "below").length,
    } : null;

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                        <Calculator className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Predicted Grades</h1>
                        <p className="text-muted-foreground">See what grades you're predicted to achieve based on your current performance.</p>
                    </div>
                </div>

                {/* Input Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Your Subjects</CardTitle>
                                <CardDescription>Enter your subjects, current mock grades, and target grades.</CardDescription>
                            </div>
                            {saved && (
                                <span className="flex items-center gap-1 text-xs text-green-500 font-medium animate-fade-in">
                                    <Cloud className="w-3 h-3" /> Saved to cloud
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {subjects.map((subject, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pb-4 border-b last:border-0">
                                <div className="space-y-2">
                                    <Label>Subject</Label>
                                    <Select value={subject.name} onValueChange={(value) => updateSubject(index, "name", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SUBJECT_LIST.map((s) => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Current Grade</Label>
                                    <Select value={subject.grade} onValueChange={(value) => updateSubject(index, "grade", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(GRADE_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Grade</Label>
                                    <Select value={subject.target} onValueChange={(value) => updateSubject(index, "target", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Target" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(GRADE_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {subjects.length > 1 && (
                                    <Button variant="ghost" size="icon" onClick={() => removeSubject(index)}>
                                        ×
                                    </Button>
                                )}
                            </div>
                        ))}

                        <Button variant="outline" onClick={addSubject} className="w-full border-dashed">
                            + Add Another Subject
                        </Button>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={saveData} className="gap-2">
                                <Save className="w-4 h-4" />
                                Save
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => calculatePredictions()}>
                                Get My Predicted Grades
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Predictions Results */}
                {predictions && predictions.length > 0 && (
                    <>
                        {/* Summary Stats */}
                        {summaryStats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="glass-card p-4 text-center">
                                    <p className="text-2xl font-bold text-emerald-500">{summaryStats.exceeding}</p>
                                    <p className="text-xs text-muted-foreground font-medium">Exceeding</p>
                                </div>
                                <div className="glass-card p-4 text-center">
                                    <p className="text-2xl font-bold text-green-500">{summaryStats.onTrack}</p>
                                    <p className="text-xs text-muted-foreground font-medium">On Track</p>
                                </div>
                                <div className="glass-card p-4 text-center">
                                    <p className="text-2xl font-bold text-amber-500">{summaryStats.atRisk}</p>
                                    <p className="text-xs text-muted-foreground font-medium">At Risk</p>
                                </div>
                                <div className="glass-card p-4 text-center">
                                    <p className="text-2xl font-bold text-red-500">{summaryStats.below}</p>
                                    <p className="text-xs text-muted-foreground font-medium">Below Target</p>
                                </div>
                            </div>
                        )}

                        {/* Individual Predictions */}
                        <div className="space-y-3">
                            <h2 className="text-xl font-semibold">Your Predicted Grades</h2>
                            {predictions.map((pred, index) => (
                                <Card key={index} className={`border ${getStatusBg(pred.status)} transition-all`}>
                                    <CardContent className="py-5 px-6">
                                        <div className="flex items-center justify-between gap-4 flex-wrap">
                                            {/* Subject & Status */}
                                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                                {getStatusIcon(pred.status)}
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-foreground text-lg">{pred.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{pred.message}</p>
                                                </div>
                                            </div>

                                            {/* Grade Display */}
                                            <div className="flex items-center gap-6 shrink-0">
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current</p>
                                                    <p className="text-xl font-bold text-foreground">{pred.currentGrade}</p>
                                                </div>
                                                <div className="text-muted-foreground text-lg">→</div>
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Predicted</p>
                                                    <p className={`text-2xl font-bold ${getStatusColor(pred.status)}`}>{pred.predictedGrade}</p>
                                                </div>
                                                <div className="text-center opacity-50">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Target</p>
                                                    <p className="text-xl font-bold text-foreground">{pred.targetGrade}</p>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBg(pred.status)} ${getStatusColor(pred.status)} border shrink-0`}>
                                                {getStatusLabel(pred.status)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Focus Areas */}
                        {predictions.some(p => p.status === "below" || p.status === "at-risk") && (
                            <Card className="bg-amber-500/5 border-amber-500/20">
                                <CardContent className="py-5 px-6">
                                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-amber-500" />
                                        Recommended Focus Areas
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        These subjects need extra attention to reach your target grades:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {predictions
                                            .filter(p => p.status === "below" || p.status === "at-risk")
                                            .map((pred, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-lg text-sm font-medium border border-amber-500/20">
                                                    {pred.name}: {GRADE_FROM_VALUE(pred.currentGrade)} → needs {GRADE_FROM_VALUE(pred.targetGrade)}
                                                </span>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
