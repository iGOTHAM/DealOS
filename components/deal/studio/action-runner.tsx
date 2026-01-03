"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TemplateManager, Template, defaultTemplates } from "./template-manager"
import { Loader2, FileCheck, AlertCircle, Play, FileText } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { generateOutput } from "@/app/(dashboard)/actions/ai"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ActionRunnerProps {
    action: {
        title: string
        description: string
        icon: any
        color: string
    }
    orgId: string
    dealId: string // Ensure dealId is passed!
    children: React.ReactNode
}

export function ActionRunner({ action, orgId, dealId, children }: ActionRunnerProps) {
    const [open, setOpen] = useState(false)
    const [status, setStatus] = useState<"idle" | "running" | "completed" | "error">("idle")
    const [progress, setProgress] = useState(0)
    const [selectedTemplate, setSelectedTemplate] = useState<Template>(defaultTemplates[0])
    const [selectedModel, setSelectedModel] = useState("openai/gpt-4o")
    const [resultText, setResultText] = useState<string>("")

    const runAction = async () => {
        setStatus("running")
        setProgress(10) // Start progress

        try {
            // Call Server Action
            const result = await generateOutput(dealId, selectedTemplate)

            if (result.success && result.text) {
                setResultText(result.text)
                setProgress(100)
                setStatus("completed")
            } else {
                console.error(result.error)
                setStatus("error")
            }
        } catch (e) {
            console.error(e)
            setStatus("error")
        }
    }

    // ...


    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            // Reset state after a delay when closing
            setTimeout(() => {
                setStatus("idle")
                setProgress(0)
            }, 300)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl border-border/50">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center`}>
                            <action.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle>{action.title}</DialogTitle>
                            <DialogDescription className="text-xs">{action.description}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Template Selection */}
                    {status === "idle" && (
                        <div className="space-y-4">
                            <div className="space-y-3 p-4 bg-secondary/20 rounded-xl border border-border/50">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold">Output Template</h4>
                                    <TemplateManager
                                        orgId={orgId}
                                        selectedId={selectedTemplate.id}
                                        onSelect={setSelectedTemplate}
                                    />
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border/30">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">{selectedTemplate.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedTemplate.isDefault ? "Firm Standard" : "Custom Upload"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Model Selection */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold px-1">AI Model</h4>
                                <Select value={selectedModel} onValueChange={setSelectedModel}>
                                    <SelectTrigger className="w-full h-10 rounded-xl border-border/50 bg-background">
                                        <SelectValue placeholder="Select Model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="openai/gpt-4o">GPT-4o (Best for Reasoning)</SelectItem>
                                        <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Best for Writing)</SelectItem>
                                        <SelectItem value="google/gemini-pro-1.5">Gemini 1.5 Pro (Large Context)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Progress State */}
                    {status === "running" && (
                        <div className="space-y-4 text-center py-8">
                            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Generating Output...</h3>
                                <p className="text-sm text-muted-foreground">Analyzing {selectedTemplate.name} structure...</p>
                            </div>
                            <Progress value={progress} className="h-2 w-full max-w-[200px] mx-auto rounded-full" />
                        </div>
                    )}

                    {/* Completion State */}
                    {status === "completed" && (
                        <div className="space-y-4 text-center py-6">
                            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileCheck className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-xl">Generation Complete!</h3>
                                <p className="text-sm text-muted-foreground">Your output is ready.</p>
                            </div>

                            {/* Result Preview */}
                            <div className="bg-secondary/30 rounded-lg p-3 max-h-[200px] overflow-y-auto text-left border border-border/50">
                                <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                                    {resultText}
                                </pre>
                            </div>

                            <div className="flex justify-center gap-3 pt-2">
                                <Button variant="outline" className="rounded-full" onClick={() => navigator.clipboard.writeText(resultText)}>
                                    Copy to Clipboard
                                </Button>
                                <Button className="rounded-full">Download .docx</Button>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {status === "idle" && (
                        <Button onClick={runAction} className="w-full sm:w-auto gap-2 rounded-full">
                            <Play className="h-4 w-4" /> Run Action
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
