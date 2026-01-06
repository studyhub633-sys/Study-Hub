import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { hasPremium } from "@/lib/premium";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Crown,
  ExternalLink,
  Loader2,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface WorkExperience {
  id: string;
  title: string;
  company: string | null;
  description: string;
  location: string | null;
  duration: string | null;
  application_url: string | null;
  application_deadline: string | null;
  requirements: string[] | null;
  benefits: string[] | null;
  is_active: boolean;
  created_at: string;
}

export default function WorkExperience() {
  const { supabase, user } = useAuth();
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);
  const [opportunities, setOpportunities] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
      fetchOpportunities();
    }
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user || !supabase) return;
    try {
      const premium = await hasPremium(supabase);
      setIsPremium(premium);
      if (!premium) {
        toast.error("This is a premium feature. Please upgrade to access.");
        navigate("/premium");
      }
    } catch (error) {
      console.error("Error checking premium status:", error);
    } finally {
      setCheckingPremium(false);
    }
  };

  const fetchOpportunities = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("premium_work_experience")
        .select("*")
        .eq("is_premium", true)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error: any) {
      console.error("Error fetching work experience opportunities:", error);
      toast.error("Failed to load work experience opportunities.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOpportunities = () => {
    return opportunities.filter((opp) => {
      const matchesSearch =
        !searchQuery ||
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  };

  const isDeadlinePassed = (deadline: string | null) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    return new Date(deadline).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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
          <p className="text-muted-foreground">
            This feature is available for premium members only.
          </p>
          <Button onClick={() => navigate("/premium")}>
            Upgrade to Premium
          </Button>
        </div>
      </AppLayout>
    );
  }

  const filteredOpportunities = getFilteredOpportunities();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-premium/10">
              <Users className="h-6 w-6 text-premium" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Scientia.ai Work Experience
              </h1>
              <p className="text-muted-foreground">
                Exclusive work experience opportunities for premium members
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="glass-card p-4 mb-6 animate-slide-up">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities by title, company, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Opportunities List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <Card className="p-12 text-center">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {opportunities.length === 0
                ? "No Work Experience Opportunities Available Yet"
                : "No Opportunities Match Your Search"}
            </h3>
            <p className="text-muted-foreground">
              {opportunities.length === 0
                ? "Check back soon for exclusive work experience opportunities!"
                : "Try adjusting your search criteria."}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOpportunities.map((opp) => {
              const deadlinePassed = isDeadlinePassed(opp.application_deadline);
              const formattedDeadline = formatDeadline(opp.application_deadline);

              return (
                <Card
                  key={opp.id}
                  className={cn(
                    "hover-lift transition-all",
                    deadlinePassed && "opacity-60"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{opp.title}</CardTitle>
                        {opp.company && (
                          <CardDescription className="text-base font-medium text-foreground mb-1">
                            {opp.company}
                          </CardDescription>
                        )}
                      </div>
                      {deadlinePassed && (
                        <Badge variant="destructive">Deadline Passed</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {opp.location && (
                        <Badge variant="outline" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {opp.location}
                        </Badge>
                      )}
                      {opp.duration && (
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          {opp.duration}
                        </Badge>
                      )}
                      {formattedDeadline && !deadlinePassed && (
                        <Badge variant="secondary" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          Deadline: {formattedDeadline}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {opp.description}
                    </p>

                    {opp.requirements && opp.requirements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-foreground mb-2">
                          Requirements:
                        </h4>
                        <ul className="space-y-1">
                          {opp.requirements.map((req, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4 text-premium mt-0.5 flex-shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {opp.benefits && opp.benefits.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-foreground mb-2">
                          Benefits:
                        </h4>
                        <ul className="space-y-1">
                          {opp.benefits.map((benefit, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4 text-premium mt-0.5 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {opp.application_url && (
                      <Button
                        variant="default"
                        className="w-full sm:w-auto bg-premium hover:bg-premium/90"
                        onClick={() => window.open(opp.application_url!, "_blank")}
                        disabled={deadlinePassed}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {deadlinePassed
                          ? "Application Closed"
                          : "Apply Now"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        {opportunities.length > 0 && (
          <Card className="mt-8 bg-premium/5 border-premium/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-premium mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Exclusive Premium Opportunities
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    These work experience opportunities are exclusively available
                    to premium members. They are carefully selected to provide
                    valuable experience and help you build your career.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

