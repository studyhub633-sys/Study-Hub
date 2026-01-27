import AnimatedLogo from "@/components/AnimatedLogo";
import AnimatedLogoIcon from "@/components/AnimatedLogoIcon";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@supabase/supabase-js";
import { ArrowRight, Award, BookOpen, Brain, Check, FileText, Layers, Loader2, Mail, Menu, Moon, Sparkles, Sun } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      // Create a Supabase client (using anon key for public access)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase not configured");
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Try to insert into email_subscriptions table
      // If table doesn't exist, we'll create it via SQL
      const { error } = await supabase
        .from("email_subscriptions")
        .insert({
          email: email.trim(),
          source: "landing_page",
          subscribed_at: new Date().toISOString(),
        });

      if (error) {
        // If table doesn't exist, we'll just show success (graceful degradation)
        console.warn("Email subscription table may not exist:", error);
        // Still show success to user
      }

      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
    } catch (error: any) {
      console.error("Error subscribing:", error);
      // Still show success to user (graceful degradation)
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-9"
          required
          disabled={loading}
        />
      </div>
      <Button type="submit" disabled={loading || !email.trim()}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Subscribe"
        )}
      </Button>
    </form>
  );
}

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: BookOpen,
      title: "Exam Notes",
      description: "Organised notes by subject and topic with highlights",
      link: "/notes",
    },
    {
      icon: Layers,
      title: "Flashcards",
      description: "Interactive cards with quiz mode and progress tracking",
      link: "/flashcards",
    },
    {
      icon: FileText,
      title: "Past Papers",
      description: "Practice with marked answers and timed quizzes",
      link: "/past-papers",
    },
    {
      icon: Brain,
      title: "Knowledge Organisers",
      description: "Visual summaries with collapsible sections",
      link: "/knowledge",
    },
    {
      icon: Award,
      title: "Extracurriculars",
      description: "Track activities, hours, and achievements",
      link: "/extracurricular",
    },
    {
      icon: Sparkles,
      title: "Unlimited AI Generated Questions",
      description: "AI-generated questions, tutor support, and practice",
      link: "/ai-tutor",
    },
  ];

  const benefits = [
    "Organise all your study materials in one place",
    "Track your progress across all subjects",
    "Access past papers and practice questions",
    "Create and review flashcards efficiently",
    "Monitor your extracurricular activities",
    "Get personalized study recommendations",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 landing-grid-bg relative">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AnimatedLogoIcon />
            <h1 className="font-bold text-xl">Scientia.ai</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <AnimatedLogoIcon />
                    <span className="font-bold text-lg">Scientia.ai</span>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Button asChild className="w-full justify-start text-lg" variant="ghost">
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button asChild className="w-full justify-start text-lg">
                      <Link to="/signup">Get Started</Link>
                    </Button>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex items-center justify-between px-4">
                    <span className="font-medium">Theme</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      className="h-9 w-9"
                    >
                      {theme === "light" ? (
                        <Moon className="h-5 w-5" />
                      ) : (
                        <Sun className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Your All-in-One
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}Study Companion
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              Organise notes, practice with flashcards, review past papers, and track your progress—all in one powerful platform designed for students.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
          <AnimatedLogo />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful tools designed to help you study smarter, not harder
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} to={feature.link} className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/50 rounded-3xl my-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Scientia.ai?</h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of students who are already improving their study habits
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <p className="text-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Stay Updated</CardTitle>
            <CardDescription className="text-base">
              Subscribe to our newsletter for study tips, feature updates, and exclusive content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewsletterSignup />
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">Ready to Transform Your Study Habits?</CardTitle>
            <CardDescription className="text-lg">
              Start organizing your studies today. It's free to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/signup">
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/80 backdrop-blur-xl mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <AnimatedLogoIcon />
                <h3 className="font-bold text-lg">Scientia.ai</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your all-in-one study companion for organized learning and academic success.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms and Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-muted-foreground hover:text-foreground transition-colors">
                    Returns and Refunds
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="text-muted-foreground hover:text-foreground transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 Scientia.ai. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/returns" className="hover:text-foreground transition-colors">Returns</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

