import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  Star,
  ChevronRight,
  Highlighter,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  topic: string;
  keyPoints: string[];
  lastModified: string;
  starred: boolean;
}

interface Subject {
  name: string;
  color: string;
  topics: {
    name: string;
    notes: Note[];
  }[];
}

const mockSubjects: Subject[] = [
  {
    name: "Biology",
    color: "primary",
    topics: [
      {
        name: "Cell Biology",
        notes: [
          {
            id: "1",
            title: "Cell Structure and Function",
            content: "Cells are the basic unit of life. All living organisms are composed of cells...",
            subject: "Biology",
            topic: "Cell Biology",
            keyPoints: ["Prokaryotic vs Eukaryotic", "Cell membrane structure", "Organelles and their functions"],
            lastModified: "2 days ago",
            starred: true,
          },
          {
            id: "2",
            title: "Mitochondria and Cellular Respiration",
            content: "The mitochondria is often called the powerhouse of the cell...",
            subject: "Biology",
            topic: "Cell Biology",
            keyPoints: ["ATP production", "Krebs cycle", "Electron transport chain"],
            lastModified: "1 week ago",
            starred: false,
          },
        ],
      },
      {
        name: "Genetics",
        notes: [
          {
            id: "3",
            title: "DNA Structure and Replication",
            content: "DNA is a double helix structure composed of nucleotides...",
            subject: "Biology",
            topic: "Genetics",
            keyPoints: ["Base pairing rules", "Semi-conservative replication", "DNA polymerase"],
            lastModified: "3 days ago",
            starred: true,
          },
        ],
      },
    ],
  },
  {
    name: "Chemistry",
    color: "secondary",
    topics: [
      {
        name: "Atomic Structure",
        notes: [
          {
            id: "4",
            title: "Atomic Models Through History",
            content: "From Dalton's solid sphere model to the quantum mechanical model...",
            subject: "Chemistry",
            topic: "Atomic Structure",
            keyPoints: ["Dalton's model", "Thomson's plum pudding", "Bohr's model", "Quantum model"],
            lastModified: "5 days ago",
            starred: false,
          },
        ],
      },
      {
        name: "Chemical Bonding",
        notes: [
          {
            id: "5",
            title: "Types of Chemical Bonds",
            content: "Chemical bonds hold atoms together to form molecules...",
            subject: "Chemistry",
            topic: "Chemical Bonding",
            keyPoints: ["Ionic bonds", "Covalent bonds", "Metallic bonds", "Intermolecular forces"],
            lastModified: "Yesterday",
            starred: true,
          },
        ],
      },
    ],
  },
  {
    name: "Physics",
    color: "accent",
    topics: [
      {
        name: "Mechanics",
        notes: [
          {
            id: "6",
            title: "Newton's Laws of Motion",
            content: "Newton's three laws describe the relationship between motion and forces...",
            subject: "Physics",
            topic: "Mechanics",
            keyPoints: ["First law - Inertia", "Second law - F=ma", "Third law - Action-reaction"],
            lastModified: "4 days ago",
            starred: true,
          },
        ],
      },
    ],
  },
];

const subjectColors: Record<string, string> = {
  Biology: "primary",
  Chemistry: "secondary",
  Physics: "accent",
  Mathematics: "premium",
};

export default function Notes() {
  const [subjects] = useState<Subject[]>(mockSubjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const allNotes = subjects.flatMap((s) => s.topics.flatMap((t) => t.notes));
  
  const filteredSubjects = subjects
    .filter((s) => selectedSubject === "All Subjects" || s.name === selectedSubject)
    .map((subject) => ({
      ...subject,
      topics: subject.topics.map((topic) => ({
        ...topic,
        notes: topic.notes.filter(
          (note) =>
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((topic) => topic.notes.length > 0),
    })).filter((subject) => subject.topics.length > 0);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Exam Notes</h1>
            <p className="text-muted-foreground mt-1">
              {allNotes.length} notes across {subjects.length} subjects
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Subjects">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.name} value={subject.name}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes List */}
          <div className="lg:col-span-1 space-y-4 animate-slide-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            {filteredSubjects.map((subject) => (
              <div key={subject.name} className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    subject.color === "primary" && "bg-primary",
                    subject.color === "secondary" && "bg-secondary",
                    subject.color === "accent" && "bg-accent"
                  )} />
                  <h3 className="font-semibold text-foreground">{subject.name}</h3>
                </div>

                <Accordion type="multiple" className="space-y-2">
                  {subject.topics.map((topic) => (
                    <AccordionItem key={topic.name} value={topic.name} className="border-none">
                      <AccordionTrigger className="py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium hover:no-underline">
                        {topic.name}
                        <span className="ml-auto mr-2 text-xs text-muted-foreground">
                          {topic.notes.length}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-0">
                        <div className="space-y-2 pl-2">
                          {topic.notes.map((note) => (
                            <button
                              key={note.id}
                              onClick={() => setSelectedNote(note)}
                              className={cn(
                                "w-full text-left p-3 rounded-lg transition-all duration-200 group",
                                selectedNote?.id === note.id
                                  ? "bg-primary/10 border border-primary/30"
                                  : "bg-muted/30 hover:bg-muted/50"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-foreground truncate">
                                    {note.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      {note.lastModified}
                                    </span>
                                  </div>
                                </div>
                                {note.starred && (
                                  <Star className="h-4 w-4 text-accent fill-accent flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {/* Note Content */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
            {selectedNote ? (
              <div className="glass-card p-6 md:p-8 sticky top-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        subjectColors[selectedNote.subject] === "primary" && "bg-primary/10 text-primary",
                        subjectColors[selectedNote.subject] === "secondary" && "bg-secondary/10 text-secondary",
                        subjectColors[selectedNote.subject] === "accent" && "bg-accent/20 text-accent-foreground"
                      )}>
                        {selectedNote.subject}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{selectedNote.topic}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                      {selectedNote.title}
                    </h2>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Star className={cn(
                      "h-5 w-5",
                      selectedNote.starred ? "text-accent fill-accent" : "text-muted-foreground"
                    )} />
                  </Button>
                </div>

                {/* Key Points */}
                <div className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Highlighter className="h-4 w-4 text-accent-foreground" />
                    <span className="font-semibold text-sm text-accent-foreground">Key Points</span>
                  </div>
                  <ul className="space-y-2">
                    {selectedNote.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="w-5 h-5 rounded-full bg-accent/30 text-accent-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Content */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed">
                    {selectedNote.content}
                  </p>
                  {/* Placeholder for more content */}
                  <p className="text-muted-foreground mt-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Last modified {selectedNote.lastModified}
                  </span>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a note</h3>
                <p className="text-muted-foreground">
                  Choose a note from the list to view its content
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
