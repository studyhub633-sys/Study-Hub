import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto animate-fade-in pb-12">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link to="/landing">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Privacy Policy</h1>
                        <p className="text-muted-foreground">
                            Last updated: February 2026
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Scientia.ai Privacy Policy</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="text-muted-foreground">
                            This privacy policy will be updated with full details soon. By using Scientia.ai, you agree to the collection and use of information in accordance with this policy.
                        </p>

                        <h3 className="text-lg font-semibold mt-6 mb-3">1. Information We Collect</h3>
                        <p className="text-muted-foreground">
                            We collect information you provide directly to us, including your email address, name, and study-related data you choose to store on our platform.
                        </p>

                        <h3 className="text-lg font-semibold mt-6 mb-3">2. How We Use Your Information</h3>
                        <p className="text-muted-foreground">
                            We use the information we collect to provide, maintain, and improve our services, and to communicate with you about updates and features.
                        </p>

                        <h3 className="text-lg font-semibold mt-6 mb-3">3. Data Security</h3>
                        <p className="text-muted-foreground">
                            We implement appropriate security measures to protect your personal information. Your data is stored securely and encrypted.
                        </p>

                        <h3 className="text-lg font-semibold mt-6 mb-3">4. Your Rights</h3>
                        <p className="text-muted-foreground">
                            You have the right to access, update, or delete your personal information at any time through your account settings.
                        </p>

                        <h3 className="text-lg font-semibold mt-6 mb-3">5. Contact Us</h3>
                        <p className="text-muted-foreground">
                            If you have any questions about this Privacy Policy, please contact us through our support channels.
                        </p>

                        <div className="mt-8 p-4 rounded-lg bg-muted/50 border">
                            <p className="text-sm text-muted-foreground italic">
                                📝 This is a placeholder privacy policy. Full policy content will be added soon.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
