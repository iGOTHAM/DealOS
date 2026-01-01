import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CreateOrgForm } from "@/components/create-org-form"

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
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950/50">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-zinc-950 [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-20" />
            <CreateOrgForm />
        </div>
    )
}
