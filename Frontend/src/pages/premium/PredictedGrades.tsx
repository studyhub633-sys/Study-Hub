import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function PredictedGrades() {
    const [subjects, setSubjects] = useState([{ name: "", grade: "", target: "" }]);

    const addSubject = () => {
        setSubjects([...subjects, { name: "", grade: "", target: "" }]);
    };

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                        <Calculator className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Predicted Grades Calculator</h1>
                        <p className="text-muted-foreground">Track your performance and see what you're on track to achieve.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Subject Performance</CardTitle>
                        <CardDescription>Enter your current mock results or recent test scores.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {subjects.map((subject, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pb-4 border-b last:border-0">
                                <div className="space-y-2">
                                    <Label>Subject</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="maths">Mathematics</SelectItem>
                                            <SelectItem value="english">English Literature</SelectItem>
                                            <SelectItem value="biology">Biology</SelectItem>
                                            {/* Add more subjects */}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Current Grade</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="9">9 (A**)</SelectItem>
                                            <SelectItem value="8">8 (A*)</SelectItem>
                                            <SelectItem value="7">7 (A)</SelectItem>
                                            <SelectItem value="6">6 (B)</SelectItem>
                                            <SelectItem value="5">5 (C)</SelectItem>
                                            {/* Add more grades */}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Grade</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Target" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="9">9 (A**)</SelectItem>
                                            <SelectItem value="8">8 (A*)</SelectItem>
                                            <SelectItem value="7">7 (A)</SelectItem>
                                            {/* Add more grades */}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}

                        <Button variant="outline" onClick={addSubject} className="w-full border-dashed">
                            + Add Another Subject
                        </Button>

                        <div className="flex justify-end pt-4">
                            <Button className="bg-green-600 hover:bg-green-700">
                                Calculate Prediction
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Prediction Result Result */}
                <Card className="bg-green-500/10 border-green-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-500/20 rounded-full text-green-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-green-700 dark:text-green-400">On Track for Success</h3>
                                <p className="text-muted-foreground mt-1">
                                    Based on your recent inputs, you are exceeding your target in 2 subjects. Keep focusing on <strong>Biology</strong> to reach that Grade 8.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
