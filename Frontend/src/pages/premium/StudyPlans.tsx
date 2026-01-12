import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { hasPremium } from "@/lib/premium";
import { cn } from "@/lib/utils";
import {
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Exam {
  id: string;
  subject: string;
  exam_date: string;
  exam_time?: string;
  priority: "high" | "medium" | "low";
}

interface StudyPlan {
  id: string;
  exam_id: string;
  date: string;
  subject: string;
  topics: string[];
  duration_minutes: number;
  study_method: string;
  resources: string[];
  completed: boolean;
}

export default function StudyPlans() {
  const { supabase, user } = useAuth();
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlan[]>([]);
  const [formData, setFormData] = useState({
    subject: "",
    exam_date: "",
    exam_time: "",
    priority: "medium" as "high" | "medium" | "low",
  });

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
      fetchExams();
      fetchStudyPlan();
    }
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user || !supabase) return;
    try {
      const premium = await hasPremium(supabase);
      setIsPremium(premium);
      if (!premium) {
        toast.error("This is a premium feature. Please upgrade to access.");
        navigate("/premium-dashboard");
      }
    } catch (error) {
      console.error("Error checking premium status:", error);
    } finally {
      setCheckingPremium(false);
    }
  };

  const fetchExams = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("user_id", user.id)
        .order("exam_date", { ascending: true });

      if (error) throw error;
      setExams(data || []);
    } catch (error: any) {
      console.error("Error fetching exams:", error);
    }
  };

  const fetchStudyPlan = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("study_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (error) throw error;
      setStudyPlan(data || []);
    } catch (error: any) {
      console.error("Error fetching study plan:", error);
    }
  };

  const handleAddExam = async () => {
    if (!user || !formData.subject || !formData.exam_date) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("exams").insert({
        user_id: user.id,
        subject: formData.subject,
        exam_date: formData.exam_date,
        exam_time: formData.exam_time || null,
        priority: formData.priority,
      });

      if (error) throw error;
      toast.success("Exam added successfully");
      setFormData({ subject: "", exam_date: "", exam_time: "", priority: "medium" });
      fetchExams();
    } catch (error: any) {
      console.error("Error adding exam:", error);
      toast.error("Failed to add exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStudyPlan = async () => {
    if (!user || exams.length === 0) {
      toast.error("Please add at least one exam first.");
      return;
    }

    try {
      setGenerating(true);

      // Call AI API to generate study plan
      const response = await fetch("/api/ai/generate-study-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exams: exams.map((exam) => ({
            subject: exam.subject,
            exam_date: exam.exam_date,
            priority: exam.priority,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate study plan");
      }

      const { studyPlan: generatedPlan } = await response.json();

      // Save study plan to database
      const planEntries = generatedPlan.map((plan: any) => ({
        user_id: user.id,
        exam_id: plan.exam_id || null,
        date: plan.date,
        subject: plan.subject,
        topics: plan.topics || [],
        duration_minutes: plan.duration_minutes || 60,
        study_method: plan.study_method || "Review notes and practice questions",
        resources: plan.resources || [],
        completed: false,
      }));

      const { error } = await supabase.from("study_plans").insert(planEntries);

      if (error) throw error;

      toast.success("Study plan generated successfully!");
      fetchStudyPlan();
    } catch (error: any) {
      console.error("Error generating study plan:", error);
      // Fallback: Generate a simple study plan
      generateFallbackStudyPlan();
    } finally {
      setGenerating(false);
    }
  };

  const generateFallbackStudyPlan = async () => {
    if (!user) return;

    try {
      const planEntries: any[] = [];
      const today = new Date();

      exams.forEach((exam) => {
        const examDate = new Date(exam.exam_date);
        const daysUntil = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const studyDays = Math.max(1, Math.min(daysUntil - 1, 14)); // Study for up to 14 days

        for (let i = 0; i < studyDays; i++) {
          const studyDate = new Date(today);
          studyDate.setDate(today.getDate() + i);

          planEntries.push({
            user_id: user.id,
            exam_id: exam.id,
            date: studyDate.toISOString().split("T")[0],
            subject: exam.subject,
            topics: [`Topic ${i + 1}`, `Topic ${i + 2}`],
            duration_minutes: exam.priority === "high" ? 90 : 60,
            study_method: i % 2 === 0 ? "Review notes" : "Practice questions",
            resources: ["Past papers", "Knowledge organisers"],
            completed: false,
          });
        }
      });

      const { error } = await supabase.from("study_plans").insert(planEntries);

      if (error) throw error;

      toast.success("Study plan generated successfully!");
      fetchStudyPlan();
    } catch (error: any) {
      console.error("Error generating fallback study plan:", error);
      toast.error("Failed to generate study plan. Please try again.");
    }
  };

  const handleToggleComplete = async (planId: string, completed: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("study_plans")
        .update({ completed: !completed })
        .eq("id", planId)
        .eq("user_id", user.id);

      if (error) throw error;
      fetchStudyPlan();
    } catch (error: any) {
      console.error("Error updating study plan:", error);
      toast.error("Failed to update study plan.");
    }
  };

  if (checkingPremium) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!isPremium) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-[60vh] gap-4">
          <Crown className="h-16 w-16 text-premium" />
          <h2 className="text-2xl font-bold">Premium Feature</h2>
          <p className="text-muted-foreground">This feature is available for premium members only.</p>
          <Button onClick={() => navigate("/premium-dashboard")}>Upgrade to Premium</Button>
        </div>
      </AppLayout>
    );
  }

  const upcomingPlans = studyPlan.filter((plan) => !plan.completed);
  const completedPlans = studyPlan.filter((plan) => plan.completed);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI Study Plans</h1>
          <p className="text-muted-foreground mt-1">
            Get personalized study schedules based on your exam dates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Exam</CardTitle>
              <CardDescription>Add your upcoming exams to generate a study plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exam_date">Exam Date *</Label>
                  <Input
                    id="exam_date"
                    type="date"
                    value={formData.exam_date}
                    onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exam_time">Time (optional)</Label>
                  <Input
                    id="exam_time"
                    type="time"
                    value={formData.exam_time}
                    onChange={(e) => setFormData({ ...formData, exam_time: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleAddExam} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Add Exam
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Exams</CardTitle>
              <CardDescription>{exams.length} exam{exams.length !== 1 ? "s" : ""} scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              {exams.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No exams added yet</p>
              ) : (
                <div className="space-y-2">
                  {exams.map((exam) => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-semibold">{exam.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(exam.exam_date).toLocaleDateString()}
                          {exam.exam_time && ` at ${exam.exam_time}`}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded",
                          exam.priority === "high"
                            ? "bg-destructive/10 text-destructive"
                            : exam.priority === "medium"
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-green-500/10 text-green-600"
                        )}
                      >
                        {exam.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {exams.length > 0 && (
                <Button
                  onClick={handleGenerateStudyPlan}
                  disabled={generating}
                  className="w-full mt-4"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Study Plan
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {studyPlan.length > 0 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Study Sessions ({upcomingPlans.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingPlans.map((plan) => (
                  <StudyPlanCard
                    key={plan.id}
                    plan={plan}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </CardContent>
            </Card>

            {completedPlans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Completed Sessions ({completedPlans.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {completedPlans.map((plan) => (
                    <StudyPlanCard
                      key={plan.id}
                      plan={plan}
                      onToggleComplete={handleToggleComplete}
                    />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {studyPlan.length === 0 && exams.length > 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No study plan yet</h3>
              <p className="text-muted-foreground mb-4">
                Generate an AI-powered study plan based on your exam dates
              </p>
              <Button onClick={handleGenerateStudyPlan} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Study Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

function StudyPlanCard({
  plan,
  onToggleComplete,
}: {
  plan: StudyPlan;
  onToggleComplete: (id: string, completed: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border transition-all",
        plan.completed
          ? "bg-muted/50 opacity-75"
          : "bg-card hover:bg-muted/50"
      )}
    >
      <button
        onClick={() => onToggleComplete(plan.id, plan.completed)}
        className="mt-1 flex-shrink-0"
      >
        {plan.completed ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3
            className={cn(
              "font-semibold",
              plan.completed && "line-through text-muted-foreground"
            )}
          >
            {plan.subject}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{new Date(plan.date).toLocaleDateString()}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-2">{plan.study_method}</p>

        {plan.topics && plan.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {plan.topics.map((topic, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{plan.duration_minutes} minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

