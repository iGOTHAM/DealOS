"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, FileText, Check } from "lucide-react";
import { MemoTemplate } from "@/lib/llm/memo-generator";
import { toast } from "sonner"; // Assuming sonner or generic toast

interface MemoTemplateManagerProps {
    onTemplateSelect: (template: MemoTemplate) => void;
}

export function MemoTemplateManager({ onTemplateSelect }: MemoTemplateManagerProps) {
    const [sampleText, setSampleText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzedTemplate, setAnalyzedTemplate] = useState<MemoTemplate | null>(null);

    const handleAnalyze = async () => {
        if (!sampleText) return;
        setIsAnalyzing(true);
        try {
            const response = await fetch("/api/analyze-template", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: sampleText }),
            });

            if (!response.ok) throw new Error("Analysis failed");

            const data = await response.json();
            setAnalyzedTemplate(data.template);
            toast.success("Template analyzed successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to analyze template");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConfirm = () => {
        if (analyzedTemplate) {
            onTemplateSelect(analyzedTemplate);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 h-[600px]">
            {/* Input Side */}
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Import Golden Sample</CardTitle>
                    <CardDescription>
                        Paste the text content of a past IC Memo (or PDF content) here.
                        The system will learn the structure and diligence questions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                    <Textarea
                        placeholder="Paste memo content here..."
                        className="flex-1 min-h-[300px] font-mono text-xs"
                        value={sampleText}
                        onChange={(e) => setSampleText(e.target.value)}
                    />
                    <Button onClick={handleAnalyze} disabled={isAnalyzing || !sampleText}>
                        {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isAnalyzing ? "Analyzing Style & Structure..." : "Analyze Template"}
                    </Button>
                </CardContent>
            </Card>

            {/* Result Side */}
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Extracted Template</CardTitle>
                    <CardDescription>
                        Review the learned sections and "hidden questions".
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    {analyzedTemplate ? (
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-lg">{analyzedTemplate.name}</h3>
                                    <p className="text-sm text-muted-foreground">{analyzedTemplate.description}</p>
                                    <div className="mt-2 text-xs bg-muted p-2 rounded">
                                        <span className="font-semibold">Voice:</span> {analyzedTemplate.tone_voice}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {analyzedTemplate.sections.map((section) => (
                                        <div key={section.id} className="border rounded-lg p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{section.title}</span>
                                                <Badge variant="outline">{section.hidden_questions.length} Qs</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{section.description}</p>

                                            {section.hidden_questions.length > 0 && (
                                                <div className="text-xs bg-yellow-50/50 dark:bg-yellow-900/20 p-2 rounded space-y-1">
                                                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">Diligence Checks:</span>
                                                    <ul className="list-disc list-inside text-muted-foreground">
                                                        {section.hidden_questions.slice(0, 3).map((q, i) => (
                                                            <li key={i} className="truncate">{q}</li>
                                                        ))}
                                                        {section.hidden_questions.length > 3 && <li>+ {section.hidden_questions.length - 3} more</li>}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <div className="text-center">
                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No template analyzed yet</p>
                            </div>
                        </div>
                    )}
                </CardContent>
                {analyzedTemplate && (
                    <div className="p-6 pt-0">
                        <Button className="w-full" variant="secondary" onClick={handleConfirm}>
                            <Check className="mr-2 h-4 w-4" /> Use This Template
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
