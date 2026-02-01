import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { hasPremium } from "@/lib/premium";
import { ChevronLeft, Crown, Layers, Lock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Grade9Flashcards() {
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
                            <Layers className="h-20 w-20 text-muted-foreground/50" />
                            <div className="absolute -top-2 -right-2 p-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600">
                                <Lock className="h-5 w-5 text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-foreground mb-4">
                            Grade 9 Premium Flashcards
                        </h1>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            Unlock exclusive Grade 9 flashcards designed to help you commit key concepts to memory.
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
                    <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20">
                        <Layers className="w-8 h-8 text-yellow-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold">Grade 9 Premium Flashcards</h1>
                            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
                                <Crown className="w-3 h-3 mr-1" />
                                Premium
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Exclusive flashcards for top marks
                        </p>
                    </div>
                </div>

                {/* Coming Soon Content with Feature Preview */}
                <Card className="p-8 md:p-12 text-center border-dashed">
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative mb-6">
                            <Sparkles className="h-20 w-20 text-yellow-500/50 animate-pulse" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Layers className="h-10 w-10 text-yellow-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
                        <p className="text-muted-foreground max-w-lg mb-8">
                            We're curating the best Grade 9 flashcard sets to help you commit key concepts to memory
                            and achieve top marks in your exams. Check back soon!
                        </p>

                        {/* Feature Preview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
                            <div className="p-4 rounded-xl bg-muted/50 text-left">
                                <div className="p-2 rounded-lg bg-blue-500/10 w-fit mb-3">
                                    <Layers className="h-6 w-6 text-blue-500" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">Spaced Repetition</h3>
                                <p className="text-sm text-muted-foreground">Smart algorithm to optimise your review schedule</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/50 text-left">
                                <div className="p-2 rounded-lg bg-purple-500/10 w-fit mb-3">
                                    <Crown className="h-6 w-6 text-purple-500" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">Expert Content</h3>
                                <p className="text-sm text-muted-foreground">Created by top GCSE tutors and examiners</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/50 text-left">
                                <div className="p-2 rounded-lg bg-green-500/10 w-fit mb-3">
                                    <Sparkles className="h-6 w-6 text-green-500" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">All Subjects</h3>
                                <p className="text-sm text-muted-foreground">Maths, Science, English, and more coming</p>
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
