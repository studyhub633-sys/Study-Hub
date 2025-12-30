import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox as UICheckbox } from "@/components/ui/checkbox";
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
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { hasPremium } from "@/lib/premium";
import { Clock, FileText, Layers, Loader2, Plus, Users, Video } from "lucide-react";
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
    linked_past_papers?: string[];
    linked_knowledge_organizers?: string[];
    linked_flashcards?: string[];
    email_verified?: boolean;
    status: "upcoming" | "live" | "completed" | "cancelled";
    created_by: string;
    created_at: string;
}

interface Resource {
    id: string;
    title: string;
    subject?: string;
    type: "past_paper" | "knowledge_organizer" | "flashcard";
}

export default function VirtualSessions() {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState<VirtualSession[]>([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [resources, setResources] = useState<Resource[]>([]);
    const [selectedResources, setSelectedResources] = useState<string[]>([]);
    const [loadingResources, setLoadingResources] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isStartNow, setIsStartNow] = useState(false);
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

    useEffect(() => {
        if (isCreateDialogOpen && user) {
            fetchResources();
        }
    }, [isCreateDialogOpen, user]);

    const fetchResources = async () => {
        if (!user) return;
        setLoadingResources(true);
        try {
            const allResources: Resource[] = [];

            // Fetch past papers
            const { data: papers } = await supabase
                .from("past_papers")
                .select("id, title, subject")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(50);

            if (papers) {
                papers.forEach(paper => {
                    allResources.push({
                        id: paper.id,
                        title: paper.title,
                        subject: paper.subject || undefined,
                        type: "past_paper"
                    });
                });
            }

            // Fetch knowledge organizers
            const { data: organizers } = await supabase
                .from("knowledge_organizers")
                .select("id, title, subject")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(50);

            if (organizers) {
                organizers.forEach(org => {
                    allResources.push({
                        id: org.id,
                        title: org.title,
                        subject: org.subject || undefined,
                        type: "knowledge_organizer"
                    });
                });
            }

            // Fetch flashcards (grouped by topic/subject for selection)
            const { data: flashcards } = await supabase
                .from("flashcards")
                .select("id, front, subject, topic")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(100);

            if (flashcards) {
                // Group flashcards by topic/subject
                const grouped = new Map<string, { count: number; subject?: string; topic?: string }>();
                flashcards.forEach(card => {
                    const key = card.topic || card.subject || "General";
                    if (!grouped.has(key)) {
                        grouped.set(key, { count: 0, subject: card.subject || undefined, topic: card.topic || undefined });
                    }
                    grouped.get(key)!.count++;
                });

                grouped.forEach((data, key) => {
                    allResources.push({
                        id: `flashcard-group-${key}`,
                        title: `${key} (${data.count} cards)`,
                        subject: data.subject,
                        type: "flashcard"
                    });
                });
            }

            setResources(allResources);
        } catch (error) {
            console.error("Error fetching resources:", error);
        } finally {
            setLoadingResources(false);
        }
    };

    const checkPremium = async () => {
        if (user && supabase) {
            const premium = await hasPremium(supabase);
            setIsPremium(premium);
        }
    };

    const fetchSessions = async () => {
        try {
            setLoading(true);
            // Fetch verified sessions, or unverified sessions created by current user
            const { data, error } = await supabase
                .from("virtual_sessions")
                .select("*")
                .in("status", ["upcoming", "live"])
                .or(`email_verified.eq.true${user ? `,and(email_verified.eq.false,created_by.eq.${user.id})` : ''}`)
                .order("scheduled_time", { ascending: true });

            if (error) {
                console.error("Error fetching sessions:", error);
                // Don't show samples on error, just empty list
                setSessions([]);
                return;
            }

            if (data) {
                setSessions(data);
            }
        } catch (error: any) {
            console.error("Error fetching sessions:", error);
            setSessions([]);
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

        if (!formData.title.trim() || !formData.tutor_name.trim() || (!formData.scheduled_time && !isStartNow)) {
            toast({
                title: "Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        setIsVerifying(true);
        try {
            const meetingRoomId = generateMeetingRoomId();
            const meetingUrl = `https://meet.jit.si/${meetingRoomId}`;
            const scheduledTime = isStartNow ? new Date().toISOString() : formData.scheduled_time;

            // Separate selected resources by type
            const pastPapers = selectedResources.filter(id => resources.find(r => r.id === id)?.type === "past_paper");
            const knowledgeOrganizers = selectedResources.filter(id => resources.find(r => r.id === id)?.type === "knowledge_organizer");
            const flashcards = selectedResources.filter(id => resources.find(r => r.id === id)?.type === "flashcard");

            // Generate verification token
            const verificationToken = crypto.randomUUID();

            const { data, error } = await supabase
                .from("virtual_sessions")
                .insert({
                    created_by: user.id,
                    title: formData.title,
                    description: formData.description || null,
                    subject: formData.subject || null,
                    tutor_name: formData.tutor_name,
                    scheduled_time: scheduledTime,
                    duration_minutes: parseInt(formData.duration_minutes) || 60,
                    max_attendees: parseInt(formData.max_attendees) || 50,
                    meeting_room_id: meetingRoomId,
                    meeting_url: meetingUrl,
                    linked_past_papers: null,
                    linked_knowledge_organizers: null,
                    linked_flashcards: null,
                    // AUTO-VERIFY for global visibility as requested
                    email_verified: true,
                    verification_token: verificationToken,
                    status: "upcoming",
                })
                .select()
                .single();

            if (error) throw error;

            // Email verification no longer blocking visibility, but we can still send the confirmation if needed.
            // For now, removing the "Check your email" toast message since it's live immediately.

            toast({
                title: "Session Created!",
                description: "Your session is now live and visible to everyone.",
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
            setSelectedResources([]);
            fetchSessions();
        } catch (error: any) {
            console.error("Error creating session:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create session. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsVerifying(false);
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
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-4">
                            {sessions.length === 0 ? (
                                <div className="text-center py-12 border rounded-xl border-dashed">
                                    <Video className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                                    <h3 className="text-lg font-semibold text-muted-foreground">No Upcomming Sessions</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                                        There are no verified sessions scheduled at the moment. {isPremium ? "Create one to get started!" : "Check back later!"}
                                    </p>
                                    {isPremium && (
                                        <Button variant="outline" className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Session
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                sessions.map((session) => {
                                    const dateDisplay = getDateDisplay(session.scheduled_time);
                                    const isRegistered = user && session.registered_users.includes(user.id);

                                    const startDate = new Date(session.scheduled_time);
                                    const enduranceMs = (session.duration_minutes || 60) * 60 * 1000;
                                    const endDate = new Date(startDate.getTime() + enduranceMs);
                                    const now = new Date();

                                    const isLive = now >= startDate && now <= endDate;
                                    const isPast = now > endDate;
                                    const isCreator = user && session.created_by === user.id;

                                    // Allow join if:
                                    // 1. It is currently live (within time window) AND (registered OR creator)
                                    // 2. It is upcoming but creator wants to start it early (optional, but good for testing)
                                    // 3. Status is explicitly set to 'live' in DB
                                    const canJoin = (isLive || session.status === "live" || isCreator) && !isPast;

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
                                                        {isLive ? (
                                                            <Badge variant="default" className="text-xs animate-pulse bg-red-500 hover:bg-red-600">LIVE NOW</Badge>
                                                        ) : isPast ? (
                                                            <Badge variant="secondary" className="text-xs">Completed</Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="text-xs">Upcoming</Badge>
                                                        )}
                                                        <span className="text-xs text-muted-foreground flex items-center">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {formatDate(session.scheduled_time)}
                                                            <span className="ml-1">({session.duration_minutes} mins)</span>
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
                                                    {(session.linked_past_papers?.length || session.linked_knowledge_organizers?.length || session.linked_flashcards?.length) && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {session.linked_past_papers && session.linked_past_papers.length > 0 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <FileText className="w-3 h-3 mr-1" />
                                                                    {session.linked_past_papers.length} Past Paper{session.linked_past_papers.length > 1 ? 's' : ''}
                                                                </Badge>
                                                            )}
                                                            {session.linked_knowledge_organizers && session.linked_knowledge_organizers.length > 0 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Layers className="w-3 h-3 mr-1" />
                                                                    {session.linked_knowledge_organizers.length} Knowledge Organizer{session.linked_knowledge_organizers.length > 1 ? 's' : ''}
                                                                </Badge>
                                                            )}
                                                            {session.linked_flashcards && session.linked_flashcards.length > 0 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Layers className="w-3 h-3 mr-1" />
                                                                    {session.linked_flashcards.length} Flashcard Set{session.linked_flashcards.length > 1 ? 's' : ''}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    {canJoin ? (
                                                        <Button
                                                            className={isCreator ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}
                                                            onClick={() => handleJoinSession(session)}
                                                        >
                                                            <Video className="w-4 h-4 mr-2" />
                                                            {isCreator ? "Start Session" : "Join Session"}
                                                        </Button>
                                                    ) : isRegistered ? (
                                                        <Button variant="outline" disabled>
                                                            Registered
                                                        </Button>
                                                    ) : isPast ? (
                                                        <Button variant="ghost" disabled>
                                                            Ended
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
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Session Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Virtual Session</DialogTitle>
                        <DialogDescription>
                            Create a new virtual group revision session using Jitsi Meet.
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
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="scheduled_time">Scheduled Time *</Label>
                                    <div className="flex items-center space-x-2">
                                        <UICheckbox
                                            id="start-now"
                                            checked={isStartNow}
                                            onCheckedChange={(checked) => setIsStartNow(checked === true)}
                                        />
                                        <label
                                            htmlFor="start-now"
                                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-indigo-600"
                                        >
                                            Start Now
                                        </label>
                                    </div>
                                </div>
                                <Input
                                    id="scheduled_time"
                                    type="datetime-local"
                                    value={formData.scheduled_time}
                                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                                    disabled={isStartNow}
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsCreateDialogOpen(false);
                            setSelectedResources([]);
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateSession} disabled={isVerifying}>
                            {isVerifying ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Session"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
