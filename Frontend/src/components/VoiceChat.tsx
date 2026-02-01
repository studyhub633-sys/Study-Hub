
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Volume2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface VoiceChatProps {
    isOpen: boolean;
    onClose: () => void;
    onSendMessage: (message: string) => Promise<string>;
    isProcessing: boolean;
}

// Add type definitions for Web Speech API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export function VoiceChat({ isOpen, onClose, onSendMessage, isProcessing }: VoiceChatProps) {
    const { t } = useTranslation();
    const [status, setStatus] = useState<"idle" | "listening" | "processing" | "speaking">("idle");
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const synthesisRef = useRef<SpeechSynthesis>(window.speechSynthesis);

    // Initialize Speech Recognition
    useEffect(() => {
        if (!isOpen) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US"; // Should ideally match i18n language

        recognition.onstart = () => {
            setStatus("listening");
            setError(null);
        };

        recognition.onresult = (event: any) => {
            const current = event.resultIndex;
            const transcriptText = event.results[current][0].transcript;
            setTranscript(transcriptText);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            if (event.error === "no-speech") {
                setStatus("idle");
            } else {
                setError("Error accessing microphone: " + event.error);
                setStatus("idle");
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { }
            }
            if (synthesisRef.current) {
                synthesisRef.current.cancel();
            }
        };
    }, [isOpen]);

    const startListening = () => {
        if (recognitionRef.current && status !== "listening" && status !== "speaking" && status !== "processing") {
            try {
                setTranscript("");
                recognitionRef.current.start();
            } catch (e) {
                console.error("Failed to start recognition", e);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const speakResponse = (text: string) => {
        if (!synthesisRef.current) return;

        // Clean text (remove markdown mostly)
        const cleanText = text.replace(/[*#_`]/g, "");

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.onstart = () => setStatus("speaking");
        utterance.onend = () => {
            setStatus("idle");
            // Auto-restart listening after speaking? 
            if (isOpen) {
                setTimeout(startListening, 500);
            }
        };
        utterance.onerror = () => setStatus("idle");

        // Pick a nice voice if available
        const voices = synthesisRef.current.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha")) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        setStatus("speaking");
        synthesisRef.current.speak(utterance);
    };

    // Trigger send when recognition ends with content
    useEffect(() => {
        if (!recognitionRef.current) return;

        recognitionRef.current.onend = async () => {
            // Only convert to message if we have transcript and we were listening
            // Note: simple check on transcript might check partials, but onend implies final
            if (transcript.trim().length > 0 && status === "listening") {
                setStatus("processing");
                try {
                    const response = await onSendMessage(transcript);
                    speakResponse(response);
                    setTranscript("");
                } catch (e) {
                    setError("Failed to process message");
                    setStatus("idle");
                }
            } else {
                if (status === "listening") {
                    setStatus("idle");
                }
            }
        };
    }, [transcript, onSendMessage, status]);

    // Effect to start listening when opening
    useEffect(() => {
        if (isOpen && status === "idle" && !error) {
            const timer = setTimeout(() => startListening(), 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, status, error]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg p-6 flex flex-col items-center justify-center space-y-8">
                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-4 rounded-full h-12 w-12 bg-muted/50 hover:bg-muted"
                    onClick={() => {
                        stopListening();
                        synthesisRef.current.cancel();
                        onClose();
                    }}
                >
                    <X className="h-6 w-6" />
                </Button>

                {/* Status Text */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">
                        {status === "listening" && "Listening..."}
                        {status === "processing" && "Thinking..."}
                        {status === "speaking" && "Speaking..."}
                        {status === "idle" && "Tap to speak"}
                    </h2>
                    <p className="text-muted-foreground h-6 flex items-center justify-center">
                        {transcript || (status === "processing" ? "Processing your request..." : "")}
                    </p>
                </div>

                {/* Visualizer / Interaction Area */}
                <div className="relative h-64 w-64 flex items-center justify-center">
                    {/* Ripples - CSS Animation */}
                    {(status === "listening" || status === "speaking") && (
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75 duration-[3000ms]" />
                    )}

                    {/* Second Ripple */}
                    {(status === "listening" || status === "speaking") && (
                        <div className="absolute inset-4 rounded-full bg-primary/20 animate-ping opacity-50 duration-[2000ms] delay-75" />
                    )}

                    {/* Main Button */}
                    <div
                        className={cn(
                            "relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer hover:scale-105",
                            status === "listening" ? "bg-red-500 shadow-red-500/20" :
                                status === "speaking" ? "bg-green-500 shadow-green-500/20" :
                                    status === "processing" ? "bg-yellow-500 animate-pulse" :
                                        "bg-primary shadow-primary/20"
                        )}
                        onClick={() => {
                            if (status === "speaking") {
                                synthesisRef.current.cancel();
                                setStatus("idle");
                            } else if (status === "listening") {
                                stopListening();
                            } else {
                                startListening();
                            }
                        }}
                    >
                        {status === "listening" ? (
                            <Mic className="h-12 w-12 text-white" />
                        ) : status === "speaking" ? (
                            <Volume2 className="h-12 w-12 text-white" />
                        ) : (
                            <MicOff className="h-12 w-12 text-white" />
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                    {status === "idle" && "Tap the microphone to start handling the conversation"}
                    {status === "listening" && "I'm listening to your voice..."}
                    {status === "speaking" && "Tap to interrupt"}
                </p>

                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-lg">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
