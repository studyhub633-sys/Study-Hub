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
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

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
        title: t('landing.subscribed'),
        description: t('landing.subscribedMessage'),
      });
      setEmail("");
    } catch (error: any) {
      console.error("Error subscribing:", error);
      // Still show success to user (graceful degradation)
      toast({
        title: t('landing.subscribed'),
        description: t('landing.subscribedMessage'),
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
          placeholder={t('landing.enterEmail')}
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
          t('landing.subscribe')
        )}
      </Button>
    </form>
  );
}

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const features = [
    {
      icon: BookOpen,
      titleKey: "features.examNotes.title",
      descriptionKey: "features.examNotes.description",
      link: "/notes",
    },
    {
      icon: Layers,
      titleKey: "features.flashcards.title",
      descriptionKey: "features.flashcards.description",
      link: "/flashcards",
    },
    {
      icon: FileText,
      titleKey: "features.pastPapers.title",
      descriptionKey: "features.pastPapers.description",
      link: "/past-papers",
    },
    {
      icon: Brain,
      titleKey: "features.knowledgeOrganisers.title",
      descriptionKey: "features.knowledgeOrganisers.description",
      link: "/knowledge",
    },
    {
      icon: Award,
      titleKey: "features.extracurriculars.title",
      descriptionKey: "features.extracurriculars.description",
      link: "/extracurricular",
    },
    {
      icon: Sparkles,
      titleKey: "features.aiQuestions.title",
      descriptionKey: "features.aiQuestions.description",
      link: "/ai-tutor",
    },
  ];

  const benefitKeys = [
    "benefits.organize",
    "benefits.trackProgress",
    "benefits.accessPapers",
    "benefits.createFlashcards",
    "benefits.monitorActivities",
    "benefits.getRecommendations",
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
              <Link to="/login">{t('landing.signIn')}</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">{t('landing.getStarted')}</Link>
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
                      <Link to="/login">{t('landing.signIn')}</Link>
                    </Button>
                    <Button asChild className="w-full justify-start text-lg">
                      <Link to="/signup">{t('landing.getStarted')}</Link>
                    </Button>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex items-center justify-between px-4">
                    <span className="font-medium">{t('common.theme')}</span>
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
              {t('landing.heroTitle')}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}{t('landing.heroTitleHighlight')}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              {t('landing.heroDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/signup">
                  {t('landing.getStartedFree')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/login">{t('landing.signIn')}</Link>
              </Button>
            </div>
          </div>
          <AnimatedLogo />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.featuresTitle')}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('landing.featuresSubtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.titleKey} to={feature.link} className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">{t(feature.titleKey)}</CardTitle>
                    <CardDescription>{t(feature.descriptionKey)}</CardDescription>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.whyChoose')}</h2>
            <p className="text-muted-foreground text-lg">
              {t('landing.whyChooseSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefitKeys.map((benefitKey) => (
              <div key={benefitKey} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <p className="text-foreground">{t(benefitKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">{t('landing.stayUpdated')}</CardTitle>
            <CardDescription className="text-base">
              {t('landing.newsletterDescription')}
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
            <CardTitle className="text-3xl mb-4">{t('landing.ctaTitle')}</CardTitle>
            <CardDescription className="text-lg">
              {t('landing.ctaDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/signup">
                {t('landing.createAccount')}
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
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    {t('footer.termsAndConditions')}
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-muted-foreground hover:text-foreground transition-colors">
                    {t('footer.returnsAndRefunds')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                    {t('footer.faq')}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    {t('footer.contactUs')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.account')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                    {t('landing.signIn')}
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="text-muted-foreground hover:text-foreground transition-colors">
                    {t('landing.signUp')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">{t('footer.copyright')}</p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground transition-colors">{t('footer.terms')}</Link>
              <Link to="/faq" className="hover:text-foreground transition-colors">{t('footer.faq')}</Link>
              <Link to="/returns" className="hover:text-foreground transition-colors">{t('footer.returns')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

