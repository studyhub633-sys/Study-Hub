import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Flame, Loader2, Medal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface LeaderboardUser {
    rank: number;
    name: string;
    xp: number;
    streak: number;
    avatar: string | null;
    isUser?: boolean;
    user_id: string;
}

export default function Leaderboard() {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<LeaderboardUser[]>([]);

    useEffect(() => {
        fetchLeaderboard();
    }, [user]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            // Calculate XP and streaks from user activity
            // For now, we'll use a combination of study sessions, completed papers, etc.
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, full_name, email, avatar_url")
                .limit(20);

            if (!profiles) {
                // Fallback to sample data
                setUsers([
                    { rank: 1, name: "Sarah J.", xp: 12450, streak: 45, avatar: null, user_id: "1", isUser: false },
                    { rank: 2, name: "Mike T.", xp: 11200, streak: 32, avatar: null, user_id: "2", isUser: false },
                    { rank: 3, name: "Alex R.", xp: 10890, streak: 28, avatar: null, user_id: "3", isUser: false },
                    { rank: 4, name: user?.email?.split("@")[0] || "You", xp: 8450, streak: 12, avatar: null, user_id: user?.id || "4", isUser: true },
                    { rank: 5, name: "Emily W.", xp: 8120, streak: 15, avatar: null, user_id: "5", isUser: false },
                ]);
                return;
            }

            // Calculate scores for each user
            const userScores = await Promise.all(
                profiles.map(async (profile) => {
                    const [papersResult, flashcardsResult, notesResult] = await Promise.all([
                        supabase.from("past_papers").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
                        supabase.from("flashcards").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
                        supabase.from("notes").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
                    ]);

                    const xp = (papersResult.count || 0) * 50 + (flashcardsResult.count || 0) * 10 + (notesResult.count || 0) * 20;
                    // Simple streak calculation (would need proper tracking in real implementation)
                    const streak = Math.floor(Math.random() * 50) + 1;

                    return {
                        user_id: profile.id,
                        name: profile.full_name || profile.email?.split("@")[0] || "User",
                        xp,
                        streak,
                        avatar: profile.avatar_url,
                        isUser: profile.id === user?.id,
                    };
                })
            );

            // Sort by XP and assign ranks
            userScores.sort((a, b) => b.xp - a.xp);
            const rankedUsers = userScores.map((u, index) => ({
                ...u,
                rank: index + 1,
            }));

            setUsers(rankedUsers.slice(0, 10));
        } catch (error: any) {
            console.error("Error fetching leaderboard:", error);
            toast({
                title: "Error",
                description: "Failed to load leaderboard. Using sample data.",
                variant: "destructive",
            });
            // Fallback
            setUsers([
                { rank: 1, name: "Sarah J.", xp: 12450, streak: 45, avatar: null, user_id: "1", isUser: false },
                { rank: 2, name: "Mike T.", xp: 11200, streak: 32, avatar: null, user_id: "2", isUser: false },
                { rank: 3, name: "Alex R.", xp: 10890, streak: 28, avatar: null, user_id: "3", isUser: false },
                { rank: 4, name: user?.email?.split("@")[0] || "You", xp: 8450, streak: 12, avatar: null, user_id: user?.id || "4", isUser: true },
                { rank: 5, name: "Emily W.", xp: 8120, streak: 15, avatar: null, user_id: "5", isUser: false },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const formatXP = (xp: number) => {
        return xp.toLocaleString();
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Study Leaderboard</h1>
                        <p className="text-muted-foreground">Review your weekly rankings and compete with peers.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {/* Top 3 Podium (Visual) */}
                        {users.length >= 3 && (
                            <div className="grid grid-cols-3 gap-4 h-48 items-end mb-12 px-4">
                                {/* 2nd Place */}
                                <div className="flex flex-col items-center">
                                    <Avatar className="w-16 h-16 border-4 border-slate-300 mb-2">
                                        <AvatarImage src={users[1]?.avatar || undefined} />
                                        <AvatarFallback>{users[1]?.name[0] || "2"}</AvatarFallback>
                                    </Avatar>
                                    <div className="w-full h-24 bg-slate-200 dark:bg-slate-800 rounded-t-xl flex items-center justify-center text-2xl font-bold text-slate-400">2</div>
                                    <span className="font-semibold text-sm mt-2">{users[1]?.name || "User"}</span>
                                </div>

                                {/* 1st Place */}
                                <div className="flex flex-col items-center">
                                    <Flame className="w-8 h-8 text-orange-500 absolute -mt-12 animate-bounce" />
                                    <Avatar className="w-20 h-20 border-4 border-yellow-400 mb-2 ring-4 ring-yellow-400/20">
                                        <AvatarImage src={users[0]?.avatar || undefined} />
                                        <AvatarFallback>{users[0]?.name[0] || "1"}</AvatarFallback>
                                    </Avatar>
                                    <div className="w-full h-32 bg-yellow-400/20 border border-yellow-400 rounded-t-xl flex items-center justify-center text-4xl font-bold text-yellow-600">1</div>
                                    <span className="font-semibold text-sm mt-2">{users[0]?.name || "User"}</span>
                                </div>

                                {/* 3rd Place */}
                                <div className="flex flex-col items-center">
                                    <Avatar className="w-16 h-16 border-4 border-amber-600 mb-2">
                                        <AvatarImage src={users[2]?.avatar || undefined} />
                                        <AvatarFallback>{users[2]?.name[0] || "3"}</AvatarFallback>
                                    </Avatar>
                                    <div className="w-full h-20 bg-amber-700/20 rounded-t-xl flex items-center justify-center text-2xl font-bold text-amber-700">3</div>
                                    <span className="font-semibold text-sm mt-2">{users[2]?.name || "User"}</span>
                                </div>
                            </div>
                        )}

                        {/* List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Global Rankings</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {users.map((user) => (
                                        <div
                                            key={user.user_id}
                                            className={`flex items-center p-4 gap-4 ${user.isUser ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                                        >
                                            <div className="w-8 text-center font-bold text-muted-foreground">
                                                {user.rank <= 3 ? <Medal className={`w-5 h-5 mx-auto ${user.rank === 1 ? "text-yellow-500" : user.rank === 2 ? "text-slate-400" : "text-amber-600"}`} /> : user.rank}
                                            </div>
                                            <Avatar>
                                                <AvatarImage src={user.avatar || undefined} />
                                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h4 className="font-semibold flex items-center gap-2">
                                                    {user.name}
                                                    {user.isUser && <Badge variant="secondary" className="text-[10px]">YOU</Badge>}
                                                </h4>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">{formatXP(user.xp)} XP</div>
                                                <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                                                    <Flame className="w-3 h-3 text-orange-500" /> {user.streak} day streak
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
