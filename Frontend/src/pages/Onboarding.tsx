import AnimatedLogoIcon from "@/components/AnimatedLogoIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { GCSE_SUBJECTS, STUDY_LEVELS, YEAR_GROUPS } from "@/lib/onboarding";
import { cn } from "@/lib/utils";
import { BookOpen, Check, Loader2, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LOADING_MESSAGES = [
  "Loading your study material...",
  "Personalising your dashboard...",
  "Gathering notes and flashcards...",
  "Almost ready...",
];

export default function Onboarding() {
  const { user, supabase } = useAuth();
  const { markOnboardingComplete, refreshOnboardingStatus } = useOnboarding();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [yearGroup, setYearGroup] = useState("");
  const [studyLevel, setStudyLevel] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (!loadingMaterials) return;

    const interval = window.setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % LOADING_MESSAGES.length);
    }, 1200);

    return () => window.clearInterval(interval);
  }, [loadingMaterials]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((current) =>
      current.includes(subject)
        ? current.filter((item) => item !== subject)
        : [...current, subject]
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!yearGroup) {
      setError("Please select your year group.");
      return;
    }

    if (!studyLevel) {
      setError("Please select your study level.");
      return;
    }

    if (selectedSubjects.length === 0) {
      setError("Please select at least one subject.");
      return;
    }

    if (!user) return;

    setSubmitting(true);

    try {
      const profilePayload = {
        id: user.id,
        email: user.email,
        full_name: fullName.trim(),
        year_group: yearGroup,
        study_level: studyLevel,
        subjects: selectedSubjects.join(", "),
        onboarding_completed: true,
      };

      const { error: upsertError } = await supabase.from("profiles").upsert(profilePayload);

      if (upsertError) {
        const fallbackPayload = {
          id: user.id,
          email: user.email,
          full_name: fullName.trim(),
          year_group: yearGroup,
          study_level: studyLevel,
          subjects: selectedSubjects.join(", "),
        };

        const { error: fallbackError } = await supabase.from("profiles").upsert(fallbackPayload);
        if (fallbackError) {
          throw fallbackError;
        }
      }

      await refreshOnboardingStatus();
      markOnboardingComplete();
      setLoadingMaterials(true);

      window.setTimeout(() => {
        navigate("/", { replace: true });
      }, 3200);
    } catch (submitError: any) {
      console.error("Onboarding save failed:", submitError);
      setError(submitError.message || "Failed to save your profile. Please try again.");
      setSubmitting(false);
    }
  };

  if (loadingMaterials) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-6">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in duration-500">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <BookOpen className="h-10 w-10 text-primary animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground">
              {LOADING_MESSAGES[loadingMessageIndex]}
            </h1>
            <p className="text-sm text-muted-foreground">
              We&apos;re tailoring Revizely.ai for {fullName.split(" ")[0] || "you"}.
            </p>
          </div>

          <div className="flex justify-center gap-2">
            {LOADING_MESSAGES.map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === loadingMessageIndex ? "bg-primary w-6" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <AnimatedLogoIcon />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            Welcome to Revizely.ai
          </div>
          <h1 className="text-3xl font-bold text-foreground">Let&apos;s set up your study space</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Tell us a bit about yourself so we can personalise your dashboard and study materials.
          </p>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle>Your details</CardTitle>
            <CardDescription>This only takes a minute.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Your name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="e.g. Alex Smith"
                  disabled={submitting}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Year group</Label>
                  <Select value={yearGroup} onValueChange={setYearGroup} disabled={submitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEAR_GROUPS.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Study level</Label>
                  <Select value={studyLevel} onValueChange={setStudyLevel} disabled={submitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select study level" />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label>Subjects you study</Label>
                  <span className="text-xs text-muted-foreground">
                    {selectedSubjects.length} selected
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {GCSE_SUBJECTS.map((subject) => {
                    const selected = selectedSubjects.includes(subject);
                    return (
                      <button
                        key={subject}
                        type="button"
                        disabled={submitting}
                        onClick={() => toggleSubject(subject)}
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                          selected
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        <span>{subject}</span>
                        {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving your profile...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
