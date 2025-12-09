import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  Search,
  Brain,
  ChevronDown,
  Download,
  Share2,
  BookOpen,
  Lightbulb,
  Target,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KnowledgeSection {
  title: string;
  content: string;
  keyPoints: string[];
  color: string;
}

interface KnowledgeOrganizer {
  id: string;
  title: string;
  subject: string;
  topic: string;
  sections: KnowledgeSection[];
  lastUpdated: string;
  progress: number;
}

const mockOrganizers: KnowledgeOrganizer[] = [
  {
    id: "1",
    title: "Cell Biology Overview",
    subject: "Biology",
    topic: "Cell Biology",
    lastUpdated: "2 days ago",
    progress: 75,
    sections: [
      {
        title: "Cell Structure",
        content: "Cells are the basic structural and functional units of all living organisms. They contain various organelles that perform specific functions.",
        keyPoints: ["Prokaryotic vs Eukaryotic cells", "Cell membrane structure", "Nucleus and DNA"],
        color: "primary",
      },
      {
        title: "Cell Organelles",
        content: "Organelles are specialized structures within cells that perform specific functions.",
        keyPoints: ["Mitochondria - energy production", "Ribosomes - protein synthesis", "ER and Golgi - processing"],
        color: "secondary",
      },
      {
        title: "Cell Division",
        content: "Cells divide through mitosis (for growth) and meiosis (for reproduction).",
        keyPoints: ["Mitosis stages", "Meiosis and genetic variation", "Cell cycle regulation"],
        color: "accent",
      },
    ],
  },
  {
    id: "2",
    title: "Newton's Laws of Motion",
    subject: "Physics",
    topic: "Mechanics",
    lastUpdated: "1 week ago",
    progress: 60,
    sections: [
      {
        title: "First Law - Inertia",
        content: "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.",
        keyPoints: ["Definition of inertia", "Examples in daily life", "Reference frames"],
        color: "primary",
      },
      {
        title: "Second Law - F=ma",
        content: "Force equals mass times acceleration. The greater the force, the greater the acceleration.",
        keyPoints: ["Formula derivation", "Units and measurements", "Free body diagrams"],
        color: "secondary",
      },
      {
        title: "Third Law - Action-Reaction",
        content: "For every action, there is an equal and opposite reaction.",
        keyPoints: ["Force pairs", "Examples", "Common misconceptions"],
        color: "accent",
      },
    ],
  },
  {
    id: "3",
    title: "Chemical Bonding",
    subject: "Chemistry",
    topic: "Bonding",
    lastUpdated: "3 days ago",
    progress: 90,
    sections: [
      {
        title: "Ionic Bonds",
        content: "Formed between metals and non-metals through the transfer of electrons.",
        keyPoints: ["Electron transfer", "Crystal lattice structure", "Properties of ionic compounds"],
        color: "primary",
      },
      {
        title: "Covalent Bonds",
        content: "Formed between non-metals through the sharing of electrons.",
        keyPoints: ["Electron sharing", "Single, double, triple bonds", "Molecular shapes"],
        color: "secondary",
      },
    ],
  },
];

const subjects = ["All Subjects", "Biology", "Physics", "Chemistry", "Mathematics"];

export default function Knowledge() {
  const [organizers] = useState<KnowledgeOrganizer[]>(mockOrganizers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedOrganizer, setSelectedOrganizer] = useState<KnowledgeOrganizer | null>(mockOrganizers[0]);
  const [openSections, setOpenSections] = useState<string[]>(["Cell Structure"]);

  const filteredOrganizers = organizers.filter((org) => {
    const matchesSearch = org.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All Subjects" || org.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Knowledge Organizers</h1>
            <p className="text-muted-foreground mt-1">Visual summaries to consolidate your learning</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Organizer
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Organizers List */}
          <div className="lg:col-span-1 space-y-3 animate-slide-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            {filteredOrganizers.map((org) => (
              <button
                key={org.id}
                onClick={() => setSelectedOrganizer(org)}
                className={cn(
                  "w-full text-left p-4 rounded-xl transition-all duration-200",
                  selectedOrganizer?.id === org.id
                    ? "glass-card border-primary/30 shadow-glow"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{org.title}</h3>
                    <p className="text-sm text-muted-foreground">{org.subject} • {org.topic}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${org.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{org.progress}%</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Organizer Detail */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
            {selectedOrganizer ? (
              <div className="glass-card p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {selectedOrganizer.subject}
                      </span>
                      <span className="text-xs text-muted-foreground">{selectedOrganizer.topic}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                      {selectedOrganizer.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Last updated {selectedOrganizer.lastUpdated}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                  {selectedOrganizer.sections.map((section, index) => (
                    <Collapsible
                      key={section.title}
                      open={openSections.includes(section.title)}
                      onOpenChange={() => toggleSection(section.title)}
                    >
                      <CollapsibleTrigger className="w-full">
                        <div className={cn(
                          "flex items-center justify-between p-4 rounded-xl transition-all duration-200",
                          section.color === "primary" && "bg-primary/10 hover:bg-primary/15",
                          section.color === "secondary" && "bg-secondary/10 hover:bg-secondary/15",
                          section.color === "accent" && "bg-accent/20 hover:bg-accent/25"
                        )}>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                              section.color === "primary" && "bg-primary text-primary-foreground",
                              section.color === "secondary" && "bg-secondary text-secondary-foreground",
                              section.color === "accent" && "bg-accent text-accent-foreground"
                            )}>
                              {index + 1}
                            </div>
                            <span className="font-semibold text-foreground">{section.title}</span>
                          </div>
                          <ChevronDown className={cn(
                            "h-5 w-5 text-muted-foreground transition-transform duration-200",
                            openSections.includes(section.title) && "rotate-180"
                          )} />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 pt-2 ml-11 space-y-4">
                          <p className="text-foreground">{section.content}</p>
                          
                          <div className={cn(
                            "p-4 rounded-lg",
                            section.color === "primary" && "bg-primary/5 border border-primary/20",
                            section.color === "secondary" && "bg-secondary/5 border border-secondary/20",
                            section.color === "accent" && "bg-accent/10 border border-accent/20"
                          )}>
                            <div className="flex items-center gap-2 mb-3">
                              <Lightbulb className={cn(
                                "h-4 w-4",
                                section.color === "primary" && "text-primary",
                                section.color === "secondary" && "text-secondary",
                                section.color === "accent" && "text-accent-foreground"
                              )} />
                              <span className="text-sm font-semibold text-foreground">Key Points</span>
                            </div>
                            <ul className="space-y-2">
                              {section.keyPoints.map((point, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                  <CheckCircle className={cn(
                                    "h-4 w-4 mt-0.5 flex-shrink-0",
                                    section.color === "primary" && "text-primary",
                                    section.color === "secondary" && "text-secondary",
                                    section.color === "accent" && "text-accent-foreground"
                                  )} />
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
                  <Button className="flex-1">
                    <Target className="h-4 w-4 mr-2" />
                    Test Your Knowledge
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Create Flashcards
                  </Button>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Brain className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select an organizer</h3>
                <p className="text-muted-foreground">
                  Choose a knowledge organizer to view its contents
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
