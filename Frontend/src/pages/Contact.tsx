import AnimatedLogoIcon from "@/components/AnimatedLogoIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Contact() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !message.trim()) {
            toast({
                title: "Missing fields",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        // Build mailto link
        const mailtoSubject = encodeURIComponent(
            subject.trim() || `Contact from ${name}`
        );
        const mailtoBody = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\n\n${message}`
        );
        window.location.href = `mailto:hello@revisely.ai?subject=${mailtoSubject}&body=${mailtoBody}`;

        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Email client opened",
                description: "Your default email app should have opened with your message. If not, please email us directly at hello@revisely.ai",
            });
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-background to-muted/20 p-4">
            {/* Go Back Button */}
            <div className="w-full max-w-2xl mb-4">
                <Link to="/landing">
                    <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        {t("common.back")}
                    </Button>
                </Link>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <AnimatedLogoIcon />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    Have a question, suggestion, or need help? We'd love to hear from you.
                </p>
            </div>

            <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info Cards */}
                <div className="space-y-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="flex items-start gap-4 pt-6">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Email</h3>
                                <a
                                    href="mailto:hello@revisely.ai"
                                    className="text-primary hover:underline text-sm"
                                >
                                    hello@revisely.ai
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="flex items-start gap-4 pt-6">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Address</h3>
                                <p className="text-sm text-muted-foreground">
                                    REVISELY LTD
                                    <br />
                                    61 Bridge Street
                                    <br />
                                    Kington, HR5 3DJ
                                    <br />
                                    United Kingdom
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="flex items-start gap-4 pt-6">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Response Time</h3>
                                <p className="text-sm text-muted-foreground">
                                    We typically respond within 24 hours.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Send us a message</CardTitle>
                        <CardDescription>
                            Fill out the form below and we'll get back to you as soon as possible.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact-name">Name *</Label>
                                <Input
                                    id="contact-name"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-email">Email *</Label>
                                <Input
                                    id="contact-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-subject">Subject</Label>
                                <Input
                                    id="contact-subject"
                                    placeholder="What's this about?"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-message">Message *</Label>
                                <textarea
                                    id="contact-message"
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    placeholder="Tell us how we can help..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                <Send className="h-4 w-4 mr-2" />
                                {loading ? "Opening email..." : "Send Message"}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                Or email us directly at{" "}
                                <a href="mailto:hello@revisely.ai" className="text-primary hover:underline">
                                    hello@revisely.ai
                                </a>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
