
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardRootPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }
    console.log("Logged in user:", user.id, user.email)


    // Get first org
    const { data: membership } = await supabase
        .from('org_memberships')
        .select('org_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

    if (membership) {
        redirect(`/${membership.org_id}/deals`)
    } else {
        // Redirect to create org page or show empty state
        // For MVP, if no org, maybe just show a "Create Org" screen here
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold">Welcome to DealOS</h1>
                <p>You are not a member of any organization yet.</p>
                {/* Basic Create Org Button or form could go here */}
            </div>
        )
    }
}
