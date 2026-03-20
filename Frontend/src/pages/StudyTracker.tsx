import { XpRewardPopup } from "@/components/XpRewardPopup";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { awardXP, XP_REWARDS } from "@/lib/xp";
import {
  BookOpen,
  Calendar,
  Clock,
  Flame,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Square,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface StudySession {
  id: string;
  subject: string;
  duration_minutes: number;
  started_at: string;
  ended_at: string;
}

const SUBJECTS = [
  "Mathematics", "English Language", "English Literature",
  "Biology", "Chemistry", "Physics", "Combined Science",
  "History", "Geography", "Computer Science",
  "Religious Studies", "French", "Spanish", "German",
  "Business Studies", "Economics", "Psychology",
  "Other",
];

export default function StudyTracker() {
  const { supabase, user } = useAuth();
  const { toast } = useToast();

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [subject, setSubject] = useState("Mathematics");
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Session history
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  // XP popup
  const [xpPopup, setXpPopup] = useState<{ show: boolean; amount: number; reason: string }>({
    show: false, amount: 0, reason: "",
  });

  // Load sessions
  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  // Timer interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const loadSessions = async () => {
    if (!user || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(50);

      if (error) {
        if (error.code === "42P01") {
          // Table doesn't exist — use localStorage
          const local = localStorage.getItem(`study_sessions_${user.id}`);
          if (local) setSessions(JSON.parse(local));
        } else {
          console.error("Error loading sessions:", error);
        }
      } else {
        setSessions(data || []);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    setStartedAt(new Date());
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setStartedAt(null);
  };

  const stopAndSave = async () => {
    if (!user || elapsedSeconds < 10) {
      toast({
        title: "Too short",
        description: "Study at least 10 seconds to log a session.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(false);
    const durationMinutes = Math.round(elapsedSeconds / 60 * 10) / 10;
    const endedAt = new Date();

    const session: StudySession = {
      id: crypto.randomUUID(),
      subject,
      duration_minutes: durationMinutes,
      started_at: startedAt?.toISOString() || endedAt.toISOString(),
      ended_at: endedAt.toISOString(),
    };

    // Save session
    try {
      if (supabase) {
        const { error } = await supabase.from("study_sessions").insert({
          id: session.id,
          user_id: user.id,
          subject: session.subject,
          duration_minutes: session.duration_minutes,
          started_at: session.started_at,
          ended_at: session.ended_at,
        });
        if (error && error.code !== "42P01") {
          console.error("Error saving session:", error);
        }

        // Update profiles.study_hours
        const hoursToAdd = durationMinutes / 60;
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("study_hours")
            .eq("id", user.id)
            .single();

          await supabase
            .from("profiles")
            .update({ study_hours: ((profile?.study_hours || 0) + hoursToAdd) })
            .eq("id", user.id);
        } catch { /* profile update is best-effort */ }
      }
    } catch (error) {
      console.error("Error saving session:", error);
    }

    // Save locally
    const updatedSessions = [session, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem(`study_sessions_${user.id}`, JSON.stringify(updatedSessions.slice(0, 100)));

    // Award XP: +5 per 30 minutes
    const xpEarned = Math.floor(durationMinutes / 30) * XP_REWARDS.STUDY_SESSION;
    if (xpEarned > 0) {
      await awardXP(supabase, user.id, xpEarned, "study_session");
      setXpPopup({ show: true, amount: xpEarned, reason: "Study Session" });
    }

    toast({
      title: "Study session saved! 📚",
      description: `${durationMinutes.toFixed(1)} minutes of ${subject}${xpEarned > 0 ? ` — earned ${xpEarned} XP!` : ""}`,
    });

    // Reset
    setElapsedSeconds(0);
    setStartedAt(null);
  };

  // Formatting
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Weekly stats
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);

  const thisWeekSessions = sessions.filter(s => new Date(s.started_at) >= weekStart);
  const totalWeekMinutes = thisWeekSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalWeekHours = (totalWeekMinutes / 60).toFixed(1);

  // Daily breakdown this week
  const dailyMinutes = Array(7).fill(0);
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  thisWeekSessions.forEach(s => {
    const day = new Date(s.started_at).getDay();
    dailyMinutes[day] += s.duration_minutes;
  });
  const maxDayMinutes = Math.max(...dailyMinutes, 1);

  // Lifetime stats
  const totalLifetimeMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalLifetimeHours = (totalLifetimeMinutes / 60).toFixed(1);

  return (
    <AppLayout>
      <XpRewardPopup
        amount={xpPopup.amount}
        reason={xpPopup.reason}
        show={xpPopup.show}
        onDone={() => setXpPopup(p => ({ ...p, show: false }))}
      />

      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-500">
            <Timer className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Study Tracker</h1>
            <p className="text-muted-foreground">Track your study hours and earn XP</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timer Section */}
          <Card className="border-2 border-teal-500/20">
            <CardContent className="pt-6 flex flex-col items-center">
              {/* Subject Selector */}
              <div className="w-full max-w-xs mb-6">
                <Select value={subject} onValueChange={setSubject} disabled={isRunning}>
                  <SelectTrigger>
                    <SelectValue placeholder="What are you studying?" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Timer Display */}
              <div className="relative w-56 h-56 rounded-full flex items-center justify-center mb-6">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="112" cy="112" r="104"
                    stroke="currentColor" strokeWidth="8" fill="none"
                    className="text-muted/20"
                  />
                  {isRunning && (
                    <circle
                      cx="112" cy="112" r="104"
                      stroke="currentColor" strokeWidth="8" fill="none"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 104}
                      strokeDashoffset={0}
                      className="text-teal-500 animate-pulse"
                    />
                  )}
                </svg>
                <div className="text-center z-10">
                  <p className="text-5xl font-mono font-bold tracking-tight">
                    {formatTime(elapsedSeconds)}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1 font-semibold">
                    {isRunning ? "Studying..." : elapsedSeconds > 0 ? "Paused" : "Ready"}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {!isRunning && elapsedSeconds === 0 && (
                  <Button
                    size="lg"
                    className="rounded-full w-14 h-14 p-0 bg-teal-500 hover:bg-teal-600"
                    onClick={startTimer}
                  >
                    <Play className="w-6 h-6 ml-0.5" />
                  </Button>
                )}
                {isRunning && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full w-14 h-14 p-0"
                    onClick={pauseTimer}
                  >
                    <Pause className="w-6 h-6" />
                  </Button>
                )}
                {!isRunning && elapsedSeconds > 0 && (
                  <>
                    <Button
                      size="lg"
                      className="rounded-full w-14 h-14 p-0 bg-teal-500 hover:bg-teal-600"
                      onClick={startTimer}
                    >
                      <Play className="w-6 h-6 ml-0.5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full w-14 h-14 p-0"
                      onClick={resetTimer}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                  </>
                )}
                {elapsedSeconds > 0 && (
                  <Button
                    size="lg"
                    className="rounded-full px-6 h-14 bg-green-500 hover:bg-green-600 text-white"
                    onClick={stopAndSave}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Save Session
                  </Button>
                )}
              </div>

              {/* XP info */}
              <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Earn +{XP_REWARDS.STUDY_SESSION} XP for every 30 minutes of study
              </p>
            </CardContent>
          </Card>

          {/* Weekly Stats */}
          <div className="space-y-4">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-teal-500" />
                  <span className="text-xs text-muted-foreground">This Week</span>
                </div>
                <p className="text-2xl font-bold">{totalWeekHours}h</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">All Time</span>
                </div>
                <p className="text-2xl font-bold">{totalLifetimeHours}h</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-muted-foreground">Sessions</span>
                </div>
                <p className="text-2xl font-bold">{sessions.length}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-violet-500" />
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
                <p className="text-2xl font-bold">
                  {(sessions
                    .filter(s => new Date(s.started_at).toDateString() === now.toDateString())
                    .reduce((sum, s) => sum + s.duration_minutes, 0) / 60
                  ).toFixed(1)}h
                </p>
              </Card>
            </div>

            {/* Weekly Bar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-28">
                  {dailyMinutes.map((mins, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full relative flex-1 flex items-end">
                        <div
                          className={cn(
                            "w-full rounded-t transition-all duration-300",
                            i === now.getDay() ? "bg-teal-500" : "bg-teal-500/30"
                          )}
                          style={{ height: `${Math.max((mins / maxDayMinutes) * 100, 2)}%` }}
                        />
                      </div>
                      <span className={cn(
                        "text-[10px]",
                        i === now.getDay() ? "font-bold text-teal-500" : "text-muted-foreground"
                      )}>
                        {dayLabels[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-teal-500" />
              Recent Sessions
            </CardTitle>
            <CardDescription>Your study session history</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8">
                <Timer className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No sessions yet. Start the timer above!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {sessions.slice(0, 20).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30"
                  >
                    <div className="p-2 rounded-lg bg-teal-500/10">
                      <BookOpen className="w-4 h-4 text-teal-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{session.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.started_at).toLocaleDateString()} · {new Date(session.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{session.duration_minutes.toFixed(1)} min</p>
                      {session.duration_minutes >= 30 && (
                        <p className="text-xs text-amber-500 flex items-center gap-0.5 justify-end">
                          <Zap className="w-3 h-3" />
                          +{Math.floor(session.duration_minutes / 30) * XP_REWARDS.STUDY_SESSION} XP
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
