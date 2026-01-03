"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { FileText, Plus, MoreHorizontal } from "lucide-react"

export function SourcePanel() {
    // Mock sources
    const sources = [
        { id: 1, name: "Confidential Information Memorandum (CIM).pdf", type: "PDF" },
        { id: 2, name: "Q3 2024 Financials.xlsx", type: "XLSX" },
        { id: 3, name: "Management Presentation.pptx", type: "PPTX" },
        { id: 4, name: "Legal Diligence Report.docx", type: "DOCX" },
        { id: 5, name: "Competitor Analysis.pdf", type: "PDF" },
    ]

    return (
        <Card className="h-full border-none shadow-none rounded-none bg-secondary/10 flex flex-col">
            <CardHeader className="pb-2 px-4 pt-4 border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-10 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sources</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{sources.length} files selected</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Plus className="h-4 w-4" />
                </Button>
            </CardHeader>
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-1">
                    <div className="flex items-center space-x-2 px-2 py-1.5 mb-2">
                        <Checkbox id="select-all" className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" checked />
                        <label
                            htmlFor="select-all"
                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground"
                        >
                            Select all sources
                        </label>
                    </div>
                    {sources.map((source) => (
                        <div key={source.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all group border border-transparent hover:border-border/30">
                            <Checkbox id={`source-${source.id}`} checked className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                            <div className="flex-1 flex items-center gap-2 overflow-hidden">
                                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div className="truncate">
                                    <p className="text-sm font-medium truncate" title={source.name}>{source.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">{source.type}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 border-t border-border/50 bg-background/50">
                <Button variant="outline" className="w-full h-9 text-xs rounded-full border-dashed border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-colors gap-2">
                    <Plus className="h-3.5 w-3.5" /> Add source
                </Button>
            </div>
        </Card>
    )
}
