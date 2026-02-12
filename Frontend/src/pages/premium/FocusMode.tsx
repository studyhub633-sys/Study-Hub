import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { hasPremium } from "@/lib/premium";
import { CheckCircle2, Loader2, Pause, Play, Plus, RotateCcw, Timer, X } from "lucide-react";
import { useEffect, useState } from "react";

interface FocusTask {
    id: string;
    text: string;
    completed: boolean;
    created_at: string;
}

export default function FocusMode() {
    const { user, supabase } = useAuth();
    const { toast } = useToast();

    // Premium check
    const [isPremium, setIsPremium] = useState(false);
    const [checkingPremium, setCheckingPremium] = useState(true);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<"focus" | "break">("focus");
    const [sessionsCompleted, setSessionsCompleted] = useState(0);

    // Task state
    const [tasks, setTasks] = useState<FocusTask[]>([]);
    const [newTaskText, setNewTaskText] = useState("");
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [addingTask, setAddingTask] = useState(false);

    useEffect(() => {
        const checkPremiumStatus = async () => {
            if (!user || !supabase) {
                setCheckingPremium(false);
                return;
            }
            try {
                const premium = await hasPremium(supabase);
                setIsPremium(premium);
            } catch (error) {
                console.error("Error checking premium status:", error);
            } finally {
                setCheckingPremium(false);
            }
        };
        checkPremiumStatus();
    }, [user]);

    // Load tasks on mount
    useEffect(() => {
        if (user) {
            loadTasks();
        } else {
            setLoadingTasks(false);
        }
    }, [user]);

    const loadTasks = async () => {
        if (!supabase || !user) return;

        try {
            setLoadingTasks(true);
            const { data, error } = await supabase
                .from("focus_tasks")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                // If table doesn't exist, create local storage fallback
                if (error.code === "42P01") {
                    const localTasks = localStorage.getItem(`focus_tasks_${user.id}`);
                    if (localTasks) {
                        setTasks(JSON.parse(localTasks));
                    }
                } else {
                    console.error("Error loading tasks:", error);
                }
            } else {
                setTasks(data || []);
            }
        } catch (error) {
            console.error("Error loading tasks:", error);
            // Fallback to localStorage
            const localTasks = localStorage.getItem(`focus_tasks_${user?.id}`);
            if (localTasks) {
                setTasks(JSON.parse(localTasks));
            }
        } finally {
            setLoadingTasks(false);
        }
    };

    const saveTasksLocally = (updatedTasks: FocusTask[]) => {
        if (user) {
            localStorage.setItem(`focus_tasks_${user.id}`, JSON.stringify(updatedTasks));
        }
    };

    const addTask = async () => {
        if (!newTaskText.trim()) return;

        const newTask: FocusTask = {
            id: crypto.randomUUID(),
            text: newTaskText.trim(),
            completed: false,
            created_at: new Date().toISOString()
        };

        setAddingTask(true);

        try {
            if (supabase && user) {
                const { error } = await supabase
                    .from("focus_tasks")
                    .insert({
                        id: newTask.id,
                        user_id: user.id,
                        text: newTask.text,
                        completed: false,
                        created_at: newTask.created_at
                    });

                if (error && error.code !== "42P01") {
                    throw error;
                }
            }

            const updatedTasks = [newTask, ...tasks];
            setTasks(updatedTasks);
            saveTasksLocally(updatedTasks);
            setNewTaskText("");

            toast({
                title: "Task Added",
                description: "Your task has been added to the list.",
            });
        } catch (error) {
            console.error("Error adding task:", error);
            // Still add locally even if DB fails
            const updatedTasks = [newTask, ...tasks];
            setTasks(updatedTasks);
            saveTasksLocally(updatedTasks);
            setNewTaskText("");
        } finally {
            setAddingTask(false);
        }
    };

    const toggleTask = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const updatedTasks = tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        setTasks(updatedTasks);
        saveTasksLocally(updatedTasks);

        try {
            if (supabase && user) {
                await supabase
                    .from("focus_tasks")
                    .update({ completed: !task.completed })
                    .eq("id", taskId);
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }

        if (!task.completed) {
            toast({
                title: "Task Completed! 🎉",
                description: "Great job! Keep up the momentum.",
            });
        }
    };

    const deleteTask = async (taskId: string) => {
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        setTasks(updatedTasks);
        saveTasksLocally(updatedTasks);

        try {
            if (supabase && user) {
                await supabase
                    .from("focus_tasks")
                    .delete()
                    .eq("id", taskId);
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        }

        toast({
            title: "Task Removed",
            description: "Task has been deleted.",
        });
    };

    const clearCompletedTasks = async () => {
        const completedIds = tasks.filter(t => t.completed).map(t => t.id);
        const updatedTasks = tasks.filter(t => !t.completed);
        setTasks(updatedTasks);
        saveTasksLocally(updatedTasks);

        try {
            if (supabase && user && completedIds.length > 0) {
                await supabase
                    .from("focus_tasks")
                    .delete()
                    .in("id", completedIds);
            }
        } catch (error) {
            console.error("Error clearing tasks:", error);
        }

        toast({
            title: "Cleared",
            description: `${completedIds.length} completed task(s) removed.`,
        });
    };

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);

            // Play a notification sound (optional)
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification(mode === "focus" ? "Focus session complete!" : "Break is over!");
            }

            if (mode === "focus") {
                setSessionsCompleted(prev => prev + 1);
                toast({
                    title: "Focus Session Complete! 🎯",
                    description: "Great work! Take a short break.",
                });
                // Auto switch to break
                setMode("break");
                setTimeLeft(5 * 60);
            } else {
                toast({
                    title: "Break Over!",
                    description: "Ready to focus again?",
                });
                setMode("focus");
                setTimeLeft(25 * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode, toast]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === "focus" ? 25 * 60 : 5 * 60);
    };

    const switchMode = (newMode: "focus" | "break") => {
        setIsActive(false);
        setMode(newMode);
        setTimeLeft(newMode === "focus" ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const progress = mode === "focus"
        ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
        : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;

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
                                <Timer className="w-6 h-6 text-amber-500" />
                                Premium Feature
                            </CardTitle>
                            <CardDescription>
                                Focus Mode is a premium feature
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Upgrade to premium to use the Pomodoro timer and manage your focus sessions.
                            </p>
                            <Button
                                onClick={() => window.location.href = '/premium-dashboard'}
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
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">

                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                        <Timer className="w-8 h-8 text-red-500" />
                        Focus Mode
                    </h1>
                    <p className="text-muted-foreground">Block out distractions and master your time with the Pomodoro Technique.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Timer Section */}
                    <div className="flex flex-col items-center">
                        {/* Mode Toggle */}
                        <div className="flex gap-2 mb-6">
                            <Button
                                variant={mode === "focus" ? "default" : "outline"}
                                onClick={() => switchMode("focus")}
                                className={mode === "focus" ? "bg-red-500 hover:bg-red-600" : ""}
                            >
                                Focus (25m)
                            </Button>
                            <Button
                                variant={mode === "break" ? "default" : "outline"}
                                onClick={() => switchMode("break")}
                                className={mode === "break" ? "bg-green-500 hover:bg-green-600" : ""}
                            >
                                Break (5m)
                            </Button>
                        </div>

                        {/* Timer Circle */}
                        <div className="relative w-72 h-72 rounded-full flex items-center justify-center">
                            {/* Background circle */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle
                                    cx="144"
                                    cy="144"
                                    r="135"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="none"
                                    className="text-muted/30"
                                />
                                <circle
                                    cx="144"
                                    cy="144"
                                    r="135"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 135}
                                    strokeDashoffset={2 * Math.PI * 135 * (1 - progress / 100)}
                                    className={`transition-all duration-300 ${mode === 'focus' ? 'text-red-500' : 'text-green-500'}`}
                                />
                            </svg>

                            <div className="text-center z-10">
                                <div className="text-6xl font-mono font-bold tracking-tighter mb-2">
                                    {formatTime(timeLeft)}
                                </div>
                                <div className="uppercase tracking-widest text-sm font-semibold text-muted-foreground">
                                    {isActive ? (mode === "focus" ? "Focusing..." : "Resting...") : "Paused"}
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-4 mt-6">
                            <Button
                                size="lg"
                                className={`rounded-full w-16 h-16 p-0 ${mode === 'focus' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                onClick={toggleTimer}
                            >
                                {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-full w-16 h-16 p-0"
                                onClick={resetTimer}
                            >
                                <RotateCcw className="w-6 h-6" />
                            </Button>
                        </div>

                        {/* Session Counter */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">Sessions Completed Today</p>
                            <p className="text-2xl font-bold text-primary">{sessionsCompleted}</p>
                        </div>
                    </div>

                    {/* Task List Section */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">Session Tasks</h3>
                            {completedCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearCompletedTasks}
                                    className="text-xs text-muted-foreground hover:text-destructive"
                                >
                                    Clear Completed
                                </Button>
                            )}
                        </div>

                        {/* Add New Task */}
                        <div className="flex gap-2 mb-4">
                            <Input
                                placeholder="Add a task for this session..."
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addTask()}
                                disabled={addingTask}
                            />
                            <Button
                                onClick={addTask}
                                disabled={!newTaskText.trim() || addingTask}
                                size="icon"
                            >
                                {addingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            </Button>
                        </div>

                        {/* Task Progress */}
                        {totalCount > 0 && (
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                    <span>Progress</span>
                                    <span>{completedCount}/{totalCount} completed</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-300"
                                        style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Task List */}
                        <div className="space-y-2 max-h-[350px] overflow-y-auto">
                            {loadingTasks ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : tasks.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No tasks yet.</p>
                                    <p className="text-sm">Add tasks to track your focus session goals!</p>
                                </div>
                            ) : (
                                tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className={`group flex items-center gap-3 p-3 rounded-lg transition-all ${task.completed
                                            ? "bg-green-500/10 border border-green-500/20"
                                            : "bg-secondary/50 border border-border hover:border-primary/30"
                                            }`}
                                    >
                                        <button
                                            onClick={() => toggleTask(task.id)}
                                            className="flex-shrink-0"
                                        >
                                            {task.completed ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-primary/30 hover:border-primary transition-colors" />
                                            )}
                                        </button>
                                        <span className={`flex-1 ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                                            {task.text}
                                        </span>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Tips Card */}
                <Card className="p-6 bg-gradient-to-r from-red-500/5 to-orange-500/5 border-red-500/20">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Timer className="w-5 h-5 text-red-500" />
                        Pomodoro Tips
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                        <li>• Work for 25 minutes, then take a 5-minute break</li>
                        <li>• After 4 sessions, take a longer 15-30 minute break</li>
                        <li>• Remove distractions: close unnecessary tabs and apps</li>
                        <li>• Write down tasks before starting to stay focused</li>
                    </ul>
                </Card>
            </div>
        </AppLayout>
    );
}
