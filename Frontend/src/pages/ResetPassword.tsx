import AnimatedLogoIcon from "@/components/AnimatedLogoIcon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { updatePassword, session, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Check if we have a recovery session
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            setCheckingSession(false);
        }
    }, [authLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError(t('auth.passwordsDoNotMatch'));
            return;
        }

        if (password.length < 6) {
            setError(t('auth.passwordLength'));
            return;
        }

        setLoading(true);

        try {
            await updatePassword(password);
            setSubmitted(true);
            // Automatically redirect after a few seconds
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Failed to update password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <AnimatedLogoIcon />
                    </div>
                    <CardTitle className="text-2xl font-bold">{t('auth.setNewPassword')}</CardTitle>
                    <CardDescription>
                        {submitted
                            ? t('auth.successReset')
                            : !session && !checkingSession
                                ? t('auth.linkExpired')
                                : t('auth.enterNewPassword')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!session && !checkingSession && !submitted && (
                        <div className="mb-4">
                            <Alert variant="destructive">
                                <AlertDescription>
                                    {t('auth.sessionMissing')}
                                </AlertDescription>
                            </Alert>
                            <Link to="/forgot-password">
                                <Button variant="outline" className="w-full mt-2">
                                    {t('auth.requestNewLink')}
                                </Button>
                            </Link>
                        </div>
                    )}
                    {submitted ? (
                        <div className="text-center py-4 space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle2 className="h-12 w-12 text-green-500 animate-in zoom-in duration-300" />
                            </div>
                            <p className="text-muted-foreground">
                                {t('auth.passwordUpdated')}
                            </p>
                            <Link to="/login" className="block mt-4">
                                <Button className="w-full">
                                    {t('auth.loginNow')}
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
                                <Label htmlFor="password">{t('auth.newPassword')}</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder={t('auth.enterNewPasswordPlaceholder')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">{t('common.confirmPassword')}</Label>
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('auth.confirmNewPasswordPlaceholder')}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading || !session}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t('auth.updatingDotted')}
                                    </>
                                ) : (
                                    t('auth.updatePassword')
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
