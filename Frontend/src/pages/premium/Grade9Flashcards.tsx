import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { hasPremium } from "@/lib/premium";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    ArrowRight,
    ChevronLeft,
    Crown,
    Layers,
    Lock,
    RotateCcw,
    Shuffle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Flashcard {
    id: string;
    question: string;
    answer: string;
    topic: string;
}

interface FlashcardSet {
    subject: string;
    cards: Flashcard[];
}

// Premium Grade 9 Flashcard Content
const flashcardData: FlashcardSet[] = [
    {
        subject: "Mathematics",
        cards: [
            { id: "m1", topic: "Algebra", question: "What is the quadratic formula?", answer: "x = (-b ± √(b² - 4ac)) / 2a\n\nUsed to solve equations in the form ax² + bx + c = 0" },
            { id: "m2", topic: "Algebra", question: "How do you complete the square for x² + 6x + 5?", answer: "(x + 3)² - 4\n\nStep 1: Half the coefficient of x: 6/2 = 3\nStep 2: Square it: 3² = 9\nStep 3: Rewrite: (x + 3)² - 9 + 5 = (x + 3)² - 4" },
            { id: "m3", topic: "Trigonometry", question: "State the sine rule.", answer: "a/sin(A) = b/sin(B) = c/sin(C)\n\nUsed when you have a pair of opposite side and angle." },
            { id: "m4", topic: "Trigonometry", question: "State the cosine rule for finding a side.", answer: "a² = b² + c² - 2bc·cos(A)\n\nUsed when you have two sides and the included angle (SAS)." },
            { id: "m5", topic: "Probability", question: "What is the formula for conditional probability P(A|B)?", answer: "P(A|B) = P(A ∩ B) / P(B)\n\nThe probability of A given that B has occurred." },
            { id: "m6", topic: "Sequences", question: "What is the nth term formula for a quadratic sequence?", answer: "an² + bn + c\n\nFind 'a' using half the second difference, then work out b and c using simultaneous equations." },
            { id: "m7", topic: "Circle Theorems", question: "What is the alternate segment theorem?", answer: "The angle between a tangent and a chord equals the angle in the alternate segment.\n\nThe angle at the circumference in the alternate segment is equal to the angle between the tangent and the chord." },
            { id: "m8", topic: "Vectors", question: "How do you prove points are collinear using vectors?", answer: "Show that one vector is a scalar multiple of another.\n\nIf AB = k·BC for some scalar k, then A, B, and C are collinear." },
        ]
    },
    {
        subject: "Biology",
        cards: [
            { id: "b1", topic: "Cells", question: "What are the differences between mitosis and meiosis?", answer: "Mitosis: 1 division, 2 identical diploid cells, for growth/repair\n\nMeiosis: 2 divisions, 4 different haploid cells, for gamete production, includes crossing over" },
            { id: "b2", topic: "Cells", question: "Describe the structure and function of mitochondria.", answer: "Double membrane structure with folded inner membrane (cristae).\n\nSite of aerobic respiration - produces ATP through oxidative phosphorylation. Contains own DNA." },
            { id: "b3", topic: "Genetics", question: "What is codominance? Give an example.", answer: "When both alleles are equally expressed in the phenotype.\n\nExample: Blood group AB - both A and B antigens are expressed on red blood cells." },
            { id: "b4", topic: "Genetics", question: "Explain the process of transcription.", answer: "1. DNA helicase unwinds DNA double helix\n2. RNA polymerase binds to promoter region\n3. Complementary mRNA strand synthesised (U pairs with A)\n4. mRNA detaches and exits through nuclear pore" },
            { id: "b5", topic: "Ecology", question: "What is the difference between a food chain and a food web?", answer: "Food chain: Linear sequence showing energy flow from one organism to the next\n\nFood web: Interconnected food chains showing complex feeding relationships in an ecosystem" },
            { id: "b6", topic: "Homeostasis", question: "How does ADH regulate water balance?", answer: "Low water → hypothalamus detects → pituitary releases more ADH → collecting ducts more permeable → more water reabsorbed → concentrated urine\n\nHigh water → opposite occurs" },
        ]
    },
    {
        subject: "Chemistry",
        cards: [
            { id: "c1", topic: "Bonding", question: "Explain why diamond has a high melting point.", answer: "Giant covalent structure with each carbon atom bonded to 4 others.\n\nMany strong covalent bonds must be broken, requiring large amounts of energy." },
            { id: "c2", topic: "Bonding", question: "What is metallic bonding?", answer: "Positive metal ions arranged in a regular lattice, surrounded by a 'sea' of delocalised electrons.\n\nThe electrostatic attraction between positive ions and delocalised electrons holds the structure together." },
            { id: "c3", topic: "Rates", question: "Explain how a catalyst increases reaction rate.", answer: "Provides an alternative reaction pathway with lower activation energy.\n\nMore particles have energy ≥ Ea, so more successful collisions per second. Catalyst is not used up." },
            { id: "c4", topic: "Equilibrium", question: "State Le Chatelier's Principle.", answer: "If a system at equilibrium is disturbed, the position of equilibrium shifts to oppose the change.\n\nApplies to changes in concentration, pressure, and temperature." },
            { id: "c5", topic: "Organic", question: "What is the difference between addition and substitution reactions?", answer: "Addition: Two molecules combine to form one product (unsaturated → saturated)\n\nSubstitution: One atom/group is replaced by another (saturated compounds)" },
            { id: "c6", topic: "Acids", question: "Define a strong acid vs a weak acid.", answer: "Strong acid: Completely dissociates in water (e.g., HCl, H₂SO₄)\n\nWeak acid: Partially dissociates, equilibrium lies to the left (e.g., CH₃COOH, citric acid)" },
        ]
    },
    {
        subject: "Physics",
        cards: [
            { id: "p1", topic: "Waves", question: "What is the wave equation?", answer: "v = f × λ\n\nWave speed (m/s) = frequency (Hz) × wavelength (m)" },
            { id: "p2", topic: "Electricity", question: "What is the equation linking power, current and voltage?", answer: "P = I × V\n\nPower (W) = Current (A) × Potential difference (V)\n\nAlso: P = I²R and P = V²/R" },
            { id: "p3", topic: "Forces", question: "State Newton's Second Law and its equation.", answer: "The acceleration of an object is proportional to the resultant force and inversely proportional to its mass.\n\nF = ma (Force = mass × acceleration)" },
            { id: "p4", topic: "Energy", question: "What is the equation for kinetic energy?", answer: "KE = ½mv²\n\nKinetic energy (J) = ½ × mass (kg) × velocity² (m/s)²" },
            { id: "p5", topic: "Radioactivity", question: "What are the properties of alpha, beta, and gamma radiation?", answer: "Alpha (α): 2p+2n, +2 charge, stopped by paper, most ionising\n\nBeta (β): electron, -1 charge, stopped by aluminium\n\nGamma (γ): EM wave, no charge, reduced by lead, least ionising" },
            { id: "p6", topic: "Space", question: "What is red shift evidence for?", answer: "The expanding universe and the Big Bang theory.\n\nLight from distant galaxies is shifted to longer (red) wavelengths, indicating they are moving away from us." },
        ]
    },
    {
        subject: "English Literature",
        cards: [
            { id: "e1", topic: "Macbeth", question: "What does 'Fair is foul, and foul is fair' suggest?", answer: "Theme of appearance vs reality - things are not what they seem.\n\nInversion of moral order, foreshadowing the moral corruption to come. The witches blur boundaries between good and evil." },
            { id: "e2", topic: "Macbeth", question: "Analyse the significance of Lady Macbeth's 'unsex me' soliloquy.", answer: "She calls on evil spirits to remove her femininity and fill her with cruelty.\n\nChallenges gender roles, shows her as the driving force behind regicide. Ironic given her later mental breakdown." },
            { id: "e3", topic: "A Christmas Carol", question: "How does Dickens present Scrooge's transformation?", answer: "Redemption arc from 'squeezing, wrenching, grasping' miser to generous benefactor.\n\nDickens uses supernatural intervention to critique Victorian attitudes to poverty and promote social responsibility." },
            { id: "e4", topic: "Poetry", question: "What is pathetic fallacy and why is it used?", answer: "Attributing human emotions to nature/weather.\n\nUsed to reflect characters' inner states, create atmosphere, and emphasise themes. E.g., storms during conflict." },
            { id: "e5", topic: "Techniques", question: "What is the effect of using a semantic field?", answer: "A group of words related to a particular theme creates cohesion and reinforces ideas.\n\nE.g., a semantic field of violence (blood, wound, kill) emphasises conflict throughout a text." },
            { id: "e6", topic: "Techniques", question: "Explain dramatic irony and its effect.", answer: "When the audience knows something characters don't.\n\nCreates tension, suspense, or humour. Engages audience as they anticipate characters' reactions." },
        ]
    },
];

