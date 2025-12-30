import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp } from "lucide-react";
import { useState } from "react";

interface SubjectGrade {
    name: string;
    grade: string;
    target: string;
}

const GRADE_VALUES: Record<string, number> = {
    "9": 9,
    "8": 8,
    "7": 7,
    "6": 6,
    "5": 5,
    "4": 4,
    "3": 3,
    "2": 2,
    "1": 1,
};

const GRADE_LABELS: Record<string, string> = {
    "9": "9 (A**)",
    "8": "8 (A*)",
    "7": "7 (A)",
    "6": "6 (B)",
    "5": "5 (C)",
    "4": "4 (C-)",
    "3": "3 (D)",
    "2": "2 (E)",
    "1": "1 (F)",
};

export default function PredictedGrades() {
    const [subjects, setSubjects] = useState<SubjectGrade[]>([{ name: "", grade: "", target: "" }]);
    const [prediction, setPrediction] = useState<{
        onTrack: number;
        needsWork: number;
        exceeding: number;
        message: string;
        focusAreas: string[];
    } | null>(null);

    const addSubject = () => {
        setSubjects([...subjects, { name: "", grade: "", target: "" }]);
    };

    const updateSubject = (index: number, field: keyof SubjectGrade, value: string) => {
        const updated = [...subjects];
        updated[index] = { ...updated[index], [field]: value };
        setSubjects(updated);
    };

    const removeSubject = (index: number) => {
        if (subjects.length > 1) {
            setSubjects(subjects.filter((_, i) => i !== index));
        }
    };

    const calculatePrediction = () => {
        const validSubjects = subjects.filter(s => s.name && s.grade && s.target);
        
        if (validSubjects.length === 0) {
            return;
        }

        let onTrack = 0;
        let needsWork = 0;
        let exceeding = 0;
        const focusAreas: string[] = [];

        validSubjects.forEach(subject => {
            const currentGrade = GRADE_VALUES[subject.grade] || 0;
            const targetGrade = GRADE_VALUES[subject.target] || 0;

            if (currentGrade >= targetGrade) {
                exceeding++;
            } else if (currentGrade >= targetGrade - 1) {
                onTrack++;
            } else {
                needsWork++;
                focusAreas.push(subject.name);
            }
        });

        const total = validSubjects.length;
        const message = needsWork > 0
            ? `Based on your recent inputs, you need to focus on ${focusAreas.join(", ")} to reach your target grades. You're exceeding in ${exceeding} subject${exceeding !== 1 ? "s" : ""} and on track in ${onTrack} subject${onTrack !== 1 ? "s" : ""}.`
            : `Based on your recent inputs, you are exceeding your target in ${exceeding} subject${exceeding !== 1 ? "s" : ""} and on track in ${onTrack} subject${onTrack !== 1 ? "s" : ""}. Keep up the excellent work!`;

        setPrediction({
            onTrack,
            needsWork,
            exceeding,
            message,
            focusAreas,
        });
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
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pb-4 border-b last:border-0">
                                <div className="space-y-2">
                                    <Label>Subject</Label>
                                    <Select value={subject.name} onValueChange={(value) => updateSubject(index, "name", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                                            <SelectItem value="English Literature">English Literature</SelectItem>
                                            <SelectItem value="English Language">English Language</SelectItem>
                                            <SelectItem value="Biology">Biology</SelectItem>
                                            <SelectItem value="Chemistry">Chemistry</SelectItem>
                                            <SelectItem value="Physics">Physics</SelectItem>
                                            <SelectItem value="History">History</SelectItem>
                                            <SelectItem value="Geography">Geography</SelectItem>
                                            <SelectItem value="French">French</SelectItem>
                                            <SelectItem value="Spanish">Spanish</SelectItem>
                                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Current Grade</Label>
                                    <Select value={subject.grade} onValueChange={(value) => updateSubject(index, "grade", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(GRADE_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Grade</Label>
                                    <Select value={subject.target} onValueChange={(value) => updateSubject(index, "target", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Target" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(GRADE_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {subjects.length > 1 && (
                                    <Button variant="ghost" size="icon" onClick={() => removeSubject(index)}>
                                        ×
                                    </Button>
                                )}
                            </div>
                        ))}

                        <Button variant="outline" onClick={addSubject} className="w-full border-dashed">
                            + Add Another Subject
                        </Button>

                        <div className="flex justify-end pt-4">
                            <Button className="bg-green-600 hover:bg-green-700" onClick={calculatePrediction}>
                                Calculate Prediction
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Prediction Result */}
                {prediction && (
                    <Card className={prediction.needsWork > 0 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-green-500/10 border-green-500/20"}>
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 ${prediction.needsWork > 0 ? "bg-yellow-500/20 text-yellow-600" : "bg-green-500/20 text-green-600"} rounded-full`}>
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className={`text-xl font-bold ${prediction.needsWork > 0 ? "text-yellow-700 dark:text-yellow-400" : "text-green-700 dark:text-green-400"}`}>
                                        {prediction.needsWork > 0 ? "Areas to Focus On" : "On Track for Success"}
                                    </h3>
                                    <p className="text-muted-foreground mt-1">
                                        {prediction.message}
                                    </p>
                                    {prediction.focusAreas.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-sm font-semibold mb-2">Focus Areas:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {prediction.focusAreas.map((area, i) => (
                                                    <span key={i} className="px-2 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded text-sm">
                                                        {area}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
