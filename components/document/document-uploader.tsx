
"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload } from "lucide-react"
import { useRouter } from "next/navigation"

export function DocumentUploader({ dealId, orgId }: { dealId: string, orgId: string }) {
    const [file, setFile] = useState<File | null>(null)
    const [docType, setDocType] = useState<string>("Overview")
    const [uploading, setUploading] = useState(false)
    const router = useRouter()

    async function onUpload() {
        if (!file) return
        setUploading(true)
        const supabase = createClient()

        try {
            // 1. Upload to Storage
            // Ensure 'deal-docs' bucket exists and RLS allows upload
            const fileExt = file.name.split('.').pop()
            const filePath = `${orgId}/${dealId}/${crypto.randomUUID()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('deal-docs')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Insert into documents table
            const { data: docData, error: dbError } = await supabase
                .from('documents')
                .insert({
                    deal_id: dealId,
                    name: file.name,
                    type: docType,
                })
                .select()
                .single()

            if (dbError) throw dbError

            // 3. Insert into document_versions
            const versionResult = await supabase
                .from('document_versions')
                .insert({
                    document_id: docData.id,
                    version_number: 1,
                    file_path: filePath,
                    status: 'uploaded' // Trigger for Edge Function
                })
                .select()
                .single()

            if (versionResult.error) throw versionResult.error
            const versionData = versionResult.data

            // 4. Trigger Processing (Edge Function)
            try {
                const { error: funcError } = await supabase.functions.invoke('process_document_version', {
                    body: { record: { id: versionData.id } }
                })
                if (funcError) console.warn("Auto-processing trigger failed:", funcError)
            } catch (err) {
                console.warn("Processing trigger error (non-blocking):", err)
            }

            // Reset
            setFile(null)
            router.refresh()
        } catch (error) {
            console.error("Upload failed", error)
            // Toast error
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="grid w-full max-w-sm items-center gap-1.5 p-4 border rounded-lg bg-card">
            <Label htmlFor="doc-type">Document Type</Label>
            <Select onValueChange={setDocType} defaultValue={docType}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Overview">Overview / CIM</SelectItem>
                    <SelectItem value="Financials">Financials (Excel/CSV)</SelectItem>
                    <SelectItem value="Legal">Legal / Contracts</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
            </Select>

            <Label htmlFor="file" className="mt-2">File</Label>
            <Input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <Button onClick={onUpload} disabled={!file || uploading} className="mt-4 w-full">
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload
            </Button>
        </div>
    )
}
