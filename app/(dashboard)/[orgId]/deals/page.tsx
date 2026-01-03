
import { createClient } from "@/lib/supabase/server"
import { Deal, columns } from "@/components/deal/columns"
import { DataTable } from "@/components/ui/data-table"
import { DealsView } from "@/components/deal/deals-view"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { CreateDealDialog } from "@/components/dashboard/create-deal-dialog"

async function getData(orgId: string): Promise<Deal[]> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('deals')
        .select('*')
        .eq('org_id', orgId)
        .order('updated_at', { ascending: false })

    return (data as Deal[]) || []
}

export default async function DealsPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = await params
    const data = await getData(orgId)

    return (
        <div className="container mx-auto py-10 h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Deals</h1>
                <CreateDealDialog orgId={orgId}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Deal
                    </Button>
                </CreateDealDialog>
            </div>
            <DealsView deals={data} orgId={orgId} />
        </div>
    )
}
