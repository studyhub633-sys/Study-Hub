import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, Video } from "lucide-react";

export default function VirtualSessions() {
    const sessions = [
        { title: "GCSE Maths: Algebra Revision", tutor: "Dr. Smith", time: "Today, 5:00 PM", attendees: 24, tag: "Maths" },
        { title: "English Lit: Macbeth Quotes", tutor: "Ms. Jones", time: "Tomorrow, 4:00 PM", attendees: 18, tag: "English" },
        { title: "Physics: Forces & Motion", tutor: "Mr. Brown", time: "Wed, 6:00 PM", attendees: 32, tag: "Science" },
    ];

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

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
                    {sessions.map((session, i) => (
                        <Card key={i} className="group hover:border-indigo-500/50 transition-colors">
                            <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center font-bold">
                                    <span className="text-xs uppercase opacity-70">DEC</span>
                                    <span className="text-2xl">15</span>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="text-xs">{session.tag}</Badge>
                                        <span className="text-xs text-muted-foreground flex items-center">
                                            <Clock className="w-3 h-3 mr-1" /> {session.time}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold group-hover:text-indigo-500 transition-colors">
                                        {session.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Hosted by {session.tutor} • <Users className="w-3 h-3 inline pb-0.5" /> {session.attendees} joining
                                    </p>
                                </div>

                                <div>
                                    <Button 
                                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700"
                                        onClick={() => {
                                            // In a real implementation, this would register the user for the session
                                            alert(`Registration for "${session.title}" would be processed here. This feature requires backend integration.`);
                                        }}
                                    >
                                        Register Now
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
