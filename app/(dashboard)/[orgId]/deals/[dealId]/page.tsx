import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { SourcePanel } from "@/components/deal/workspace/source-panel"
import { ChatPanel } from "@/components/deal/workspace/chat-panel"
import { StudioPanel } from "@/components/deal/workspace/studio-panel"

async function getDeal(dealId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single()

    return data
}

export default async function DealWorkspacePage({ params }: { params: Promise<{ orgId: string, dealId: string }> }) {
    const { dealId, orgId } = await params
    const deal = await getDeal(dealId)

    if (!deal) {
        return notFound()
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
            {/* Left: Sources */}
            <div className="w-80 border-r border-border/50 hidden md:block">
                <SourcePanel />
            </div>

            {/* Center: Chat / Analysis */}
            <div className="flex-1 min-w-0">
                <ChatPanel dealName={deal.name} />
            </div>

            {/* Right: Studio */}
            <div className="w-80 border-l border-border/50 hidden xl:block">
                <StudioPanel orgId={orgId} />
            </div>
        </div>
    )
}
