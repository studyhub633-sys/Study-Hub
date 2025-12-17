import { AppLayout } from "@/components/layout/AppLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is Study Spark Hub?",
    answer: "Study Spark Hub is an all-in-one study companion platform that helps students organize notes, create flashcards, practice with past papers, and track their academic progress. It's designed to make studying more efficient and effective.",
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
];

export default function FAQ() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
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
          <a
            href="/contact"
            className="text-primary hover:underline font-medium"
          >
            Contact Support →
          </a>
        </div>
      </div>
    </AppLayout>
  );
}





