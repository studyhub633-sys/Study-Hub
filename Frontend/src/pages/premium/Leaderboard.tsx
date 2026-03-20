import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Clock, Loader2, Medal, Trophy, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface LeaderboardUser {
    rank: number;
    name: string;
    xp: number;
    streak: number;
    study_hours: number;
    avatar: string | null;
    isUser?: boolean;
    user_id: string;
}

type LeaderboardTab = "xp" | "hours";

export default function Leaderboard() {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [activeTab, setActiveTab] = useState<LeaderboardTab>("xp");

    useEffect(() => {
        fetchLeaderboard();
    }, [user, activeTab]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);

            // Try RPC first, fall back to direct query
            let leaderboardData: any[] | null = null;

            try {
                const { data, error } = await supabase
                    .rpc('get_leaderboard', { limit_count: 50 });

                if (!error && data) {
                    leaderboardData = data;
                }
            } catch {
                // RPC not available, fall back
            }

            // Fallback: direct query from profiles
            if (!leaderboardData) {
                const orderColumn = activeTab === "xp" ? "xp" : "study_hours";
                const { data, error } = await supabase
                    .from("profiles")
                    .select("id, full_name, email, avatar_url, xp, study_hours")
                    .order(orderColumn, { ascending: false, nullsFirst: false })
                    .limit(50);

                if (error) {
                    console.error("Leaderboard query error:", error);
                    setUsers([]);
                    return;
                }

                leaderboardData = (data || []).map((u: any, i: number) => ({
                    rank: i + 1,
                    name: u.full_name || u.email?.split("@")[0] || "User",
                    xp: u.xp || 0,
                    streak: 0,
                    study_hours: u.study_hours || 0,
                    avatar_url: u.avatar_url,
                    user_id: u.id,
                }));
            }

            if (leaderboardData && leaderboardData.length > 0) {
                // Sort by active tab
                const sorted = [...leaderboardData].sort((a, b) => {
                    if (activeTab === "xp") return (b.xp || 0) - (a.xp || 0);
                    return (b.study_hours || 0) - (a.study_hours || 0);
                });

                const formattedUsers: LeaderboardUser[] = sorted.map((u: any, i: number) => ({
                    rank: i + 1,
                    name: u.name || u.full_name || "User",
                    xp: u.xp || 0,
                    streak: u.streak || 0,
                    study_hours: u.study_hours || 0,
                    avatar: u.avatar_url || u.avatar || null,
                    user_id: u.user_id || u.id,
                    isUser: (u.user_id || u.id) === user?.id,
                }));
                setUsers(formattedUsers);
            } else {
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

    const formatValue = (user: LeaderboardUser) => {
        if (activeTab === "xp") return `${user.xp.toLocaleString()} XP`;
        return `${user.study_hours.toLocaleString()}h`;
    };

    const tabs: { id: LeaderboardTab; label: string; icon: typeof Zap }[] = [
        { id: "xp", label: "XP Rankings", icon: Zap },
        { id: "hours", label: "Study Hours", icon: Clock },
    ];

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Leaderboard</h1>
                        <p className="text-muted-foreground">See how you rank against other students</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 p-1 rounded-xl bg-muted/50 border border-border/50 w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                activeTab === tab.id
                                    ? "bg-background text-foreground shadow-sm border border-border/50"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : users.length === 0 ? (
                    <Card className="p-8 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 rounded-full bg-orange-500/10">
                                <Trophy className="w-12 h-12 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-semibold">No Rankings Yet</h3>
                            <p className="text-muted-foreground max-w-md">
                                The leaderboard will populate as students start studying.
                                {activeTab === "xp"
                                    ? " Answer quiz questions to earn XP!"
                                    : " Use Focus Mode to track study hours!"}
                            </p>
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* Top 3 Podium */}
                        {users.length >= 3 && (
                            <div className="flex items-end justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 h-64 sm:h-64 md:h-64 mt-8 sm:mt-12 mb-8 sm:mb-10 md:mb-12 px-4 sm:px-6 md:px-8">
                                {/* 2nd Place */}
                                <div className="flex flex-col items-center w-[28%] sm:w-[30%] md:flex-1 min-w-[80px] sm:min-w-[100px] md:max-w-[140px] lg:max-w-none">
                                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 border-2 sm:border-4 border-slate-300 mb-1 sm:mb-2">
                                        <AvatarImage src={users[1]?.avatar || undefined} />
                                        <AvatarFallback>{users[1]?.name[0] || "2"}</AvatarFallback>
                                    </Avatar>
                                    <div className="w-full h-20 sm:h-22 md:h-24 bg-slate-200 dark:bg-slate-800 rounded-t-xl flex flex-col items-center justify-center">
                                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-slate-400">2</span>
                                        <span className="text-[10px] text-muted-foreground font-medium">{formatValue(users[1])}</span>
                                    </div>
                                    <span className="font-semibold text-[10px] sm:text-xs md:text-sm mt-1 sm:mt-2 truncate max-w-full text-center px-1">{users[1]?.name || "User"}</span>
                                </div>

                                {/* 1st Place */}
                                <div className="flex flex-col items-center w-[32%] sm:w-[34%] md:flex-1 min-w-[90px] sm:min-w-[110px] md:max-w-[160px] lg:max-w-none z-10 relative">
                                    <Avatar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 border-2 sm:border-4 border-yellow-400 mb-1 sm:mb-2 ring-2 sm:ring-4 ring-yellow-400/20">
                                        <AvatarImage src={users[0]?.avatar || undefined} />
                                        <AvatarFallback>{users[0]?.name[0] || "1"}</AvatarFallback>
                                    </Avatar>
                                    <div className="w-full h-28 sm:h-30 md:h-32 bg-yellow-400/20 border border-yellow-400 rounded-t-xl flex flex-col items-center justify-center">
                                        <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-600">1</span>
                                        <span className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">{formatValue(users[0])}</span>
                                    </div>
                                    <span className="font-semibold text-[10px] sm:text-xs md:text-sm mt-1 sm:mt-2 truncate max-w-full text-center px-1">{users[0]?.name || "User"}</span>
                                </div>

                                {/* 3rd Place */}
                                <div className="flex flex-col items-center w-[28%] sm:w-[30%] md:flex-1 min-w-[80px] sm:min-w-[100px] md:max-w-[140px] lg:max-w-none">
                                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 border-2 sm:border-4 border-amber-600 mb-1 sm:mb-2">
                                        <AvatarImage src={users[2]?.avatar || undefined} />
                                        <AvatarFallback>{users[2]?.name[0] || "3"}</AvatarFallback>
                                    </Avatar>
                                    <div className="w-full h-16 sm:h-18 md:h-20 bg-amber-700/20 rounded-t-xl flex flex-col items-center justify-center">
                                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-amber-700">3</span>
                                        <span className="text-[10px] text-muted-foreground font-medium">{formatValue(users[2])}</span>
                                    </div>
                                    <span className="font-semibold text-[10px] sm:text-xs md:text-sm mt-1 sm:mt-2 truncate max-w-full text-center px-1">{users[2]?.name || "User"}</span>
                                </div>
                            </div>
                        )}

                        {/* List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {activeTab === "xp" ? "XP Rankings" : "Study Hours Rankings"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {users.map((u) => (
                                        <div
                                            key={u.user_id}
                                            className={`flex items-center p-4 gap-4 ${u.isUser ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                                        >
                                            <div className="w-8 text-center font-bold text-muted-foreground">
                                                {u.rank <= 3 ? <Medal className={`w-5 h-5 mx-auto ${u.rank === 1 ? "text-yellow-500" : u.rank === 2 ? "text-slate-400" : "text-amber-600"}`} /> : u.rank}
                                            </div>
                                            <Avatar>
                                                <AvatarImage src={u.avatar || undefined} />
                                                <AvatarFallback>{u.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h4 className="font-semibold flex items-center gap-2">
                                                    {u.name}
                                                    {u.isUser && <Badge variant="secondary" className="text-[10px]">YOU</Badge>}
                                                </h4>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold flex items-center gap-1 justify-end">
                                                    {activeTab === "xp" ? (
                                                        <><Zap className="w-4 h-4 text-amber-500" /> {u.xp.toLocaleString()} XP</>
                                                    ) : (
                                                        <><Clock className="w-4 h-4 text-blue-500" /> {u.study_hours.toLocaleString()}h</>
                                                    )}
                                                </div>
                                                {activeTab === "xp" && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {u.streak} day streak
                                                    </div>
                                                )}
                                                {activeTab === "hours" && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {u.xp.toLocaleString()} XP
                                                    </div>
                                                )}
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
