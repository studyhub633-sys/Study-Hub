import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useEffect, useState } from "react";

export default function FocusMode() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<"focus" | "break">("focus");

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === "focus" ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12 flex flex-col items-center justify-center min-h-[70vh]">

                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                        <Timer className="w-8 h-8 text-red-500" />
                        Focus Mode
                    </h1>
                    <p className="text-muted-foreground">Block out distractions and master your time.</p>
                </div>

                {/* Timer Circle */}
                <div className="relative w-80 h-80 rounded-full border-8 border-muted flex items-center justify-center bg-card shadow-2xl">
                    <div className={`absolute inset-0 rounded-full border-8 ${mode === 'focus' ? 'border-red-500' : 'border-green-500'} opacity-20`}></div>
                    <div className="text-center z-10">
                        <div className="text-7xl font-mono font-bold tracking-tighter mb-2">
                            {formatTime(timeLeft)}
                        </div>
                        <div className="uppercase tracking-widest text-sm font-semibold text-muted-foreground">
                            {isActive ? "Running" : "Paused"}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4 mt-8">
                    <Button
                        size="lg"
                        className="rounded-full w-16 h-16 p-0"
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

                {/* Task List (Mock) */}
                <Card className="w-full max-w-md mt-12 p-4">
                    <h3 className="font-semibold mb-4 text-sm uppercase text-muted-foreground">Current Session Tasks</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="line-through text-muted-foreground">Review Biology Flashcards</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-secondary">
                            <div className="w-5 h-5 rounded-full border-2 border-primary/30"></div>
                            <span>Complete Past Paper 2023</span>
                        </div>
                    </div>
                </Card>

            </div>
        </AppLayout>
    );
}
