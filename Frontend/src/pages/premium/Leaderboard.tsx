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

            // Fetch from secure RPC function - this calculates XP and streak from real data
            const { data: leaderboardData, error } = await supabase
                .rpc('get_leaderboard', { limit_count: 50 });

            if (error) {
                console.error("Leaderboard RPC error:", error);
                // If the RPC function doesn't exist yet, show helpful message
                if (error.message.includes("function") || error.code === "42883") {
                    toast({
                        title: "Setup Required",
                        description: "Please run the leaderboard_function.sql migration in Supabase to enable the leaderboard.",
                        variant: "destructive",
                    });
                }
                setUsers([]);
                return;
            }

            if (leaderboardData && leaderboardData.length > 0) {
                const formattedUsers: LeaderboardUser[] = leaderboardData.map((u: any) => ({
                    rank: u.rank,
                    name: u.name,
                    xp: u.xp,
                    streak: u.streak,
                    avatar: u.avatar_url,
                    user_id: u.user_id,
                    isUser: u.user_id === user?.id
                }));
                setUsers(formattedUsers);
            } else {
                // No users in leaderboard yet - empty state
                setUsers([]);
            }

        } catch (error: any) {
            console.error("Error fetching leaderboard:", error);
            toast({
                title: "Error",
                description: "Failed to load leaderboard. Please try again later.",
                variant: "destructive",
            });
            setUsers([]);
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
                ) : users.length === 0 ? (
                    /* Empty State */
                    <Card className="p-8 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 rounded-full bg-orange-500/10">
                                <Trophy className="w-12 h-12 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-semibold">No Rankings Yet</h3>
                            <p className="text-muted-foreground max-w-md">
                                The leaderboard will populate as students start studying.
                                Create notes, flashcards, or use the AI Tutor to earn XP and appear on the leaderboard!
                            </p>
                            <div className="flex gap-3 mt-4">
                                <a href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                                    Start Studying
                                </a>
                            </div>
                        </div>
                    </Card>
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
