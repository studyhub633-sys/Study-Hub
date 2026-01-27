import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ContextSidebarProps {
    context: string;
    setContext: (value: string) => void;
    mode: "chat" | "question" | "evaluate";
}

export function ContextSidebar({ context, setContext, mode }: ContextSidebarProps) {
    return (
        <div className="flex flex-col gap-4 h-full">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg">Context / Notes</CardTitle>
                    <CardDescription>
                        Paste your notes here for better assistance
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <Textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Paste your notes, study material, or the correct answer here..."
                        className="min-h-[300px] resize-none focus-visible:ring-1"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        {mode === "question" &&
                            "I'll generate practice questions based on this context"}
                        {mode === "evaluate" &&
                            "This should be the correct answer to compare against"}
                        {mode === "chat" && "Provide context for better responses"}
                    </p>
                </CardContent>
            </Card>

            <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-medium mb-2 text-sm">Tips</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                    <p>• Provide clear context from your notes for better questions</p>
                    <p>• Use "Generate Question" mode to create practice questions</p>
                    <p>• After a question is generated, just type your answer</p>
                    <p>• The AI will automatically evaluate your response</p>
                </div>
            </div>
        </div>
    );
}
