import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserCheck, ShieldClose } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? window.location.origin : "http://localhost:3001");

export default function CreatorSetup() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState("");
  const [commissionRate, setCommissionRate] = useState(0.2);
  
  const [password, setPassword] = useState("");
  const [creatorCode, setCreatorCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No invite token provided. Please use the link sent to your email.");
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/creators/verify-token?token=${token}`);
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || "Invalid or expired invite token.");
          return;
        }

        setEmail(data.email);
        setCommissionRate(data.commission_rate);
      } catch (err) {
        console.error(err);
        setError("Network error while verifying token.");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !creatorCode || !fullName) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/creators/complete-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          creator_code: creatorCode,
          full_name: fullName
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        const errorMessage = data.details ? `${data.error} (${data.details})` : (data.error || "Failed to setup creator account.");
        toast.error(errorMessage);
        console.error("Setup Error Details:", data);
        return;
      }

      toast.success("Account created! You can now log in.");
      navigate("/creator-login");
      
    } catch (err) {
      console.error(err);
      toast.error("Network error while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto mt-12 glass-card p-8 text-center space-y-4">
          <ShieldClose className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate("/")} variant="outline" className="mt-4">
            Return to Home
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-md mx-auto mt-12 glass-card p-8">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-premium/10 text-premium mb-4">
            <UserCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Creator Setup</h1>
          <p className="text-muted-foreground mt-2">
            Complete your profile to activate your {commissionRate * 100}% commission creator account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address (Locked)</label>
            <Input 
              type="email" 
              value={email} 
              disabled 
              className="bg-secondary/20 font-medium text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input 
              type="text" 
              placeholder="E.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Desired Creator Code</label>
            <Input 
              type="text" 
              placeholder="E.g. JOSH20"
              value={creatorCode}
              onChange={(e) => setCreatorCode(e.target.value.toUpperCase())}
              className="uppercase font-mono"
              required
            />
            <p className="text-xs text-muted-foreground">This is the code users will enter to get 20% off, tracking your referral commission.</p>
          </div>

          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium">Set a Password</label>
            <Input 
              type="password" 
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Complete Setup & Login
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
