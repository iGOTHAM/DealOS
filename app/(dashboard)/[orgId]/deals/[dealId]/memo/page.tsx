"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MemoTemplateManager } from "@/components/memo/memo-template-manager";
import { MemoTemplate, MemoSection } from "@/lib/llm/memo-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Wand2, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

// Mock deal context for now - in real app, fetch from DB/RAG
const MOCK_DEAL_CONTEXT = `
Target is a B2B SaaS company in the chaotic logistics space.
Revenue: $10M ARR, growing 40% YoY.
Churn: 15% (High).
Team: 2 Founders, technical background.
Market: Fragmented, competitors include Flexport (high end) and spreadsheets (low end).
Ask: raising $5M Series A.
Risks: High churn, dependence on one channel partner.
Upside: AI automation feature is best in class.
`;

export default function DealMemoPage() {
    const params = useParams();
    const orgId = params.orgId as string;
    const dealId = params.dealId as string;

    const [activeTemplate, setActiveTemplate] = useState<MemoTemplate | null>(null);
    const [generatedSections, setGeneratedSections] = useState<Record<string, string>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

    const handleTemplateSelect = (template: MemoTemplate) => {
        setActiveTemplate(template);
        // Initialize sections
        const initialSections: Record<string, string> = {};
        template.sections.forEach(s => {
            initialSections[s.id] = "";
        });
        setGeneratedSections(initialSections);
    };

    const generateFullMemo = async () => {
        if (!activeTemplate) return;
        setIsGenerating(true);

        try {
            // Sequential generation for better UX/Rate limiting
            for (const section of activeTemplate.sections) {
                setCurrentSectionId(section.id);

                try {
                    const response = await fetch("/api/generate-memo-section", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            section,
                            dealContext: MOCK_DEAL_CONTEXT, // In real app, this comes from RAG/DB
                            toneVoice: activeTemplate.tone_voice
                        }),
                    });

                    if (!response.ok) throw new Error("Generation failed for section " + section.title);

                    const data = await response.json();

                    setGeneratedSections(prev => ({
                        ...prev,
                        [section.id]: data.content
                    }));
                } catch (err) {
                    console.error(err);
                    setGeneratedSections(prev => ({
                        ...prev,
                        [section.id]: `[Error generating section: ${section.title}]`
                    }));
                }
            }
        } catch (e) {
            console.error("Generation failed", e);
        } finally {
            setIsGenerating(false);
            setCurrentSectionId(null);
        }
    };

    if (!activeTemplate) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/${orgId}/deals/${dealId}`}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Investment Memo</h1>
                        <p className="text-muted-foreground">Generate a diligence memo for this deal.</p>
                    </div>
                </div>

                <MemoTemplateManager onTemplateSelect={handleTemplateSelect} />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 h-[calc(100vh-60px)] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => setActiveTemplate(null)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Change Template
                    </Button>
                    <h1 className="text-xl font-bold">{activeTemplate.name}</h1>
                </div>
                <div className="flex gap-2">
                    <Button onClick={generateFullMemo} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        {isGenerating ? "Drafting..." : "Generate Full Memo"}
                    </Button>
                    <Button variant="outline"><Save className="mr-2 h-4 w-4" /> Save Draft</Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
                {/* Outline / Sidebar */}
                <div className="col-span-3 border-r h-full overflow-y-auto pr-4">
                    <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Sections</h3>
                    <div className="space-y-1">
                        {activeTemplate.sections.map(section => (
                            <div
                                key={section.id}
                                className={`p-2 text-sm rounded-md cursor-pointer flex items-center justify-between ${currentSectionId === section.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                            >
                                <span>{section.title}</span>
                                {generatedSections[section.id] && <div className="h-2 w-2 rounded-full bg-green-500" />}
                                {currentSectionId === section.id && <Loader2 className="h-3 w-3 animate-spin" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content (Editor/Preview) */}
                <div className="col-span-9 h-full overflow-y-auto min-h-0 bg-background border rounded-lg shadow-sm">
                    <div className="p-8 max-w-4xl mx-auto space-y-8">
                        {/* Render the sections */}
                        {activeTemplate.sections.map(section => (
                            <div key={section.id} className="space-y-4">
                                <h2 className="text-2xl font-bold border-b pb-2">{section.title}</h2>
                                <div className="min-h-[100px] prose dark:prose-invert max-w-none">
                                    {generatedSections[section.id] ? (
                                        <div className="whitespace-pre-wrap">{generatedSections[section.id]}</div>
                                    ) : (
                                        <div className="text-muted-foreground italic p-4 bg-muted/30 rounded border border-dashed">
                                            Waiting for generation...
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
