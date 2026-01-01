
import { Sidebar } from "@/components/layout/sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ orgId: string }>
}) {
    const { orgId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Ideally verify org membership here
    // const { data: membership } = await supabase.from('org_memberships').select('role').eq('org_id', params.orgId).eq('user_id', user.id).single()
    // if (!membership) redirect('/select-org')

    return (
        <div className="flex min-h-screen">
            <div className="hidden w-64 flex-col md:flex">
                <Sidebar orgId={orgId} />
            </div>
            <main className="flex-1 overflow-y-auto bg-muted/20 p-8">
                {children}
            </main>
        </div>
    )
}
