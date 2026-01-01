"use server"

import { createClient } from "@/lib/supabase/server"
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

    // Create Organization
    const { data: org, error: orgError } = await supabase
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
    const { error: memberError } = await supabase
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
    redirect(`/${org.id}/deals`)
}
