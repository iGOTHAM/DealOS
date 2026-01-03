"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createOrganization(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const name = formData.get("name") as string
    if (!name || name.length < 3) {
        return { error: "Organization name must be at least 3 characters." }
    }

    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")

    const supabaseAdmin = createAdminClient()

    // Create Organization
    const { data: org, error: orgError } = await supabaseAdmin
        .from("organizations")
        .insert({
            name,
            slug,
        })
        .select()
        .single()

    if (orgError) {
        if (orgError.code === "23505") { // Unique violation for slug
            return { error: "Organization with this name already exists." }
        }
        return { error: orgError.message }
    }

    // Create Membership
    const { error: memberError } = await supabaseAdmin
        .from("org_memberships")
        .insert({
            org_id: org.id,
            user_id: user.id,
            role: "owner", // Default to owner
        })

    if (memberError) {
        return { error: memberError.message }
    }

    revalidatePath("/")
    revalidatePath("/")
    redirect(`/${org.id}`)
}

export async function createDeal(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const title = formData.get("title") as string
    const orgId = formData.get("orgId") as string

    if (!title || title.length < 2) {
        return { error: "Deal name must be at least 2 characters." }
    }
    if (!orgId) {
        return { error: "Organization ID is required." }
    }

    // Default to 'active' status and 'lead' stage for now
    // Note: Schema uses 'name' not 'title'
    const { data: deal, error } = await supabase
        .from("deals")
        .insert({
            name: title,
            org_id: orgId,
            stage: "lead",
            // close_date: new Date().toISOString() // Schema might not have this column yet based on migration 000
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    // ... deal creation above ...

    // Handle File Uploads
    const files = formData.getAll("files") as File[]
    if (files && files.length > 0 && files[0].size > 0) {
        const supabaseAdmin = createAdminClient()

        // Ensure bucket
        const { data: buckets } = await supabaseAdmin.storage.listBuckets()
        if (!buckets?.find(b => b.name === 'deal_documents')) {
            await supabaseAdmin.storage.createBucket('deal_documents', { public: false })
        }

        for (const file of files) {
            // 1. Upload to Storage
            const filePath = `${orgId}/${deal.id}/${Date.now()}-${file.name}`
            const { error: uploadError } = await supabaseAdmin.storage
                .from('deal_documents')
                .upload(filePath, file, { contentType: file.type })

            if (uploadError) {
                console.error("Failed to upload file:", file.name, uploadError)
                continue
            }

            // 2. Insert into 'documents'
            const { data: doc, error: docError } = await supabaseAdmin
                .from('documents')
                .insert({
                    deal_id: deal.id,
                    name: file.name,
                    type: file.name.split('.').pop()?.toUpperCase() || 'FILE'
                })
                .select()
                .single()

            if (docError || !doc) {
                console.error("Failed to create document record:", docError)
                continue
            }

            // 3. Insert into 'document_versions'
            await supabaseAdmin
                .from('document_versions')
                .insert({
                    document_id: doc.id,
                    version_number: 1,
                    file_path: filePath,
                    status: 'uploaded'
                })
        }
    }

    revalidatePath(`/${orgId}`)
    redirect(`/${orgId}/deals/${deal.id}`)
}
