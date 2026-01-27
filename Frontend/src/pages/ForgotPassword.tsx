import AnimatedLogoIcon from "@/components/AnimatedLogoIcon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { resetPassword } = useAuth();
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await resetPassword(email);
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || "Failed to send reset email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
            {/* Go Back Button */}
            <div className="w-full max-w-md mb-4">
                <Link to="/login">
                    <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        {t('auth.returnToLogin')}
                    </Button>
                </Link>
            </div>

            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <AnimatedLogoIcon />
                    </div>
                    <CardTitle className="text-2xl font-bold">{t('auth.resetPassword')}</CardTitle>
                    <CardDescription>
                        {submitted
                            ? t('auth.checkEmail')
                            : t('auth.resetPasswordSubtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {submitted ? (
                        <div className="text-center py-4 space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle2 className="h-12 w-12 text-green-500 animate-in zoom-in duration-300" />
                            </div>
                            <p className="text-muted-foreground">
                                {t('auth.emailSentTo', { email: email })}
                            </p>
                            <p className="text-sm">
                                {t('auth.checkSpam')}
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="text-primary hover:underline"
                                >
                                    {t('auth.tryAgain')}
                                </button>
                            </p>
                            <Link to="/login" className="block mt-4">
                                <Button variant="outline" className="w-full">
                                    {t('auth.returnToLogin')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('common.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t('auth.sendingLink')}
                                    </>
                                ) : (
                                    t('auth.sendResetLink')
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
