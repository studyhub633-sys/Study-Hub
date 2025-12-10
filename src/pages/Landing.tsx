import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { ArrowRight, Award, BookOpen, Brain, Check, FileText, Layers, Moon, Sparkles, Sun } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  
  const features = [
    {
      icon: BookOpen,
      title: "Exam Notes",
      description: "Organized notes by subject and topic with highlights",
    },
    {
      icon: Layers,
      title: "Flashcards",
      description: "Interactive cards with quiz mode and progress tracking",
    },
    {
      icon: FileText,
      title: "Past Papers",
      description: "Practice with marked answers and timed quizzes",
    },
    {
      icon: Brain,
      title: "Knowledge Organizers",
      description: "Visual summaries with collapsible sections",
    },
    {
      icon: Award,
      title: "Extracurriculars",
      description: "Track activities, hours, and achievements",
    },
    {
      icon: Sparkles,
      title: "AI Question Bank",
      description: "AI-generated questions tailored to your subjects",
    },
  ];

  const benefits = [
    "Organize all your study materials in one place",
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">SH</span>
            </div>
            <h1 className="font-bold text-xl">Study Spark Hub</h1>
          </div>
          <div className="flex items-center gap-3">
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Your All-in-One
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {" "}Study Companion
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Organize notes, practice with flashcards, review past papers, and track your progress—all in one powerful platform designed for students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
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
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/50 rounded-3xl my-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Study Spark Hub?</h2>
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">SH</span>
              </div>
              <p className="text-sm text-muted-foreground">© 2024 Study Spark Hub. All rights reserved.</p>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link>
              <Link to="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

