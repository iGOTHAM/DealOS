"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

const integrations = [
    { name: "Stripe", type: "Finance", rate: 40, profit: 650.00, icon: "S", color: "bg-indigo-600" },
    { name: "Zapier", type: "CRM", rate: 80, profit: 720.50, icon: "Z", color: "bg-orange-500" },
    { name: "Shopify", type: "Marketplace", rate: 20, profit: 432.25, icon: "S", color: "bg-emerald-500" },
]

export function IntegrationsList() {
    return (
        <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-semibold">List of Integration</CardTitle>
                <Button variant="link" size="sm" className="text-primary text-xs font-semibold h-fit p-0">
                    See All
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground px-2">
                        <div className="col-span-1"></div>
                        <div className="col-span-4">APPLICATION</div>
                        <div className="col-span-3">TYPE</div>
                        <div className="col-span-2">RATE</div>
                        <div className="col-span-2 text-right">PROFIT</div>
                    </div>
                    {integrations.map((item) => (
                        <div key={item.name} className="grid grid-cols-12 items-center px-2 py-2 hover:bg-secondary/50 rounded-lg transition-colors group">
                            <div className="col-span-1">
                                <Checkbox className="rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                            </div>
                            <div className="col-span-4 flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-lg ${item.color} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                                    {item.icon}
                                </div>
                                <span className="font-semibold text-sm">{item.name}</span>
                            </div>
                            <div className="col-span-3 text-sm text-muted-foreground">
                                {item.type}
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                                <div className="h-1.5 w-12 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: `${item.rate}%` }}></div>
                                </div>
                                <span className="text-xs font-medium">{item.rate}%</span>
                            </div>
                            <div className="col-span-2 text-right text-sm font-semibold">
                                ${item.profit.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
