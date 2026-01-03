import { DashboardHeader } from "@/components/layout/dashboard-header"
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

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <div className="hidden w-64 flex-col md:flex fixed inset-y-0 z-50">
                <Sidebar orgId={orgId} />
            </div>
            <div className="flex flex-col flex-1 md:pl-64">
                <DashboardHeader orgId={orgId} />
                <main className="flex-1 overflow-y-auto bg-secondary/30 p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
