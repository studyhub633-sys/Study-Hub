import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { hasPremium } from "@/lib/premium";
import { Clock, Loader2, Plus, Users, Video } from "lucide-react";
import { useEffect, useState } from "react";

interface VirtualSession {
    id: string;
    title: string;
    description: string | null;
    subject: string | null;
    tutor_name: string;
    scheduled_time: string;
    duration_minutes: number;
    meeting_room_id: string;
    meeting_url: string;
    max_attendees: number;
    registered_users: string[];
    status: "upcoming" | "live" | "completed" | "cancelled";
    created_by: string;
    created_at: string;
}

export default function VirtualSessions() {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState<VirtualSession[]>([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subject: "",
        tutor_name: "",
        scheduled_time: "",
        duration_minutes: "60",
        max_attendees: "50",
    });

    useEffect(() => {
        if (user) {
            fetchSessions();
            checkPremium();
        }
    }, [user]);

    const checkPremium = async () => {
        if (user && supabase) {
            const premium = await hasPremium(supabase);
            setIsPremium(premium);
        }
    };

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("virtual_sessions")
                .select("*")
                .in("status", ["upcoming", "live"])
                .order("scheduled_time", { ascending: true });

            if (error) throw error;
            setSessions(data || []);
        } catch (error: any) {
            console.error("Error fetching sessions:", error);
            // Fallback to sample data if table doesn't exist
            setSessions([
                {
                    id: "sample-1",
                    title: "GCSE Maths: Algebra Revision",
                    description: "Comprehensive algebra revision session",
                    subject: "Mathematics",
                    tutor_name: "Dr. Smith",
                    scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                    duration_minutes: 60,
                    meeting_room_id: "maths-algebra-2024",
                    meeting_url: "https://meet.jit.si/maths-algebra-2024",
                    max_attendees: 50,
                    registered_users: [],
                    status: "upcoming",
                    created_by: "admin",
                    created_at: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const generateMeetingRoomId = () => {
        // Generate a unique room ID for Jitsi Meet
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `study-hub-${timestamp}-${random}`;
    };

    const handleCreateSession = async () => {
        if (!user) {
            toast({
                title: "Error",
                description: "Please sign in to create a session.",
                variant: "destructive",
            });
            return;
        }

        if (!formData.title.trim() || !formData.tutor_name.trim() || !formData.scheduled_time) {
            toast({
                title: "Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        try {
            const meetingRoomId = generateMeetingRoomId();
            const meetingUrl = `https://meet.jit.si/${meetingRoomId}`;

            const { data, error } = await supabase
                .from("virtual_sessions")
                .insert({
                    created_by: user.id,
                    title: formData.title,
                    description: formData.description || null,
                    subject: formData.subject || null,
                    tutor_name: formData.tutor_name,
                    scheduled_time: formData.scheduled_time,
                    duration_minutes: parseInt(formData.duration_minutes) || 60,
                    max_attendees: parseInt(formData.max_attendees) || 50,
                    meeting_room_id: meetingRoomId,
                    meeting_url: meetingUrl,
                    status: "upcoming",
                })
                .select()
                .single();

            if (error) throw error;

            toast({
                title: "Success",
                description: "Virtual session created successfully!",
            });

            setIsCreateDialogOpen(false);
            setFormData({
                title: "",
                description: "",
                subject: "",
                tutor_name: "",
                scheduled_time: "",
                duration_minutes: "60",
                max_attendees: "50",
            });
            fetchSessions();
        } catch (error: any) {
            console.error("Error creating session:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create session. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleRegister = async (sessionId: string) => {
        if (!user) {
            toast({
                title: "Error",
                description: "Please sign in to register for sessions.",
                variant: "destructive",
            });
            return;
        }

        try {
            const session = sessions.find(s => s.id === sessionId);
            if (!session) return;

            if (session.registered_users.includes(user.id)) {
                toast({
                    title: "Already Registered",
                    description: "You are already registered for this session.",
                });
                return;
            }

            const { error } = await supabase
                .from("virtual_sessions")
                .update({
                    registered_users: [...session.registered_users, user.id],
                })
                .eq("id", sessionId);

            if (error) throw error;

            toast({
                title: "Success",
                description: "You have been registered for this session!",
            });

            fetchSessions();
        } catch (error: any) {
            console.error("Error registering:", error);
            toast({
                title: "Error",
                description: "Failed to register. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleJoinSession = (session: VirtualSession) => {
        // Open Jitsi Meet in a new window
        window.open(session.meeting_url, "_blank", "width=1200,height=800");
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 0) return "Past";
        if (diffInHours < 24) return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
        if (diffInHours < 48) return `Tomorrow, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    };

    const getDateDisplay = (dateString: string) => {
        const date = new Date(dateString);
        return {
            month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
            day: date.getDate().toString(),
        };
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                        <Video className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Virtual Group Sessions</h1>
                        <p className="text-muted-foreground">Live revision sessions led by expert tutors every week.</p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
                    {isPremium && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Session
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : sessions.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Video className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No sessions scheduled</h3>
                            <p className="text-muted-foreground mb-4">
                                {isPremium ? "Create your first virtual session to get started." : "Check back soon for upcoming revision sessions."}
                            </p>
                            {isPremium && (
                                <Button onClick={() => setIsCreateDialogOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Session
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session) => {
                            const dateDisplay = getDateDisplay(session.scheduled_time);
                            const isRegistered = user && session.registered_users.includes(user.id);
                            const isPast = new Date(session.scheduled_time) < new Date();
                            const canJoin = !isPast && (isRegistered || session.status === "live");

                            return (
                                <Card key={session.id} className="group hover:border-indigo-500/50 transition-colors">
                                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                                        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center font-bold">
                                            <span className="text-xs uppercase opacity-70">{dateDisplay.month}</span>
                                            <span className="text-2xl">{dateDisplay.day}</span>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {session.subject && (
                                                    <Badge variant="outline" className="text-xs">{session.subject}</Badge>
                                                )}
                                                <Badge variant={session.status === "live" ? "default" : "secondary"} className="text-xs">
                                                    {session.status === "live" ? "LIVE" : "Upcoming"}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" /> {formatDate(session.scheduled_time)}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold group-hover:text-indigo-500 transition-colors">
                                                {session.title}
                                            </h3>
                                            {session.description && (
                                                <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                                            )}
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Hosted by {session.tutor_name} • <Users className="w-3 h-3 inline pb-0.5" /> {session.registered_users.length} registered
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            {canJoin ? (
                                                <Button
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleJoinSession(session)}
                                                >
                                                    <Video className="w-4 h-4 mr-2" />
                                                    Join Session
                                                </Button>
                                            ) : isRegistered ? (
                                                <Button variant="outline" disabled>
                                                    Registered
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="bg-indigo-600 hover:bg-indigo-700"
                                                    onClick={() => handleRegister(session.id)}
                                                >
                                                    Register Now
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Session Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Virtual Session</DialogTitle>
                        <DialogDescription>
                            Create a new virtual group revision session using Jitsi Meet (free video conferencing).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Session Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., GCSE Maths: Algebra Revision"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="What will be covered in this session?"
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                                        <SelectItem value="English Literature">English Literature</SelectItem>
                                        <SelectItem value="Biology">Biology</SelectItem>
                                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                                        <SelectItem value="Physics">Physics</SelectItem>
                                        <SelectItem value="History">History</SelectItem>
                                        <SelectItem value="Geography">Geography</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tutor_name">Tutor Name *</Label>
                                <Input
                                    id="tutor_name"
                                    value={formData.tutor_name}
                                    onChange={(e) => setFormData({ ...formData, tutor_name: e.target.value })}
                                    placeholder="e.g., Dr. Smith"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="scheduled_time">Scheduled Time *</Label>
                                <Input
                                    id="scheduled_time"
                                    type="datetime-local"
                                    value={formData.scheduled_time}
                                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                                <Input
                                    id="duration_minutes"
                                    type="number"
                                    value={formData.duration_minutes}
                                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                                    placeholder="60"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max_attendees">Max Attendees</Label>
                            <Input
                                id="max_attendees"
                                type="number"
                                value={formData.max_attendees}
                                onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                                placeholder="50"
                            />
                        </div>
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                <strong>Note:</strong> Sessions use Jitsi Meet for video conferencing. A unique meeting room will be created automatically when you save this session.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateSession}>
                            Create Session
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
