"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, UploadCloud, FileSpreadsheet, Plus, Check, Loader2 } from "lucide-react"
import { uploadTemplate, getTemplates } from "@/app/(dashboard)/actions/templates"

export interface Template {
    id: string
    name: string
    type: string | "word" | "excel" | "json"
    isDefault?: boolean
    filePath?: string
}

export const defaultTemplates: Template[] = [
    { id: "def-1", name: "Firm Standard IC Memo", type: "word", isDefault: true },
    { id: "def-2", name: "Standard LBO Model", type: "excel", isDefault: true },
    { id: "def-3", name: "Legal Risk Checklist", type: "json", isDefault: true },
]

export function TemplateManager({
    onSelect,
    selectedId,
    orgId
}: {
    onSelect?: (template: Template) => void,
    selectedId?: string,
    orgId: string
}) {
    const [templates, setTemplates] = useState<Template[]>(defaultTemplates)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Fetch custom templates on mount
    useEffect(() => {
        if (!open) return

        async function fetchTemplates() {
            setLoading(true)
            const custom = await getTemplates(orgId)
            setTemplates([...defaultTemplates, ...custom])
            setLoading(false)
        }

        fetchTemplates()
    }, [orgId, open])

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.append("orgId", orgId)

        // Infer type from file extension if possible, or manual selection
        const file = formData.get("file") as File
        let type = "word"
        if (file.name.endsWith(".xlsx")) type = "excel"
        if (file.name.endsWith(".json")) type = "json"
        formData.append("type", type)

        const result = await uploadTemplate(formData)

        if (result?.error) {
            console.error(result.error)
            // Toast here
        } else {
            // Refresh list
            const custom = await getTemplates(orgId)
            setTemplates([...defaultTemplates, ...custom])
            setOpen(false)
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 rounded-full">
                    <Plus className="h-3 w-3" /> Manage Templates
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-2xl border-border/50">
                <DialogHeader>
                    <DialogTitle>Template Manager</DialogTitle>
                    <DialogDescription>
                        Manage your firm's output templates. Upload custom Word or Excel files to standardize your deal analysis.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="list" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2 rounded-xl bg-secondary/50 p-1">
                        <TabsTrigger value="list" className="rounded-lg">My Templates</TabsTrigger>
                        <TabsTrigger value="upload" className="rounded-lg">Upload New</TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
                        {loading && <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>}
                        {!loading && templates.map((template) => (
                            <div
                                key={template.id}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedId === template.id
                                        ? "bg-primary/5 border-primary shadow-sm"
                                        : "bg-background border-border/50 hover:border-primary/30"
                                    }`}
                                onClick={() => {
                                    if (onSelect) {
                                        onSelect(template)
                                        setOpen(false)
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${template.type === 'excel' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {template.type === 'excel' ? <FileSpreadsheet className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{template.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {template.isDefault ? "Firm Standard" : "Custom Upload"} • {template.type.toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                                {selectedId === template.id && (
                                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                        <Check className="h-3.5 w-3.5" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="upload">
                        <form onSubmit={handleUpload} className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 bg-secondary/10 mt-4 relative">
                            {loading && <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                            <div className="p-4 bg-background rounded-full shadow-sm">
                                <UploadCloud className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-semibold text-sm">Click to upload</h4>
                                <p className="text-xs text-muted-foreground">Word (.docx), Excel (.xlsx), or JSON</p>
                            </div>
                            <Input id="file" name="file" type="file" required className="cursor-pointer" />

                            <div className="w-full max-w-xs space-y-2 text-left">
                                <Label htmlFor="t-name" className="text-xs">Template Name</Label>
                                <Input id="t-name" name="name" placeholder="e.g. Technology IC Memo" className="h-8 text-sm" required />
                            </div>
                            <Button size="sm" className="w-full max-w-xs" type="submit" disabled={loading}>
                                {loading ? "Uploading..." : "Upload Template"}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
