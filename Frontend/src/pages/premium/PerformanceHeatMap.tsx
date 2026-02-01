import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { hasPremium } from "@/lib/premium";
import { AlertCircle, BarChart3, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PerformanceData {
    subject: string;
    topic: string;
    performanceScore: number;
    status: 'red' | 'amber' | 'green';
    totalAttempts: number;
}

export default function PerformanceHeatMap() {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const [isPremium, setIsPremium] = useState(false);
    const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (user) {
            checkPremiumStatus();
            fetchPerformanceData();
        } else {
            setChecking(false);
            setLoading(false);
        }
    }, [user]);

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

    const fetchPerformanceData = async () => {
        try {
            setLoading(true);
            // Fetch performance analytics from database
            const { data: analytics, error } = await supabase
                .from('performance_analytics')
                .select('*')
                .eq('user_id', user?.id)
                .order('performance_score', { ascending: false });

            if (error) throw error;

            if (analytics && analytics.length > 0) {
                const formattedData: PerformanceData[] = analytics.map(a => ({
                    subject: a.subject,
                    topic: a.topic || 'Overall',
                    performanceScore: Math.round(a.performance_score || 0),
                    status: a.status || 'amber',
                    totalAttempts: a.total_attempts || 0,
                }));
                setPerformanceData(formattedData);
            } else {
                // If no analytics, try to calculate from exam submissions
                const { data: submissions, error: subError } = await supabase
                    .from('exam_submissions')
                    .select('*')
                    .eq('user_id', user?.id);

                if (subError) throw subError;

                if (submissions && submissions.length > 0) {
                    // Calculate performance by subject
                    const subjectPerformance = new Map<string, { total: number, achieved: number, count: number }>();

                    submissions.forEach((sub) => {
                        const key = sub.subject;
                        const existing = subjectPerformance.get(key) || { total: 0, achieved: 0, count: 0 };
                        existing.total += sub.total_marks || 0;
                        existing.achieved += sub.achieved_marks || 0;
                        existing.count += 1;
                        subjectPerformance.set(key, existing);
                    });

                    const performanceArray: PerformanceData[] = Array.from(subjectPerformance.entries()).map(([subject, stats]) => {
                        const score = stats.total > 0 ? Math.round((stats.achieved / stats.total) * 100) : 0;
                        return {
                            subject,
                            topic: 'Overall',
                            performanceScore: score,
                            status: score >= 70 ? 'green' : score >= 50 ? 'amber' : 'red',
                            totalAttempts: stats.count,
                        };
                    });

                    setPerformanceData(performanceArray);
                }
            }

        } catch (error: any) {
            console.error('Error fetching performance:', error);
            toast({
                title: "Error",
                description: "Failed to load performance data",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'green': return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30';
            case 'amber': return 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30';
            case 'red': return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30';
            default: return '';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'green': return <CheckCircle2 className="w-5 h-5" />;
            case 'amber': return <AlertCircle className="w-5 h-5" />;
            case 'red': return <AlertCircle className="w-5 h-5" />;
            default: return null;
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
                                <BarChart3 className="w-6 h-6 text-amber-500" />
                                Premium Feature
                            </CardTitle>
                            <CardDescription>
                                Performance Heat Map is a premium feature
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Upgrade to premium to see visual analytics of your performance across all subjects.
                            </p>
                            <Button
                                onClick={() => window.location.href = '/premium-dashboard'}
                                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
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
            <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
                        <BarChart3 className="w-8 h-8 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Performance Heat Map</h1>
                        <p className="text-muted-foreground">Visual analysis of your strengths and areas to improve</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 animate-slide-up">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-green-600 dark:text-green-400">Strong Areas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{performanceData.filter(p => p.status === 'green').length}</p>
                            <p className="text-xs text-muted-foreground mt-1">70%+ performance</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-amber-600 dark:text-amber-400">Needs Practice</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{performanceData.filter(p => p.status === 'amber').length}</p>
                            <p className="text-xs text-muted-foreground mt-1">50-69% performance</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-red-600 dark:text-red-400">Focus Required</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{performanceData.filter(p => p.status === 'red').length}</p>
                            <p className="text-xs text-muted-foreground mt-1">Below 50%</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Heat Map Grid */}
                <Card className="animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                    <CardHeader>
                        <CardTitle>Performance by Subject</CardTitle>
                        <CardDescription>Color-coded performance across all your submitted work</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-center text-muted-foreground py-12">Loading performance data...</p>
                        ) : performanceData.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="font-semibold text-lg mb-2">No performance data yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Complete some past papers using the AI Examiner to see your performance analysis
                                </p>
                                <Button
                                    onClick={() => window.location.href = '/premium/ai-examiner'}
                                    variant="outline"
                                >
                                    Go to AI Examiner
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {performanceData.map((perf, index) => (
                                    <div
                                        key={index}
                                        className={`p-6 rounded-xl border-2 ${getStatusColor(perf.status)} transition-all hover:scale-105 cursor-pointer`}
                                    >
                                        <h3 className="font-bold text-lg mb-2">{perf.subject}</h3>
                                        <div className="flex items-baseline gap-2 mb-3">
                                            <span className="text-5xl font-bold">{perf.performanceScore}%</span>
                                            {getStatusIcon(perf.status)}
                                        </div>
                                        <p className="text-sm opacity-75 mb-3">
                                            {perf.totalAttempts} {perf.totalAttempts === 1 ? 'attempt' : 'attempts'}
                                        </p>
                                        <div className="pt-3 border-t border-current/20">
                                            <span className="text-xs font-semibold uppercase tracking-wide">
                                                {perf.status === 'green' ? '✓ Strong Performance' :
                                                    perf.status === 'amber' ? '⚠ Keep Practicing' : '✗ Focus Needed'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recommendations */}
                {performanceData.filter(p => p.status === 'red').length > 0 && (
                    <Card className="border-red-500/20 bg-red-500/5 animate-slide-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                        <CardHeader>
                            <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Priority Focus Areas
                            </CardTitle>
                            <CardDescription>Subjects that need your immediate attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {performanceData.filter(p => p.status === 'red').map((perf, index) => (
                                    <li key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                            <span className="font-medium">{perf.subject}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {perf.performanceScore}% ({perf.totalAttempts} {perf.totalAttempts === 1 ? 'attempt' : 'attempts'})
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-sm text-muted-foreground mt-4 italic">
                                💡 Tip: Focus on reviewing these topics and practice more past papers to improve your performance.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Success Areas */}
                {performanceData.filter(p => p.status === 'green').length > 0 && (
                    <Card className="border-green-500/20 bg-green-500/5 animate-slide-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
                        <CardHeader>
                            <CardTitle className="text-green-700 dark:text-green-400 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                Your Strengths
                            </CardTitle>
                            <CardDescription>Well done! Keep up the great work in these areas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {performanceData.filter(p => p.status === 'green').map((perf, index) => (
                                    <div key={index} className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                                        {perf.subject} ({perf.performanceScore}%)
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
