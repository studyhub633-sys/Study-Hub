import AnimatedLogoIcon from "@/components/AnimatedLogoIcon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { ArrowLeft, HelpCircle, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

export const faqs = [
  {
    question: "What is Study Spark Hub?",
    answer: "Study Spark Hub is an all-in-one study companion platform that helps students organize notes, create flashcards, practice with past papers, and track their academic progress. It's designed to make studying more efficient and effective.",
  },
  {
    question: "Where do the past papers come from?",
    answer: "All past papers are accessed via direct links to verified third-party educational repositories like Physics & Maths Tutor (PMT). Study Spark Hub acts as a search engine and organizer—we do not host, store, or modify any exam content ourselves. All papers open in a new tab on the original source website, ensuring full compliance with copyright and 'no framing' policies.",
  },
  {
    question: "Is Study Spark Hub free?",
    answer: "Yes! Study Spark Hub offers a free plan with access to basic features including notes, flashcards, and past papers. We also offer a Premium plan with advanced features like AI-powered tutoring and advanced analytics.",
  },
  {
    question: "How do I create notes?",
    answer: "Navigate to the Notes page from your dashboard. Click the 'Add Note' button to create a new note. You can organize notes by subject and topic, add tags, and highlight key points.",
  },
  {
    question: "Can I use flashcards offline?",
    answer: "Currently, Study Spark Hub requires an internet connection to sync your flashcards across devices. However, we're working on offline support for future updates.",
  },
  {
    question: "What subjects are supported?",
    answer: "Study Spark Hub supports all subjects! You can create notes, flashcards, and organize materials for any subject you're studying. Popular subjects include Biology, Chemistry, Physics, Mathematics, and more.",
  },
  {
    question: "How does the AI tutoring feature work?",
    answer: "Our AI tutoring bot uses advanced language models to help you study. You can ask questions about your notes, get explanations of concepts, and receive personalized study recommendations based on your progress.",
  },
  {
    question: "Can I share my notes with classmates?",
    answer: "Currently, notes are private to your account. We're exploring sharing features for future releases. Stay tuned!",
  },
  {
    question: "How do I cancel my Premium subscription?",
    answer: "You can manage your subscription in the Settings page. Navigate to Settings → Subscription to view and cancel your Premium subscription at any time.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes! We use industry-standard encryption and security practices to protect your data. All data is stored securely and we never share your information with third parties.",
  },
  {
    question: "How do I delete my account?",
    answer: "You can delete your account from the Settings page. Navigate to Settings → Privacy and click the 'Delete Account' button. Please note that this action is permanent and cannot be undone.",
  },
  {
    question: "Does Study Spark Hub comply with copyright laws for Past Papers?",
    answer: "Absolutely. We do not host any copyrighted exam material on our servers. Instead, we provide a curated directory of direct links to the official download servers of exam boards and verified educational repositories like PMT. Our platform acts as a reference tool, ensuring that you always access the original files from their legal sources while staying compliant with intellectual property regulations.",
  },
];

export default function FAQ() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AnimatedLogoIcon />
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

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Link to="/landing">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Frequently Asked Questions
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions about Study Spark Hub
          </p>
        </div>

        <div className="space-y-4 animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="glass-card px-6 mb-4">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="glass-card p-6 text-center animate-slide-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
          <h3 className="text-lg font-semibold text-foreground mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-4">
            Can't find the answer you're looking for? Please contact our support team.
          </p>
          <Link
            to="/contact"
            className="text-primary hover:underline font-medium"
          >
            Contact Support →
          </Link>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="border-t border-border bg-background/80 backdrop-blur-xl mt-12">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">© 2025 Study Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

