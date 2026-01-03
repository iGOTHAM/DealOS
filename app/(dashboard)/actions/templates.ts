"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getTemplates(orgId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('memo_templates')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching templates:", error)
        return []
    }

    // Transform database rows to UI Template format
    return data.map(row => ({
        id: row.id,
        name: row.name,
        // Fallback or read from structure_json if it was a file upload
        type: row.structure_json?.type || 'json',
        isDefault: false, // Database templates are custom uploads
        filePath: row.structure_json?.filePath
    }))
}

export async function uploadTemplate(formData: FormData) {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const file = formData.get("file") as File
    const name = formData.get("name") as string
    const orgId = formData.get("orgId") as string
    const type = formData.get("type") as string // 'word' | 'excel' | 'json'

    if (!file || !name || !orgId) return { error: "Missing fields" }

    // 2. Ensure Storage Bucket Exists (Using Admin Client)
    const { data: buckets } = await adminClient.storage.listBuckets()
    if (!buckets?.find(b => b.name === 'templates')) {
        await adminClient.storage.createBucket('templates', { public: true })
    }

    // 3. Upload File
    const fileExt = file.name.split('.').pop()
    const filePath = `${orgId}/${Date.now()}-${name.replace(/[^a-z0-9]/gi, '_')}.${fileExt}`

    const { error: uploadError } = await adminClient.storage
        .from('templates')
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false
        })

    if (uploadError) {
        console.error("Upload Error:", uploadError)
        return { error: "Failed to upload file" }
    }

    // 4. Create Database Record
    // Storing metadata in structure_json to avoid schema migration
    const metadata = {
        type: type,
        originalName: file.name,
        filePath: filePath,
        mimeType: file.type
    }

    const { error: dbError } = await adminClient
        .from('memo_templates')
        .insert({
            org_id: orgId,
            name: name,
            description: "Custom uploaded template",
            structure_json: metadata, // Storing file metadata here
            tone_voice: "Standard"
        })

    if (dbError) {
        console.error("DB Error:", dbError)
        // Cleanup file if DB fails? Ideally yes, but skipping for MVP
        return { error: "Failed to save template record" }
    }

    revalidatePath(`/${orgId}`)
    return { success: true }
}
