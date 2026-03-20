import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreatorLogin() {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingCreator, setCheckingCreator] = useState(true);

  // If already logged in, check if user is a creator
  useEffect(() => {
    const checkCreator = async () => {
      if (!user || !supabase) {
        setCheckingCreator(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("creators")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) {
          navigate("/creator-dashboard");
        }
      } catch {
        // Table might not exist yet
      } finally {
        setCheckingCreator(false);
      }
    };
    checkCreator();
  }, [user, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      // Check if this user is a creator
      const { data: creator, error: creatorError } = await supabase
        .from("creators")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (creatorError) {
        if (creatorError.code === "42P01") {
          toast({
            title: "Setup Required",
            description: "The creators table needs to be created. Run the migration SQL first.",
            variant: "destructive",
          });
        } else {
          throw creatorError;
        }
        return;
      }

      if (!creator) {
        toast({
          title: "Not a Creator",
          description: "This account is not registered as a creator. Contact support.",
          variant: "destructive",
        });
        return;
      }

      navigate("/creator-dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-950/20 via-background to-blue-950/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-white mb-2">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Creator Portal</h1>
          <p className="text-muted-foreground">Sign in to track your referrals and commission</p>
        </div>

        {/* Login Card */}
        <Card className="border-2 border-violet-500/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Creator Sign In
            </CardTitle>
            <CardDescription>
              Use your registered creator email and password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="creator@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Not a creator? <a href="/" className="text-violet-500 hover:underline">Go to main app</a>
        </p>
      </div>
    </div>
  );
}
