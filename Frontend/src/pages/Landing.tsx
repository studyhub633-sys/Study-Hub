import AnimatedLogo from "@/components/AnimatedLogo";
import AnimatedLogoIcon from "@/components/AnimatedLogoIcon";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/contexts/ThemeContext";
import { ArrowRight, Award, BookOpen, Brain, Check, FileText, Layers, Menu, Moon, Sparkles, Sun } from "lucide-react";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";



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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between relative">
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
          <div className="md:hidden ml-auto">
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

            {/* 🎉 GCSE Season Promotion */}
            <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-start">
                <span className="text-2xl">🎉</span>
                <div>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Limited Offer: </span>
                  <span className="font-bold text-foreground">£25 for full 2026 GCSE Season access!</span>
                </div>
                <Link to="/premium-dashboard">
                  <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                    Get Premium
                  </Button>
                </Link>
              </div>
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
              <Link key={feature.titleKey} to="/signup" className="block">
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

