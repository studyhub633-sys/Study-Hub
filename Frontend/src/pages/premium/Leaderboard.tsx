import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Medal, Trophy } from "lucide-react";

export default function Leaderboard() {
    const users = [
        { rank: 1, name: "Sarah J.", xp: "12,450", streak: 45, avatar: null },
        { rank: 2, name: "Mike T.", xp: "11,200", streak: 32, avatar: null },
        { rank: 3, name: "Alex R.", xp: "10,890", streak: 28, avatar: null },
        { rank: 4, name: "You", xp: "8,450", streak: 12, avatar: null, isUser: true },
        { rank: 5, name: "Emily W.", xp: "8,120", streak: 15, avatar: null },
    ];

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

                {/* Top 3 Podium (Visual) */}
                <div className="grid grid-cols-3 gap-4 h-48 items-end mb-12 px-4">
                    {/* 2nd Place */}
                    <div className="flex flex-col items-center">
                        <Avatar className="w-16 h-16 border-4 border-slate-300 mb-2">
                            <AvatarFallback>M</AvatarFallback>
                        </Avatar>
                        <div className="w-full h-24 bg-slate-200 dark:bg-slate-800 rounded-t-xl flex items-center justify-center text-2xl font-bold text-slate-400">2</div>
                        <span className="font-semibold text-sm mt-2">Mike</span>
                    </div>

                    {/* 1st Place */}
                    <div className="flex flex-col items-center">
                        <Flame className="w-8 h-8 text-orange-500 absolute -mt-12 animate-bounce" />
                        <Avatar className="w-20 h-20 border-4 border-yellow-400 mb-2 ring-4 ring-yellow-400/20">
                            <AvatarFallback>S</AvatarFallback>
                        </Avatar>
                        <div className="w-full h-32 bg-yellow-400/20 border border-yellow-400 rounded-t-xl flex items-center justify-center text-4xl font-bold text-yellow-600">1</div>
                        <span className="font-semibold text-sm mt-2">Sarah</span>
                    </div>

                    {/* 3rd Place */}
                    <div className="flex flex-col items-center">
                        <Avatar className="w-16 h-16 border-4 border-amber-600 mb-2">
                            <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                        <div className="w-full h-20 bg-amber-700/20 rounded-t-xl flex items-center justify-center text-2xl font-bold text-amber-700">3</div>
                        <span className="font-semibold text-sm mt-2">Alex</span>
                    </div>
                </div>

                {/* List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Global Rankings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {users.map((user) => (
                                <div
                                    key={user.rank}
                                    className={`flex items-center p-4 gap-4 ${user.isUser ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                                >
                                    <div className="w-8 text-center font-bold text-muted-foreground">
                                        {user.rank <= 3 ? <Medal className={`w-5 h-5 mx-auto ${user.rank === 1 ? "text-yellow-500" : user.rank === 2 ? "text-slate-400" : "text-amber-600"}`} /> : user.rank}
                                    </div>
                                    <Avatar>
                                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            {user.name}
                                            {user.isUser && <Badge variant="secondary" className="text-[10px]">YOU</Badge>}
                                        </h4>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">{user.xp} XP</div>
                                        <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                                            <Flame className="w-3 h-3 text-orange-500" /> {user.streak} day streak
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
