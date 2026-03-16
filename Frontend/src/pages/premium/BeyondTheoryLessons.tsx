import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { hasPremium } from "@/lib/premium";
import { BookOpen, ChevronLeft, Crown, FlaskConical, GraduationCap, Lightbulb, Lock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BeyondTheoryLessons() {
    const { supabase, user } = useAuth();
    const navigate = useNavigate();
    const [isPremium, setIsPremium] = useState(false);
    const [checkingPremium, setCheckingPremium] = useState(true);

    useEffect(() => {
        if (user) {
            checkPremiumStatus();
        } else {
            setCheckingPremium(false);
        }
    }, [user]);

    const checkPremiumStatus = async () => {
        if (!user || !supabase) return;
        try {
            const premium = await hasPremium(supabase);
            setIsPremium(premium);
        } catch (error) {
            console.error("Error checking premium status:", error);
        } finally {
            setCheckingPremium(false);
        }
    };

    if (checkingPremium) {
        return (
            <AppLayout>
                <div className="max-w-6xl mx-auto flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    if (!isPremium) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto animate-fade-in">
                    <div className="glass-card p-12 text-center">
                        <div className="relative inline-block mb-6">
                            <BookOpen className="h-20 w-20 text-muted-foreground/50" />
                            <div className="absolute -top-2 -right-2 p-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600">
                                <Lock className="h-5 w-5 text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-foreground mb-4">
                            Beyond Theory Lessons
                        </h1>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            Go beyond textbooks with real-world applications, exam technique masterclasses, and interactive case studies.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
                                onClick={() => navigate("/premium-dashboard")}
                            >
                                <Crown className="h-5 w-5 mr-2" />
                                Upgrade to Premium
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => navigate(-1)}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Go Back
                            </Button>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto animate-fade-in pb-12">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20">
                        <BookOpen className="w-8 h-8 text-teal-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold">Beyond Theory Lessons</h1>
                            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
                                <Crown className="w-3 h-3 mr-1" />
                                Premium
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Go beyond textbooks — practical skills, exam techniques, and real-world connections
                        </p>
                    </div>
                </div>

                {/* Coming Soon Content */}
                <Card className="p-12 text-center border-dashed">
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative mb-6">
                            <Sparkles className="h-20 w-20 text-teal-500/50 animate-pulse" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <BookOpen className="h-10 w-10 text-teal-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
                        <p className="text-muted-foreground max-w-lg mb-8">
                            Beyond Theory Lessons will help you go further than revision notes alone.
                            Get ready for practical applications, exam technique sessions, and interactive case studies that bring your subjects to life.
                        </p>

                        {/* Feature Preview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-8">
                            <div className="p-4 rounded-xl bg-muted/50 text-left">
                                <Lightbulb className="h-8 w-8 text-teal-500 mb-3" />
                                <h3 className="font-semibold text-foreground mb-1">Real-World Application</h3>
                                <p className="text-sm text-muted-foreground">Connect theory to practical, real-world scenarios across all subjects</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/50 text-left">
                                <GraduationCap className="h-8 w-8 text-emerald-500 mb-3" />
                                <h3 className="font-semibold text-foreground mb-1">Exam Technique Masterclasses</h3>
                                <p className="text-sm text-muted-foreground">Learn how to structure answers for top marks in every subject</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/50 text-left">
                                <FlaskConical className="h-8 w-8 text-cyan-500 mb-3" />
                                <h3 className="font-semibold text-foreground mb-1">Interactive Case Studies</h3>
                                <p className="text-sm text-muted-foreground">Explore subject-specific case studies that go beyond the textbook</p>
                            </div>
                        </div>

                        <Button variant="outline" onClick={() => navigate("/premium-dashboard")}>
                            Back to Dashboard
                        </Button>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
