import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { hasPremium } from "@/lib/premium";
import {
    Brain,
    Calculator,
    Calendar,
    FileText,
    Lock,
    Sparkles,
    Timer,
    Trophy,
    Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PremiumDashboard() {
    const { user, supabase } = useAuth();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [isPremium, setIsPremium] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkPremium = async () => {
            if (user && supabase) {
                try {
                    const premium = await hasPremium(supabase);
                    setIsPremium(premium);
                } catch (error) {
                    console.error("Error checking premium status:", error);
                } finally {
                    setChecking(false);
                }
            } else {
                setChecking(false);
            }
        };
        checkPremium();
    }, [user, supabase]);

    const features = [
        {
            title: "AI Homework Solver",
            description: "Get instant step-by-step solutions for any subject question.",
            icon: Brain,
            path: "/premium/homework-solver",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            title: "Note Condenser",
            description: "Turn pages of notes into concise summaries and flashcards.",
            icon: FileText,
            path: "/premium/note-condenser",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Predicted Grades",
            description: "Calculate your potential grades based on current performance.",
            icon: Calculator,
            path: "/premium/predicted-grades",
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            title: "Focus Mode",
            description: "Distraction-free study timer with Pomodoro technique.",
            icon: Timer,
            path: "/premium/focus-mode",
            color: "text-red-500",
            bg: "bg-red-500/10",
        },
        {
            title: "Leaderboards",
            description: "Compete with other students and track your study streaks.",
            icon: Trophy,
            path: "/premium/leaderboard",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        {
            title: "Virtual Sessions",
            description: "Join weekly group revision sessions led by expert tutors.",
            icon: Users,
            path: "/premium/virtual-sessions",
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
        },
        {
            title: "Homework Tracker",
            description: "Track assignments with smart notifications when they're due.",
            icon: Calendar,
            path: "/premium/homework-tracker",
            color: "text-pink-500",
            bg: "bg-pink-500/10",
        },
        {
            title: "AI Study Plans",
            description: "Get personalized study schedules based on your exam dates.",
            icon: Sparkles,
            path: "/premium/study-plans",
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
        },
    ];

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10">

                {/* Header Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-600/20 p-8 border border-yellow-500/30">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400">
                                {isPremium ? "Welcome, Premium Member!" : "Unlock Your Potential"}
                            </h1>
                            <p className="text-muted-foreground mt-3 max-w-xl text-lg">
                                {isPremium
                                    ? "Thank you for upgrading! Enjoy unlimited access to all our advanced AI tools and study features."
                                    : "Access advanced AI tools, exclusive content, and powerful study features designed to boost your grades."}
                            </p>
                        </div>

                        {!isPremium && (
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg border-0 text-lg px-8 py-6 h-auto"
                                onClick={() => navigate("/premium")}
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Upgrade to Premium
                            </Button>
                        )}
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-primary/10 bg-card/50 backdrop-blur-sm cursor-pointer"
                            onClick={() => navigate(feature.path)}
                        >
                            <div className={`absolute top-0 left-0 w-1 h-full ${feature.bg.replace('/10', '')} opacity-0 group-hover:opacity-100 transition-opacity`} />

                            <CardHeader>
                                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:bg-opacity-20 transition-all`}>
                                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                                <CardDescription className="line-clamp-2 mt-2">
                                    {feature.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                {/* <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-0 group-hover:w-full transition-all duration-700 ease-out" />
                </div> */}
                            </CardContent>

                            <CardFooter className="pt-0 flex justify-between items-center text-sm text-muted-foreground">
                                <span className="group-hover:text-primary transition-colors">
                                    {!isPremium ? "Premium Only" : "Launch Tool"}
                                </span>
                                {!isPremium ? (
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                    <feature.icon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300" />
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