export default function Grade9Flashcards() {
    const { supabase, user } = useAuth();
    const navigate = useNavigate();
    const [isPremium, setIsPremium] = useState(false);
    const [checkingPremium, setCheckingPremium] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState(flashcardData[0].subject);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);

    const currentSet = flashcardData.find(s => s.subject === selectedSubject);
    const cards = shuffledCards.length > 0 ? shuffledCards : (currentSet?.cards || []);
    const currentCard = cards[currentCardIndex];

    useEffect(() => {
        if (user) {
            checkPremiumStatus();
        } else {
            setCheckingPremium(false);
        }
    }, [user]);

    useEffect(() => {
        // Reset when subject changes
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setShuffledCards([]);
    }, [selectedSubject]);

    const checkPremiumStatus = async () => {
        if (!user || !supabase) return;
        try {
            const premium = await hasPremium(supabase);
            setIsPremium(premium);
        } catch (error) {
            console.error("Error checking premium status:", error);
        } finally {
            setCheckingPremium(false);
        }
    };

    const handleNext = () => {
        if (currentCardIndex < cards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    };

    const handlePrevious = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    const handleShuffle = () => {
        const shuffled = [...(currentSet?.cards || [])].sort(() => Math.random() - 0.5);
        setShuffledCards(shuffled);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    };

    const handleReset = () => {
        setShuffledCards([]);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    };

    if (checkingPremium) {
        return (
            <AppLayout>
                <div className="max-w-6xl mx-auto flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    if (!isPremium) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto animate-fade-in">
                    <div className="glass-card p-12 text-center">
                        <div className="relative inline-block mb-6">
                            <Layers className="h-20 w-20 text-muted-foreground/50" />
                            <div className="absolute -top-2 -right-2 p-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600">
                                <Lock className="h-5 w-5 text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-foreground mb-4">
                            Grade 9 Premium Flashcards
                        </h1>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            Unlock exclusive Grade 9 flashcards designed to help you commit key concepts to memory.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
                                onClick={() => navigate("/premium-dashboard")}
                            >
                                <Crown className="h-5 w-5 mr-2" />
                                Upgrade to Premium
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => navigate(-1)}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Go Back
                            </Button>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto animate-fade-in pb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20">
                            <Layers className="w-8 h-8 text-yellow-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-bold">Grade 9 Flashcards</h1>
                                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Premium
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Master key concepts for top marks
                            </p>
                        </div>
                    </div>
                </div>

                {/* Subject Selection */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                            {flashcardData.map(set => (
                                <SelectItem key={set.subject} value={set.subject}>
                                    {set.subject}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex gap-2 ml-auto">
                        <Button variant="outline" size="sm" onClick={handleShuffle}>
                            <Shuffle className="h-4 w-4 mr-1" />
                            Shuffle
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleReset}>
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-300"
                            style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                        {currentCardIndex + 1} / {cards.length}
                    </span>
                </div>

                {/* Flashcard */}
                {currentCard && (
                    <div className="mb-6">
                        <div
                            className="relative w-full min-h-[350px] sm:min-h-[400px] cursor-pointer perspective-1000"
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div className={cn(
                                "absolute inset-0 transition-all duration-500 transform-style-3d",
                                isFlipped && "rotate-y-180"
                            )}>
                                {/* Front - Question */}
                                <Card className={cn(
                                    "absolute inset-0 p-6 sm:p-8 flex flex-col backface-hidden",
                                    "bg-gradient-to-br from-background to-muted/30 border-2",
                                    isFlipped && "invisible"
                                )}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Badge variant="secondary" className="text-xs">
                                            {currentCard.topic}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">Click to flip</span>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center">
                                        <h2 className="text-xl sm:text-2xl font-semibold text-center leading-relaxed">
                                            {currentCard.question}
                                        </h2>
                                    </div>
                                    <div className="text-center text-muted-foreground text-sm mt-4">
                                        Question
                                    </div>
                                </Card>

                                {/* Back - Answer */}
                                <Card className={cn(
                                    "absolute inset-0 p-6 sm:p-8 flex flex-col backface-hidden rotate-y-180",
                                    "bg-gradient-to-br from-yellow-500/5 to-amber-500/10 border-2 border-yellow-500/30",
                                    !isFlipped && "invisible"
                                )}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 text-xs">
                                            {currentCard.topic}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">Click to flip back</span>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center">
                                        <p className="text-base sm:text-lg text-center leading-relaxed whitespace-pre-line">
                                            {currentCard.answer}
                                        </p>
                                    </div>
                                    <div className="text-center text-yellow-600 text-sm mt-4">
                                        Answer
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentCardIndex === 0}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                    </Button>

                    <div className="flex gap-1">
                        {cards.slice(0, 10).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setCurrentCardIndex(idx); setIsFlipped(false); }}
                                className={cn(
                                    "w-2.5 h-2.5 rounded-full transition-all",
                                    currentCardIndex === idx
                                        ? "bg-yellow-500 scale-125"
                                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                )}
                            />
                        ))}
                        {cards.length > 10 && (
                            <span className="text-xs text-muted-foreground ml-1">+{cards.length - 10}</span>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleNext}
                        disabled={currentCardIndex === cards.length - 1}
                        className="gap-2"
                    >
                        Next
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Subject Stats */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {flashcardData.map(set => (
                        <button
                            key={set.subject}
                            onClick={() => setSelectedSubject(set.subject)}
                            className={cn(
                                "p-3 rounded-xl text-left transition-all",
                                selectedSubject === set.subject
                                    ? "bg-yellow-500/20 border border-yellow-500/50"
                                    : "bg-muted/50 hover:bg-muted border border-transparent"
                            )}
                        >
                            <div className="font-medium text-sm truncate">{set.subject}</div>
                            <div className="text-xs text-muted-foreground">{set.cards.length} cards</div>
                        </button>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
