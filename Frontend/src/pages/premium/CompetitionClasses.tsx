import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { hasPremium } from "@/lib/premium";
import {
    Calendar,
    ChevronLeft,
    Loader2,
    Medal,
    Plus,
    Timer,
    Trophy,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface CompetitionClass {
    id: string;
    name: string;
    join_code: string;
    created_by: string;
    created_at: string;
    member_count?: number;
    my_role?: "teacher" | "student";
}

interface LeaderboardEntry {
    user_id: string;
    name: string;
    avatar_url: string | null;
    total_minutes: number;
    rank: number;
}

function generateJoinCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export default function CompetitionClasses() {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<CompetitionClass[]>([]);
    const [isPremium, setIsPremium] = useState(false);
    const [checkingPremium, setCheckingPremium] = useState(true);

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [createName, setCreateName] = useState("");
    const [creating, setCreating] = useState(false);

    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [joinCode, setJoinCode] = useState("");
    const [joining, setJoining] = useState(false);

    const [selectedClass, setSelectedClass] = useState<CompetitionClass | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [leaderboardPeriod, setLeaderboardPeriod] = useState<"week" | "month">("week");
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

    const [showLogDialog, setShowLogDialog] = useState(false);
    const [logMinutes, setLogMinutes] = useState("30");
    const [logging, setLogging] = useState(false);

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

    useEffect(() => {
        if (user && supabase && isPremium) {
            fetchMyClasses();
        } else {
            setLoading(false);
        }
    }, [user, supabase, isPremium]);

    useEffect(() => {
        if (selectedClass && supabase) {
            fetchLeaderboard();
        }
    }, [selectedClass?.id, leaderboardPeriod, supabase]);

    const fetchMyClasses = async () => {
        if (!supabase || !user) return;
        setLoading(true);
        try {
            const { data: memberships, error: memError } = await supabase
                .from("competition_class_members")
                .select("class_id, role")
                .eq("user_id", user.id);

            if (memError) throw memError;
            if (!memberships?.length) {
                setClasses([]);
                return;
            }

            const classIds = memberships.map((m) => m.class_id);
            const { data: classRows, error: classError } = await supabase
                .from("competition_classes")
                .select("id, name, join_code, created_by, created_at")
                .in("id", classIds);

            if (classError) throw classError;

            const memberCounts = await Promise.all(
                classIds.map(async (id) => {
                    const { count } = await supabase
                        .from("competition_class_members")
                        .select("*", { count: "exact", head: true })
                        .eq("class_id", id);
                    return { id, count: count ?? 0 };
                })
            );
            const countMap = Object.fromEntries(memberCounts.map((c) => [c.id, c.count]));
            const roleMap = Object.fromEntries(memberships.map((m) => [m.class_id, m.role]));

            setClasses(
                (classRows || []).map((c) => ({
                    ...c,
                    member_count: countMap[c.id] ?? 0,
                    my_role: roleMap[c.id],
                }))
            );
        } catch (e: unknown) {
            const err = e as { message?: string };
            console.error(e);
            toast({
                title: "Error",
                description: err?.message || "Failed to load classes.",
                variant: "destructive",
            });
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaderboard = async () => {
        if (!selectedClass || !supabase) return;
        setLoadingLeaderboard(true);
        try {
            const { data, error } = await supabase.rpc("get_class_leaderboard", {
                p_class_id: selectedClass.id,
                p_period: leaderboardPeriod,
            });
            if (error) throw error;
            setLeaderboard((data as LeaderboardEntry[]) || []);
        } catch (e: unknown) {
            const err = e as { message?: string };
            toast({
                title: "Error",
                description: err?.message || "Failed to load leaderboard.",
                variant: "destructive",
            });
            setLeaderboard([]);
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    const handleCreateClass = async () => {
        if (!user || !supabase || !createName.trim()) return;
        setCreating(true);
        try {
            const join_code = generateJoinCode();
            const { data: newClass, error: classError } = await supabase
                .from("competition_classes")
                .insert({
                    name: createName.trim(),
                    join_code,
                    created_by: user.id,
                })
                .select("id, name, join_code")
                .single();

            if (classError) throw classError;

            const { error: memberError } = await supabase.from("competition_class_members").insert({
                class_id: newClass.id,
                user_id: user.id,
                role: "teacher",
            });
            if (memberError) throw memberError;

            toast({
                title: "Class created",
                description: `Share the join code: ${join_code}`,
            });
            setShowCreateDialog(false);
            setCreateName("");
            fetchMyClasses();
        } catch (e: unknown) {
            const err = e as { message?: string };
            toast({
                title: "Error",
                description: err?.message || "Failed to create class.",
                variant: "destructive",
            });
        } finally {
            setCreating(false);
        }
    };

    const handleJoinClass = async () => {
        if (!user || !supabase || !joinCode.trim()) return;
        setJoining(true);
        try {
            const code = joinCode.trim().toUpperCase();
            const { data: classRow, error: lookupError } = await supabase.rpc("get_class_by_join_code", {
                p_join_code: code,
            });
            if (lookupError) throw lookupError;
            const row = Array.isArray(classRow) ? classRow[0] : classRow;
            if (!row?.id) {
                toast({
                    title: "Invalid code",
                    description: "No class found with that join code.",
                    variant: "destructive",
                });
                setJoining(false);
                return;
            }

            const { error: insertError } = await supabase.from("competition_class_members").insert({
                class_id: row.id,
                user_id: user.id,
                role: "student",
            });
            if (insertError) {
                if (insertError.code === "23505") {
                    toast({
                        title: "Already in class",
                        description: "You are already a member of this class.",
                        variant: "destructive",
                    });
                } else throw insertError;
                setJoining(false);
                return;
            }

            toast({
                title: "Joined class",
                description: `You joined ${row.name}.`,
            });
            setShowJoinDialog(false);
            setJoinCode("");
            fetchMyClasses();
        } catch (e: unknown) {
            const err = e as { message?: string };
            toast({
                title: "Error",
                description: err?.message || "Failed to join class.",
                variant: "destructive",
            });
        } finally {
            setJoining(false);
        }
    };

    const handleLogRevision = async () => {
        if (!user || !supabase || !selectedClass) return;
        const mins = parseInt(logMinutes, 10);
        if (isNaN(mins) || mins < 1 || mins > 1440) {
            toast({
                title: "Invalid time",
                description: "Enter between 1 and 1440 minutes.",
                variant: "destructive",
            });
            return;
        }
        setLogging(true);
        try {
            const { error } = await supabase.from("revision_logs").insert({
                user_id: user.id,
                class_id: selectedClass.id,
                minutes: mins,
                logged_at: new Date().toISOString().slice(0, 10),
            });
            if (error) throw error;
            toast({
                title: "Revision logged",
                description: `${mins} minutes added to your total.`,
            });
            setShowLogDialog(false);
            setLogMinutes("30");
            fetchLeaderboard();
        } catch (e: unknown) {
            const err = e as { message?: string };
            toast({
                title: "Error",
                description: err?.message || "Failed to log revision.",
                variant: "destructive",
            });
        } finally {
            setLogging(false);
        }
    };

    const formatMinutes = (m: number) => {
        if (m < 60) return `${m}m`;
        const h = Math.floor(m / 60);
        const min = m % 60;
        return min ? `${h}h ${min}m` : `${h}h`;
    };

    if (checkingPremium) {
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
                                <Trophy className="w-6 h-6 text-amber-500" />
                                Premium Feature
                            </CardTitle>
                            <CardDescription>
                                Competition Classes are a premium feature. Create or join classes and track revision time with your peers.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Join a class with a code, log how long you revise, and see your class leaderboard.
                            </p>
                            <Button
                                onClick={() => (window.location.href = "/premium-dashboard")}
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

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Competition Classes</h1>
                        <p className="text-muted-foreground">
                            Join a class, log your revision time, and compete on the leaderboard.
                        </p>
                    </div>
                </div>

                {selectedClass ? (
                    <div className="space-y-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 -ml-2"
                            onClick={() => setSelectedClass(null)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back to my classes
                        </Button>

                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>{selectedClass.name}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <Users className="w-4 h-4" />
                                            {selectedClass.member_count} member
                                            {selectedClass.member_count !== 1 ? "s" : ""}
                                            {selectedClass.my_role === "teacher" && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Teacher
                                                </Badge>
                                            )}
                                        </CardDescription>
                                    </div>
                                    <Button onClick={() => setShowLogDialog(true)}>
                                        <Timer className="w-4 h-4 mr-2" />
                                        Log revision
                                    </Button>
                                </div>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <CardTitle className="text-lg">Class leaderboard</CardTitle>
                                    <Select
                                        value={leaderboardPeriod}
                                        onValueChange={(v) => setLeaderboardPeriod(v as "week" | "month")}
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="week">This week</SelectItem>
                                            <SelectItem value="month">This month</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loadingLeaderboard ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : leaderboard.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground">
                                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No revision logged for this {leaderboardPeriod} yet.</p>
                                        <p className="text-sm mt-1">Log your first revision to appear here.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {leaderboard.map((entry) => (
                                            <div
                                                key={entry.user_id}
                                                className={`flex items-center gap-4 p-4 ${entry.user_id === user?.id ? "bg-primary/5" : "hover:bg-muted/50"}`}
                                            >
                                                <div className="w-8 text-center font-bold text-muted-foreground">
                                                    {entry.rank <= 3 ? (
                                                        <Medal
                                                            className={`w-5 h-5 mx-auto ${
                                                                entry.rank === 1
                                                                    ? "text-yellow-500"
                                                                    : entry.rank === 2
                                                                      ? "text-slate-400"
                                                                      : "text-amber-600"
                                                            }`}
                                                        />
                                                    ) : (
                                                        entry.rank
                                                    )}
                                                </div>
                                                <Avatar>
                                                    <AvatarImage src={entry.avatar_url || undefined} />
                                                    <AvatarFallback>{entry.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <span className="font-medium">
                                                        {entry.name}
                                                        {entry.user_id === user?.id && (
                                                            <Badge variant="secondary" className="ml-2 text-[10px]">
                                                                YOU
                                                            </Badge>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="font-semibold tabular-nums">
                                                    {formatMinutes(Number(entry.total_minutes))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-3">
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create class
                            </Button>
                            <Button variant="outline" onClick={() => setShowJoinDialog(true)}>
                                <Users className="w-4 h-4 mr-2" />
                                Join with code
                            </Button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : classes.length === 0 ? (
                            <Card className="p-8 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 rounded-full bg-orange-500/10">
                                        <Trophy className="w-12 h-12 text-orange-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold">No classes yet</h3>
                                    <p className="text-muted-foreground max-w-md">
                                        Create a class and share the join code with your students, or join a class using a code from your teacher.
                                    </p>
                                    <div className="flex gap-3 mt-4">
                                        <Button onClick={() => setShowCreateDialog(true)}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create class
                                        </Button>
                                        <Button variant="outline" onClick={() => setShowJoinDialog(true)}>
                                            Join with code
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {classes.map((c) => (
                                    <Card
                                        key={c.id}
                                        className="cursor-pointer transition-colors hover:border-orange-500/50 hover:bg-muted/30"
                                        onClick={() => setSelectedClass(c)}
                                    >
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center justify-between">
                                                {c.name}
                                                {c.my_role === "teacher" && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Teacher
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                {c.member_count} member{c.member_count !== 1 ? "s" : ""} · Code: {c.join_code}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Create class dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a class</DialogTitle>
                        <DialogDescription>
                            Give your class a name. You'll get a join code to share with students.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="class-name">Class name</Label>
                            <Input
                                id="class-name"
                                value={createName}
                                onChange={(e) => setCreateName(e.target.value)}
                                placeholder="e.g. 10B Maths 2025"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateClass}
                            disabled={creating || !createName.trim()}
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating…
                                </>
                            ) : (
                                "Create"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Join class dialog */}
            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Join a class</DialogTitle>
                        <DialogDescription>
                            Enter the 6-character code from your teacher.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="join-code">Join code</Label>
                            <Input
                                id="join-code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                                placeholder="e.g. ABC123"
                                className="font-mono uppercase"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleJoinClass}
                            disabled={joining || joinCode.trim().length < 4}
                        >
                            {joining ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Joining…
                                </>
                            ) : (
                                "Join"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Log revision dialog */}
            <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log revision time</DialogTitle>
                        <DialogDescription>
                            How many minutes did you revise? This will count toward the class leaderboard.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="log-minutes">Minutes</Label>
                            <Input
                                id="log-minutes"
                                type="number"
                                min={1}
                                max={1440}
                                value={logMinutes}
                                onChange={(e) => setLogMinutes(e.target.value)}
                                placeholder="30"
                            />
                            <p className="text-xs text-muted-foreground">
                                Between 1 and 1440 (24 hours). Today's date will be used.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLogDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleLogRevision} disabled={logging}>
                            {logging ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Logging…
                                </>
                            ) : (
                                "Log revision"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
