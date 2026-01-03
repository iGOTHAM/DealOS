"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, Loader2, Plus, FileText, X } from "lucide-react"
import { createDeal } from "@/app/(dashboard)/actions"

interface CreateDealDialogProps {
    orgId: string
    children?: React.ReactNode
}

export function CreateDealDialog({ orgId, children }: CreateDealDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const [title, setTitle] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
            setFiles((prev) => [...prev, ...newFiles])

            // Auto-set title if empty
            if (!title) {
                const name = newFiles[0].name.split('.').slice(0, -1).join('.')
                setTitle(name)
            }
        }
    }

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        formData.append("orgId", orgId)
        formData.append("title", title || "Untitled Notebook")

        files.forEach((file) => {
            formData.append("files", file)
        })

        const result = await createDeal(formData)

        if (result?.error) {
            console.error(result.error)
            setLoading(false)
        } else {
            setOpen(false)
            setFiles([])
            setTitle("")
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="gap-2 h-9 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-none font-medium text-sm transition-colors">
                        <Plus className="h-4 w-4" /> New Deal
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] h-[600px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden bg-white flex flex-col items-center justify-center">
                <form onSubmit={handleSubmit} className="flex flex-col h-full w-full max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="p-8 pb-2 flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-[28px] font-normal text-[#202124] tracking-tight">Add sources</DialogTitle>
                            <p className="text-sm text-slate-500 max-w-2xl">
                                Sources let DealOS base its responses on the information that matters most to you.
                                <br />
                                (Examples: financial statements, legal contracts, research reports, meeting transcripts, etc.)
                            </p>
                        </div>
                    </div>

                    {/* Main Dropzone Area */}
                    <div className="flex-1 px-8 py-4 flex flex-col">
                        <div
                            className="flex-1 border-2 border-dashed border-[#DADCE0] rounded-xl flex flex-col items-center justify-center text-center space-y-4 hover:bg-[#F8F9FA] hover:border-[#1A73E8] transition-colors cursor-pointer relative"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="h-12 w-12 bg-[#E8F0FE] rounded-full flex items-center justify-center text-[#1967D2]">
                                <UploadCloud className="h-6 w-6" />
                            </div>

                            <div className="space-y-1">
                                <p className="text-base font-medium text-[#202124]">
                                    Upload sources
                                </p>
                                <p className="text-sm text-[#5F6368]">
                                    Drag & drop or <span className="text-[#1A73E8] hover:underline">choose file</span> to upload
                                </p>
                            </div>

                            <p className="text-xs text-[#9AA0A6] max-w-md mt-4">
                                Supported file types: PDF, .txt, Markdown, Audio (e.g. mp3), .docx, .xlsx, .csv
                            </p>

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.md,.csv,.mp3,.wav"
                            />

                            {/* Live File Preview Overlay */}
                            {files.length > 0 && (
                                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-200">
                                    <h3 className="text-lg font-medium text-[#202124] mb-4">Ready to create deal</h3>

                                    <div className="flex flex-wrap gap-2 justify-center max-w-lg mb-6 max-h-[200px] overflow-y-auto px-4 custom-scrollbar">
                                        {files.map((file, i) => (
                                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#DADCE0] rounded-full text-sm text-[#3C4043] shadow-sm">
                                                <FileText className="h-4 w-4 text-[#1967D2]" />
                                                <span className="truncate max-w-[150px]">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                                    className="ml-1 text-[#5F6368] hover:text-[#202124]"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Title Input only shown when files are selected */}
                                    <div className="w-full max-w-sm mb-6 px-4">
                                        <Input
                                            name="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Deal Name"
                                            className="text-center font-medium border-0 border-b border-[#DADCE0] rounded-none focus-visible:ring-0 focus-visible:border-[#1A73E8] px-0 shadow-none text-lg"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={(e) => { e.stopPropagation(); setFiles([]); }}
                                            className="rounded-full px-6"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            onClick={(e) => e.stopPropagation()}
                                            className="rounded-full px-6 bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-none"
                                        >
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Create Deal
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Features Row (Visual Only for faithfulness) */}
                    <div className="p-8 pt-2 grid grid-cols-3 gap-4">
                        <div className="border border-[#DADCE0] rounded-xl p-4 flex items-center gap-3 cursor-not-allowed opacity-60">
                            <div className="h-8 w-8 rounded-full bg-[#F1F3F4] flex items-center justify-center">
                                <svg className="h-4 w-4 text-[#5F6368]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                </svg>
                            </div>
                            <span className="font-medium text-[#3C4043] text-sm">Google Drive</span>
                        </div>
                        <div className="border border-[#DADCE0] rounded-xl p-4 flex items-center gap-3 cursor-not-allowed opacity-60">
                            <div className="h-8 w-8 rounded-full bg-[#F1F3F4] flex items-center justify-center">
                                <svg className="h-4 w-4 text-[#5F6368]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </svg>
                            </div>
                            <span className="font-medium text-[#3C4043] text-sm">Link</span>
                        </div>
                        <div className="border border-[#DADCE0] rounded-xl p-4 flex items-center gap-3 cursor-not-allowed opacity-60">
                            <div className="h-8 w-8 rounded-full bg-[#F1F3F4] flex items-center justify-center">
                                <svg className="h-4 w-4 text-[#5F6368]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                                </svg>
                            </div>
                            <span className="font-medium text-[#3C4043] text-sm">Paste text</span>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
