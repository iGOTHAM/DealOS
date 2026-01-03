import { createClient } from "@/lib/supabase/server"
import { DealCard } from "@/components/dashboard/deal-card"
import { CreateDealDialog } from "@/components/dashboard/create-deal-dialog"
import { KanbanBoard } from "@/components/deal/kanban-board"
import { Search, SlidersHorizontal, ArrowUpDown, LayoutGrid, Kanban } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

async function getDeals(orgId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('deals')
        .select('*')
        .eq('org_id', orgId)
        .order('updated_at', { ascending: false })

    return data || []
}

export default async function DashboardPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = await params
    const deals = await getDeals(orgId)

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search deals, contacts..."
                        className="pl-9 rounded-md bg-white border-slate-200 shadow-sm focus-visible:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center bg-white border border-slate-200 rounded-md p-1 shadow-sm">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                            <SlidersHorizontal className="h-3.5 w-3.5 mr-1" /> Filter
                        </Button>
                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                            <ArrowUpDown className="h-3.5 w-3.5 mr-1" /> Sort
                        </Button>
                    </div>
                    <CreateDealDialog orgId={orgId} />
                </div>
            </div>

            <Tabs defaultValue="pipeline" className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4 border-b border-slate-200">
                    <TabsList className="h-auto p-0 bg-transparent gap-6">
                        <TabsTrigger
                            value="pipeline"
                            className="h-10 rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none font-medium text-slate-500"
                        >
                            <Kanban className="h-4 w-4 mr-2" /> Pipeline
                        </TabsTrigger>
                        <TabsTrigger
                            value="notebooks"
                            className="h-10 rounded-none border-b-2 border-transparent px-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none font-medium text-slate-500"
                        >
                            <LayoutGrid className="h-4 w-4 mr-2" /> List View
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="pipeline" className="flex-1 mt-0 overflow-hidden">
                    <KanbanBoard initialDeals={deals} orgId={orgId} />
                </TabsContent>

                <TabsContent value="notebooks" className="mt-0 space-y-4">
                    {deals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-border/50 rounded-3xl bg-secondary/5">
                            {/* Empty state same as before */}
                            <h3 className="text-xl font-semibold mb-2">No deals yet</h3>
                            <p className="text-muted-foreground text-center mb-6">Create a deal to get started.</p>
                            <CreateDealDialog orgId={orgId} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {deals.map((deal) => (
                                <DealCard
                                    key={deal.id}
                                    id={deal.id}
                                    title={deal.name}
                                    orgId={orgId}
                                    updatedAt={deal.updated_at}
                                    sourceCount={0}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
