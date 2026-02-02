import { AppLayout } from "@/components/layout/AppLayout";
import RadialMindMap from "@/components/RadialMindMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { hasPremium } from "@/lib/premium";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { BookOpen, FileImage, FileText, FlaskConical, Loader2, Network, Save, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MindMapNode {
    title: string;
    children: MindMapNode[];
}

import { useLocation } from "react-router-dom";

export default function MindMapGenerator() {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const location = useLocation();
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notesContent, setNotesContent] = useState("");
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const mindMapRef = useRef<HTMLDivElement>(null);

    const [checking, setChecking] = useState(true);

    // Initial load from navigation state (if coming from Notes page)
    useEffect(() => {
        if (location.state) {
            const { noteContent, noteTitle, noteSubject } = location.state as any;
            if (noteContent) setNotesContent(noteContent);
            if (noteTitle) setTitle(noteTitle);
            if (noteSubject) setSubject(noteSubject);

            // Clear state to prevent reapplying on refresh if desired, 
            // but keeping it is usually fine for this use case.
        }
    }, [location]);

    useEffect(() => {
        checkPremiumStatus();
    }, [user]);

    const checkPremiumStatus = async () => {
        if (!user || !supabase) {
            setChecking(false);
            return;
        }
        try {
            const premium = await hasPremium(supabase);
            setIsPremium(premium);
        } catch (error) {
            console.error("Error checking premium status:", error);
        } finally {
            setChecking(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        const validTypes = ['text/plain', 'application/pdf'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf')) {
            toast({
                title: "Invalid file type",
                description: "Please upload a TXT or PDF file",
                variant: "destructive",
            });
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please upload a file smaller than 5MB",
                variant: "destructive",
            });
            return;
        }

        setUploadingFile(true);
        try {
            if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                // Read text file directly
                const text = await file.text();
                setNotesContent(text);
                setTitle(file.name.replace('.txt', ''));
                toast({
                    title: "File uploaded!",
                    description: "Text extracted successfully",
                });
            } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                // For PDF, we'll just inform the user to use text for now
                toast({
                    title: "PDF Support Coming Soon",
                    description: "Please copy and paste the text from your PDF for now",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Error reading file",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setUploadingFile(false);
            // Reset file input
            e.target.value = '';
        }
    };

    const handleGenerate = async () => {
        if (!notesContent.trim()) {
            toast({
                title: "Error",
                description: "Please enter some notes to convert",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const session = await supabase.auth.getSession();
            const response = await fetch('/api/ai/generate-mindmap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.data.session?.access_token}`
                },
                body: JSON.stringify({
                    content: notesContent,
                    subject,
                    title: title || 'Mind Map',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate mind map');
            }

            setMindMapData(data.mindMapData);
            toast({
                title: "Success!",
                description: "Mind map generated successfully",
            });

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!mindMapData) return;

        try {
            const { error } = await supabase.from('mind_maps').insert({
                user_id: user?.id,
                title: title || 'Untitled Mind Map',
                subject: subject || null,
                source_content: notesContent,
                mind_map_data: mindMapData,
            });

            if (error) throw error;

            toast({
                title: "Saved!",
                description: "Mind map saved to your library",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to save mind map",
                variant: "destructive",
            });
        }
    };

    const handleDownload = async (format: 'png' | 'pdf' = 'png') => {
        if (!mindMapData || !mindMapRef.current) {
            toast({
                title: "Error",
                description: "Please generate a mind map first",
                variant: "destructive",
            });
            return;
        }

        setDownloading(true);
        try {
            // Wait a bit to ensure the mind map is fully rendered
            await new Promise(resolve => setTimeout(resolve, 100));

            const element = mindMapRef.current;

            // Capture the live element directly instead of cloning
            // Cloning ReactFlow explicitly can cause issues with missing context/canvas state
            const canvas = await html2canvas(element, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                logging: false,
                // Ensure we capture the background 
                allowTaint: true,
                foreignObjectRendering: true,
            });

            if (format === 'png') {
                // Download as PNG
                const link = document.createElement('a');
                link.download = `${title || 'mind-map'}.png`;
                link.href = canvas.toDataURL('image/png', 1.0);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // Download as PDF
                const imgData = canvas.toDataURL('image/png', 1.0);
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;

                // Convert pixels to mm (1px = 0.264583mm at 96 DPI)
                const mmWidth = imgWidth * 0.264583;
                const mmHeight = imgHeight * 0.264583;

                // Use A4 dimensions as max, scale if needed
                const a4Width = 210; // mm
                const a4Height = 297; // mm

                let pdfWidth = mmWidth;
                let pdfHeight = mmHeight;
                let orientation: 'portrait' | 'landscape' = 'portrait';

                // If image is larger than A4, scale it down
                if (mmWidth > a4Width || mmHeight > a4Height) {
                    const scaleX = a4Width / mmWidth;
                    const scaleY = a4Height / mmHeight;
                    const scale = Math.min(scaleX, scaleY);
                    pdfWidth = mmWidth * scale;
                    pdfHeight = mmHeight * scale;
                }

                // Determine orientation
                if (pdfWidth > pdfHeight) {
                    orientation = 'landscape';
                    // Swap dimensions for landscape
                    [pdfWidth, pdfHeight] = [pdfHeight, pdfWidth];
                }

                const pdf = new jsPDF({
                    orientation: orientation,
                    unit: 'mm',
                    format: [pdfWidth, pdfHeight]
                });

                // Add image, scaling to fit
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
                pdf.save(`${title || 'mind-map'}.pdf`);
            }

            toast({
                title: "Downloaded!",
                description: `Mind map saved as ${format.toUpperCase()}`,
            });
        } catch (error: any) {
            console.error("Download error:", error);
            toast({
                title: "Download failed",
                description: error.message || "Failed to download mind map. Please try again.",
                variant: "destructive",
            });
        } finally {
            setDownloading(false);
        }
    };

    const handleLoadSample = () => {
        setTitle("The Solar System");
        setSubject("Astronomy");
        setNotesContent(`The Solar System consists of the Sun and the objects that orbit it, including eight planets.

The four inner planets are Mercury, Venus, Earth, and Mars. They are called terrestrial planets because they have solid, rocky surfaces.
- Mercury is the closest planet to the Sun and the smallest.
- Venus is the hottest planet due to its thick atmosphere.
- Earth is the only known planet to support life and has one moon.
- Mars is known as the Red Planet and has two moons, Phobos and Deimos.

The four outer planers are gas giants: Jupiter and Saturn, and ice giants: Uranus and Neptune.
- Jupiter is the largest planet and has the Great Red Spot.
- Saturn is famous for its prominent ring system.
- Uranus spins on its side.
- Neptune is the furthest planet from the Sun and has strong winds.

Other objects in the solar system include dwarf planets like Pluto, asteroids in the asteroid belt between Mars and Jupiter, and comets which have tails when they get close to the Sun.`);

        // Directly set sample data for testing visualization
        setMindMapData({
            title: "The Solar System",
            children: [
                {
                    title: "Inner Planets",
                    children: [
                        { title: "Mercury", children: [] },
                        { title: "Venus", children: [] },
                        { title: "Earth", children: [{ title: "Moon", children: [] }] },
                        { title: "Mars", children: [{ title: "Phobos", children: [] }, { title: "Deimos", children: [] }] }
                    ]
                },
                {
                    title: "Outer Planets",
                    children: [
                        {
                            title: "Gas Giants", children: [
                                { title: "Jupiter", children: [] },
                                { title: "Saturn", children: [] }
                            ]
                        },
                        {
                            title: "Ice Giants", children: [
                                { title: "Uranus", children: [] },
                                { title: "Neptune", children: [] }
                            ]
                        }
                    ]
                },
                {
                    title: "Other Objects",
                    children: [
                        { title: "Dwarf Planets", children: [{ title: "Pluto", children: [] }] },
                        { title: "Asteroids", children: [] },
                        { title: "Comets", children: [] }
                    ]
                }
            ]
        });

        toast({
            title: "Sample Loaded",
            description: "Sample data loaded for testing.",
        });
    };

    if (checking) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AppLayout>
        );
    }

    if (!isPremium) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto py-12">
                    <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Network className="w-6 h-6 text-amber-500" />
                                Premium Feature
                            </CardTitle>
                            <CardDescription>
                                AI Mind Map Generator is a premium feature
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Upgrade to premium to transform your notes into interactive mind maps instantly.
                            </p>
                            <Button
                                onClick={() => window.location.href = '/premium-dashboard'}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                View Premium Plans
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <Network className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">AI Mind Map Generator</h1>
                        <p className="text-muted-foreground">Transform your notes into visual mind maps instantly</p>
                    </div>
                </div>

                {/* Input Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="animate-slide-up">
                        <CardHeader>
                            <CardTitle>Your Notes</CardTitle>
                            <CardDescription>Paste or type your study notes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title (Optional)</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Cell Biology Summary"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject (Optional)</Label>
                                <Input
                                    id="subject"
                                    placeholder="e.g., Biology"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes Content</Label>
                                <div className="mb-2">
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <div className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-purple-300 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors">
                                            <BookOpen className="w-4 h-4 text-purple-500" />
                                            <span className="text-sm text-purple-600 dark:text-purple-400">
                                                {uploadingFile ? "Uploading..." : "Upload TXT file"}
                                            </span>
                                        </div>
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".txt,text/plain"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        disabled={uploadingFile}
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Upload a text file or paste your notes below
                                    </p>
                                </div>
                                <Textarea
                                    id="notes"
                                    placeholder="Paste your notes here... (e.g., 'Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in chloroplasts...')"
                                    className="min-h-[300px] resize-none font-mono text-sm"
                                    value={notesContent}
                                    onChange={(e) => setNotesContent(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                    onClick={handleGenerate}
                                    disabled={loading || !notesContent.trim()}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Generate Mind Map
                                        </>
                                    )}
                                </Button>
                                <Button variant="outline" onClick={handleLoadSample} title="Load sample data to test visualization">
                                    <FlaskConical className="w-4 h-4 mr-2" />
                                    Test Sample
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mind Map Display */}
                    <Card className={`animate-slide-up ${mindMapData ? 'border-purple-500/20 bg-purple-500/5' : ''}`} style={{ animationDelay: '0.1s', opacity: 0 }}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Generated Mind Map</CardTitle>
                                    <CardDescription>
                                        {mindMapData ? "Ready to save" : "Mind map will appear here"}
                                    </CardDescription>
                                </div>
                                {mindMapData && (
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleDownload('png')} disabled={downloading}>
                                            {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileImage className="w-4 h-4 mr-2" />}
                                            PNG
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')} disabled={downloading}>
                                            {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                                            PDF
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleSave}>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {mindMapData ? (
                                <div ref={mindMapRef} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg h-[600px] overflow-hidden">
                                    <RadialMindMap data={mindMapData} />
                                </div>
                            ) : (
                                <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                    <Network className="w-16 h-16 mb-4" />
                                    <p>Your mind map will appear here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Info Card */}
                <Card className="border-blue-500/20 bg-blue-500/5 animate-slide-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <BookOpen className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-1">How it works</h4>
                                <p className="text-sm text-muted-foreground">
                                    The AI analyzes your notes and automatically creates a hierarchical mind map structure,
                                    organizing key concepts, subtopics, and details into an easy-to-understand visual format.
                                    Perfect for revision and understanding complex topics!
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

// Simple tree-based mind map visualization
function MindMapVisualization({ data }: { data: MindMapNode }) {
    const renderNode = (node: MindMapNode, level: number = 0): JSX.Element => {
        const colors = [
            'bg-purple-500 text-white border-purple-600',
            'bg-pink-100 dark:bg-pink-900/50 text-pink-900 dark:text-pink-100 border-pink-300 dark:border-pink-700',
            'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-700',
            'bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100 border-green-200 dark:border-green-700'
        ];

        const colorClass = colors[Math.min(level, colors.length - 1)];
        const fontSize = level === 0 ? 'text-lg font-bold' : level === 1 ? 'text-base font-semibold' : 'text-sm';

        return (
            <div key={node.title + level} className="mb-3">
                <div className={`p-3 rounded-lg border-2 inline-block ${colorClass} ${fontSize} shadow-sm`}>
                    {node.title}
                </div>
                {node.children && node.children.length > 0 && (
                    <div className="ml-6 mt-2 border-l-2 border-purple-200 dark:border-purple-800 pl-4 space-y-2">
                        {node.children.map((child, idx) => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="">
            {renderNode(data)}
        </div>
    );
}
