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
    AlertTriangle,
    BookOpen,
    ChevronLeft,
    GraduationCap,
    HandHelping,
    Loader2,
    LogOut,
    MessageCircle,
    Plus,
    Star,
    ThumbsUp,
    Trash2,
    Trophy,
    Users
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
    total_points?: number;
    total_minutes?: number; // fallback for pre-migration
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

const playSound = (type: 'positive' | 'negative') => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        if (type === 'positive') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        } else {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        }
    } catch (e) {
        console.error("Audio playback error:", e);
    }
};

const getDicebearAvatar = (seed: string) => {
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
}

export default function CompetitionClasses() {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<CompetitionClass[]>([]);
    const [isPremium, setIsPremium] = useState(false);
    const [checkingPremium, setCheckingPremium] = useState(true);

    const [roleView, setRoleView] = useState<'teacher' | 'student' | null>(null);

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [createName, setCreateName] = useState("");
    const [creating, setCreating] = useState(false);

    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [joinCode, setJoinCode] = useState("");
    const [joining, setJoining] = useState(false);

    const [selectedClass, setSelectedClass] = useState<CompetitionClass | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [leaderboardPeriod, setLeaderboardPeriod] = useState<"week" | "month" | "all_time">("all_time");
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

    const [showAwardDialog, setShowAwardDialog] = useState(false);
    const [awardingStudent, setAwardingStudent] = useState<LeaderboardEntry | null>(null);
    const [awardingPoints, setAwardingPoints] = useState(false);
    const [animatingUserId, setAnimatingUserId] = useState<string | null>(null);
    const [lastPointChange, setLastPointChange] = useState<{ id: string, amount: number } | null>(null);

    // Leave/Delete State
    const [isLeaving, setIsLeaving] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

    const handleAwardPoints = async (points: number, reason: string) => {
        if (!user || !supabase || !selectedClass || !awardingStudent) return;
        setAwardingPoints(true);
        try {
            const { error } = await supabase.rpc("award_class_points", {
                p_class_id: selectedClass.id,
                p_student_id: awardingStudent.user_id,
                p_points: points,
                p_reason: reason
            });
            if (error) {
                // If the RPC fails (likely because migration hasn't been run yet by the user)
                throw new Error("Points system migration is required. Please ask the admin to run the updated SQL scripts.");
            }

            // Audio feedback
            playSound(points > 0 ? 'positive' : 'negative');

            // Animation state
            setAnimatingUserId(awardingStudent.user_id);
            setLastPointChange({ id: awardingStudent.user_id, amount: points });
            setTimeout(() => {
                setAnimatingUserId(null);
                setLastPointChange(null);
            }, 2000);

            toast({
                title: points > 0 ? "Points Awarded!" : "Points Deducted",
                description: `${points > 0 ? '+' : ''}${points} for ${reason}`,
            });

            setShowAwardDialog(false);
            setAwardingStudent(null);
            fetchLeaderboard(); // Refresh points
        } catch (e: unknown) {
            const err = e as { message?: string };
            toast({
                title: "Error",
                description: err?.message || "Failed to award points.",
                variant: "destructive",
            });
        } finally {
            setAwardingPoints(false);
        }
    };

    const handleLeaveClass = async () => {
        if (!user || !supabase || !selectedClass) return;
        setIsLeaving(true);
        try {
            const { error } = await supabase
                .from("competition_class_members")
                .delete()
                .eq("class_id", selectedClass.id)
                .eq("user_id", user.id);

            if (error) throw error;

            toast({ title: "Success", description: "You have left the class." });
            setShowLeaveDialog(false);
            setSelectedClass(null);
            fetchMyClasses();
        } catch (e: unknown) {
            const err = e as { message?: string };
            toast({
                title: "Error",
                description: err?.message || "Failed to leave class.",
                variant: "destructive",
            });
        } finally {
            setIsLeaving(false);
        }
    };

    const handleDeleteClass = async () => {
        if (!user || !supabase || !selectedClass) return;
        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from("competition_classes")
                .delete()
                .eq("id", selectedClass.id);

            if (error) throw error;

            toast({ title: "Success", description: "Class deleted successfully." });
            setShowDeleteDialog(false);
            setSelectedClass(null);
            fetchMyClasses();
        } catch (e: unknown) {
            const err = e as { message?: string };
            toast({
                title: "Error",
                description: err?.message || "Failed to delete class.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Predefined Behaviors
    const positiveBehaviors = [
        { name: "Hard Work", points: 1, icon: <Star className="w-5 h-5 text-yellow-500" /> },
        { name: "Helping Others", points: 1, icon: <HandHelping className="w-5 h-5 text-emerald-500" /> },
        { name: "Participating", points: 1, icon: <MessageCircle className="w-5 h-5 text-blue-500" /> },
        { name: "Great Answer", points: 2, icon: <ThumbsUp className="w-5 h-5 text-purple-500" /> },
        { name: "On Task", points: 1, icon: <BookOpen className="w-5 h-5 text-cyan-500" /> },
    ];

    const negativeBehaviors = [
        { name: "Off Task", points: -1, icon: <AlertTriangle className="w-5 h-5 text-red-500" /> },
        { name: "Disrupting", points: -1, icon: <AlertTriangle className="w-5 h-5 text-orange-500" /> },
    ];

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
                                Competition Classes are a premium feature. Create or join classes, earn points with monsters, and compete!
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Join a class with a code to get your own Avatar monster and earn points for hard work.
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

    const filteredClasses = classes.filter(c => c.my_role === roleView);

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Competition Classes</h1>
                        <p className="text-muted-foreground">
                            {!roleView && "Choose how you want to interact with Classes."}
                            {roleView === 'teacher' && !selectedClass && "Manage your classrooms and award points."}
                            {roleView === 'student' && !selectedClass && "Grow your monster avatar and earn points!"}
                            {selectedClass && `Welcome to ${selectedClass.name}!`}
                        </p>
                    </div>
                </div>

                {/* Main Views */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : !roleView ? (
                    /* Step 1: Role Selection View */
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
                        <Card
                            className="cursor-pointer group hover:border-orange-500 hover:shadow-xl hover:scale-105 transition-all text-center p-8 border-2"
                            onClick={() => setRoleView('student')}
                        >
                            <div className="w-24 h-24 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white text-orange-600 transition-colors">
                                <GraduationCap className="w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">I am a Student</h2>
                            <p className="text-muted-foreground">
                                Join classes, get your monster avatar, and earn points for your hard work!
                            </p>
                            <Button className="mt-6 w-full group-hover:bg-orange-600">Select Student</Button>
                        </Card>

                        <Card
                            className="cursor-pointer group hover:border-blue-500 hover:shadow-xl hover:scale-105 transition-all text-center p-8 border-2"
                            onClick={() => setRoleView('teacher')}
                        >
                            <div className="w-24 h-24 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white text-blue-600 transition-colors">
                                <Users className="w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">I am a Teacher</h2>
                            <p className="text-muted-foreground">
                                Create classes, invite students, and award points for positive behaviors.
                            </p>
                            <Button className="mt-6 w-full group-hover:bg-blue-600">Select Teacher</Button>
                        </Card>
                    </div>
                ) : selectedClass ? (
                    /* Step 3: Class Detail View */
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 -ml-2"
                                onClick={() => setSelectedClass(null)}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back to my {roleView} classes
                            </Button>

                            <div className="flex items-center gap-2">
                                <Select
                                    value={leaderboardPeriod}
                                    onValueChange={(v) => setLeaderboardPeriod(v as any)}
                                >
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all_time">All Time Points</SelectItem>
                                        <SelectItem value="month">This Month</SelectItem>
                                        <SelectItem value="week">This Week</SelectItem>
                                    </SelectContent>
                                </Select>

                                {selectedClass.my_role === "teacher" ? (
                                    <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Class
                                    </Button>
                                ) : (
                                    <Button variant="destructive" size="sm" onClick={() => setShowLeaveDialog(true)}>
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Leave Class
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center mb-8">
                            <h2 className="text-4xl font-black mb-2 flex items-center gap-3">
                                {selectedClass.name}
                                {selectedClass.my_role === "teacher" && (
                                    <Badge variant="secondary" className="text-sm">Teacher View</Badge>
                                )}
                            </h2>

                            {roleView === 'teacher' && (
                                <p className="text-muted-foreground flex items-center gap-2 bg-muted px-4 py-1.5 rounded-full mt-2">
                                    <Users className="w-4 h-4" /> {selectedClass.member_count} Members
                                    <span className="mx-2">•</span> Code: <strong className="text-foreground font-mono text-lg">{selectedClass.join_code}</strong>
                                </p>
                            )}

                            {selectedClass.my_role === "teacher" && (
                                <p className="text-sm text-primary mt-4 flex items-center gap-1">
                                    <Star className="w-4 h-4" /> Click a student below to award points!
                                </p>
                            )}
                        </div>

                        <Card className="bg-muted/10 border-none shadow-none">
                            <CardContent className="p-6">
                                {loadingLeaderboard ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : leaderboard.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground">
                                        <div className="w-24 h-24 mx-auto mb-4 opacity-50 bg-muted rounded-full flex items-center justify-center">
                                            <Users className="w-10 h-10" />
                                        </div>
                                        <p className="text-lg font-medium text-foreground">No students here yet.</p>
                                        <p className="text-sm mt-1">Share the join code to invite them!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                        {/* Class Dojo Style Grid */}
                                        {leaderboard.map((entry) => {
                                            // Handle both old schema (total_minutes) and new schema (total_points) gracefully
                                            const points = entry.total_points ?? entry.total_minutes ?? 0;
                                            const isAnimating = animatingUserId === entry.user_id;

                                            return (
                                                <div
                                                    key={entry.user_id}
                                                    onClick={() => selectedClass.my_role === 'teacher' ? setAwardingStudent(entry) : null}
                                                    className={`
                                                        relative flex flex-col items-center p-4 rounded-2xl transition-all duration-300
                                                        ${selectedClass.my_role === 'teacher' ? 'cursor-pointer hover:bg-muted/50 hover:scale-105 active:scale-95' : ''}
                                                        ${entry.user_id === user?.id ? 'ring-2 ring-primary/50 bg-primary/5' : 'bg-card border shadow-sm'}
                                                    `}
                                                >
                                                    {/* Floating +1 / -1 Animation indicator */}
                                                    {isAnimating && lastPointChange && (
                                                        <div className={`absolute -top-4 font-black text-2xl animate-bounce z-10 ${lastPointChange.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {lastPointChange.amount > 0 ? '+' : ''}{lastPointChange.amount}
                                                        </div>
                                                    )}

                                                    {/* Points Bubble */}
                                                    <div className={`
                                                        absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center
                                                        font-bold text-white text-sm shadow-md transition-transform border-2 border-background
                                                        ${points > 0 ? 'bg-green-500' : points < 0 ? 'bg-red-500' : 'bg-slate-400'}
                                                        ${isAnimating ? 'scale-125' : 'scale-100'}
                                                    `}>
                                                        {points}
                                                    </div>

                                                    {/* Avatar */}
                                                    <div className="w-24 h-24 mb-3 drop-shadow-md">
                                                        <img
                                                            src={entry.avatar_url || getDicebearAvatar(entry.user_id)}
                                                            alt={entry.name}
                                                            className="w-full h-full object-contain rounded-full bg-slate-100/50"
                                                        />
                                                    </div>

                                                    {/* Student Info */}
                                                    <div className="text-center w-full">
                                                        <span className="font-semibold text-sm truncate block px-1">
                                                            {entry.name}
                                                        </span>
                                                        {entry.user_id === user?.id && (
                                                            <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0 h-4">
                                                                YOU
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* Step 2: Class List View filtered by Role */
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 -ml-2"
                                onClick={() => setRoleView(null)}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Switch Role
                            </Button>

                            <div className="flex gap-3">
                                {roleView === 'teacher' ? (
                                    <Button onClick={() => setShowCreateDialog(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Class
                                    </Button>
                                ) : (
                                    <Button variant="default" onClick={() => setShowJoinDialog(true)}>
                                        <Users className="w-4 h-4 mr-2" />
                                        Join with code
                                    </Button>
                                )}
                            </div>
                        </div>

                        {filteredClasses.length === 0 ? (
                            <Card className="p-8 text-center max-w-xl mx-auto mt-12 bg-muted/30">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 rounded-2xl bg-orange-500/10 mb-2">
                                        <Trophy className="w-16 h-16 text-orange-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold">No Classes Yet</h3>
                                    <p className="text-muted-foreground">
                                        {roleView === 'teacher'
                                            ? "Create your first class to start awarding points to your students!"
                                            : "Ask your teacher for their 6-digit class code to join!"}
                                    </p>
                                    <div className="mt-4">
                                        {roleView === 'teacher' ? (
                                            <Button size="lg" onClick={() => setShowCreateDialog(true)}>
                                                Create Class
                                            </Button>
                                        ) : (
                                            <Button size="lg" onClick={() => setShowJoinDialog(true)}>
                                                Join Class
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                                {filteredClasses.map((c) => (
                                    <Card
                                        key={c.id}
                                        className="cursor-pointer group hover:border-orange-500/50 hover:shadow-lg transition-all"
                                        onClick={() => setSelectedClass(c)}
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                                                    <Users className="w-6 h-6" />
                                                </div>
                                            </div>
                                            <CardTitle className="text-xl truncate">{c.name}</CardTitle>
                                            <CardDescription className="flex flex-col gap-1 mt-2">
                                                <span className="font-medium">{c.member_count} member{c.member_count !== 1 ? "s" : ""}</span>
                                                {roleView === 'teacher' && (
                                                    <span className="text-xs bg-muted px-2 py-1 rounded-md w-fit font-mono mt-1">Code: {c.join_code}</span>
                                                )}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Award Points Dialog (Teacher Only) */}
            <Dialog open={showAwardDialog || !!awardingStudent} onOpenChange={(open) => {
                if (!open) setAwardingStudent(null);
                setShowAwardDialog(open);
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border">
                                <AvatarImage src={awardingStudent?.avatar_url || getDicebearAvatar(awardingStudent?.user_id || "")} />
                                <AvatarFallback>{awardingStudent?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            Award Points to {awardingStudent?.name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <Label>Positive feedback</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {positiveBehaviors.map(b => (
                                <Button
                                    key={b.name}
                                    variant="outline"
                                    className="h-auto py-3 px-4 flex flex-col gap-2 items-center hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:border-green-900 transition-colors"
                                    onClick={() => handleAwardPoints(b.points, b.name)}
                                    disabled={awardingPoints}
                                >
                                    <div className="bg-muted rounded-full p-2">{b.icon}</div>
                                    <div className="text-sm font-semibold">{b.name}</div>
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 pointer-events-none">+{b.points}</Badge>
                                </Button>
                            ))}
                        </div>

                        <div className="mt-6 mb-2">
                            <Label>Needs work</Label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {negativeBehaviors.map(b => (
                                <Button
                                    key={b.name}
                                    variant="outline"
                                    className="h-auto py-3 px-4 flex flex-col gap-2 items-center hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-900 transition-colors"
                                    onClick={() => handleAwardPoints(b.points, b.name)}
                                    disabled={awardingPoints}
                                >
                                    <div className="bg-muted rounded-full p-2">{b.icon}</div>
                                    <div className="text-sm font-semibold">{b.name}</div>
                                    <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 pointer-events-none">{b.points}</Badge>
                                </Button>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create class dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                {/* Same as before */}
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
                {/* Same as before */}
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

            {/* Leave Class Dialog */}
            <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Leave Class?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to leave {selectedClass?.name}? All your earned points in this class will be lost.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLeaveDialog(false)} disabled={isLeaving}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleLeaveClass} disabled={isLeaving}>
                            {isLeaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Leave
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Class Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Class?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedClass?.name}? This will permanently remove all students and points from this class. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteClass} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
