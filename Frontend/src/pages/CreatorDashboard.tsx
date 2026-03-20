import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ClipboardCopy,
  DollarSign,
  Loader2,
  LogOut,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Creator {
  id: string;
  user_id: string;
  code: string;
  commission_rate: number;
  created_at: string;
}

interface Referral {
  id: string;
  creator_id: string;
  referred_user_id: string;
  amount_paid: number;
  commission: number;
  created_at: string;
}

export default function CreatorDashboard() {
  const { supabase, user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [creator, setCreator] = useState<Creator | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/creator-login");
      return;
    }
    loadCreatorData();
  }, [user]);

  const loadCreatorData = async () => {
    if (!user || !supabase) return;
    setLoading(true);

    try {
      // Get creator profile
      const { data: creatorData, error: creatorError } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (creatorError || !creatorData) {
        navigate("/creator-login");
        return;
      }

      setCreator(creatorData);

      // Get referrals
      const { data: referralData } = await supabase
        .from("creator_referrals")
        .select("*")
        .eq("creator_id", creatorData.id)
        .order("created_at", { ascending: false });

      setReferrals(referralData || []);
    } catch (error) {
      console.error("Error loading creator data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (!creator) return;
    navigator.clipboard.writeText(creator.code);
    toast({ title: "Copied!", description: `Creator code "${creator.code}" copied to clipboard.` });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/creator-login");
  };

  const totalReferrals = referrals.length;
  const totalCommission = referrals.reduce((sum, r) => sum + (r.commission || 0), 0);
  const totalRevenue = referrals.reduce((sum, r) => sum + (r.amount_paid || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950/10 via-background to-blue-950/10">
      {/* Top Bar */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Creator Dashboard</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-1">
              <ArrowLeft className="w-3 h-3" />
              Main App
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1 text-muted-foreground">
              <LogOut className="w-3 h-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Creator Code Card */}
        <Card className="border-2 border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm text-muted-foreground font-medium mb-1">Your Creator Code</p>
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <span className="text-3xl font-mono font-extrabold tracking-widest text-violet-500">
                    {creator?.code || "—"}
                  </span>
                  <Button size="icon" variant="outline" onClick={copyCode} title="Copy code" className="h-9 w-9">
                    <ClipboardCopy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Share this code with your audience. They get 20% off premium, you earn £5 per signup.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                <p className="text-xs text-muted-foreground text-center mb-1">Commission Rate</p>
                <p className="text-2xl font-bold text-violet-500 text-center">
                  {((creator?.commission_rate || 0.2) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalReferrals}</p>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">£{totalCommission.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Commission Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">£{totalRevenue.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Revenue Generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referrals Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Referral History</CardTitle>
            <CardDescription>All users who signed up with your creator code</CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No referrals yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Share your code to start earning commission!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-3 px-2 font-medium">#</th>
                      <th className="text-left py-3 px-2 font-medium">User</th>
                      <th className="text-left py-3 px-2 font-medium">Date</th>
                      <th className="text-right py-3 px-2 font-medium">Amount Paid</th>
                      <th className="text-right py-3 px-2 font-medium">Your Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((ref, i) => (
                      <tr key={ref.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-2 text-muted-foreground">{i + 1}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-xs">U{i + 1}</AvatarFallback>
                            </Avatar>
                            <span className="text-muted-foreground text-xs">
                              User #{ref.referred_user_id.slice(0, 8)}...
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {new Date(ref.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2 text-right font-medium">
                          £{(ref.amount_paid || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
                            +£{(ref.commission || 0).toFixed(2)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
