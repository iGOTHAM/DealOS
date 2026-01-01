
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DocumentUploader } from "@/components/document/document-uploader"
import { DocumentList } from "@/components/document/document-list"
import { ChatInterface } from "@/components/analysis/chat-interface"
import { Button } from "@/components/ui/button"
import { DealCharts } from "@/components/analytics/deal-charts"
import { MemoGenerator } from "@/components/memo/memo-generator"

async function getDeal(dealId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('deals')
        .select('*, tasks(*)')
        .eq('id', dealId)
        .single()

    if (error || !data) return null
    return data
}

export default async function DealDetailPage({ params }: { params: { orgId: string, dealId: string } }) {
    const deal = await getDeal(params.dealId)
    if (!deal) notFound()

    return (
        <div className="container mx-auto py-10 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{deal.name}</h1>
                    <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{deal.stage}</Badge>
                        {deal.sector && <Badge variant="outline">{deal.sector}</Badge>}
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
                    <TabsTrigger value="memo">IC Memo</TabsTrigger>
                </TabsList>

                <div className="mt-4 flex-1">
                    <TabsContent value="overview">
                        <Card>
                            <CardHeader>
                                <CardTitle>Deal Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold text-sm text-muted-foreground">Geography</h3>
                                        <p>{deal.geography || "N/A"}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-muted-foreground">Source</h3>
                                        <p>{deal.source || "N/A"}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-muted-foreground">Probability</h3>
                                        <p>{deal.probability}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Tasks would go here */}
                    </TabsContent>
                    <TabsContent value="documents">
                        <div className="flex flex-col gap-6">
                            <div className="w-full max-w-sm">
                                <DocumentUploader dealId={params.dealId} orgId={params.orgId} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-2">Files</h3>
                                <DocumentList dealId={params.dealId} />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="analysis">
                        <div className="flex gap-6">
                            <div className="w-2/3">
                                <ChatInterface dealId={params.dealId} />
                            </div>
                            <div className="w-1/3 space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">One-Click Analysis</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button variant="outline" className="w-full justify-start text-xs">Opportunity Snapshot</Button>
                                        <Button variant="outline" className="w-full justify-start text-xs">Momentum Analysis</Button>
                                        <Button variant="outline" className="w-full justify-start text-xs">Competitor Landscape</Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="dashboards">
                        <DealCharts />
                    </TabsContent>
                    <TabsContent value="memo">
                        <MemoGenerator dealId={params.dealId} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
