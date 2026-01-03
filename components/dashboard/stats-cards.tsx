"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, DollarSign, Eye, Info } from "lucide-react"

export function StatsCards() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-2xl border border-border/50 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <div className="p-2 bg-secondary rounded-lg">
                            <Eye className="h-4 w-4 text-foreground" />
                        </div>
                        Page Views
                    </CardTitle>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline space-x-2">
                        <div className="text-2xl font-bold">12,450</div>
                        <div className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            +15.8% ↗
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="rounded-2xl border border-border/50 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <div className="p-2 bg-secondary rounded-lg">
                            <DollarSign className="h-4 w-4 text-foreground" />
                        </div>
                        Total Revenue
                    </CardTitle>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline space-x-2">
                        <div className="text-2xl font-bold">$363.95</div>
                        <div className="text-xs font-medium text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                            -34.0% ↘
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="rounded-2xl border border-border/50 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <div className="p-2 bg-secondary rounded-lg">
                            <Activity className="h-4 w-4 text-foreground" />
                        </div>
                        Bounce Rate
                    </CardTitle>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline space-x-2">
                        <div className="text-2xl font-bold">86.5%</div>
                        <div className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            +24.2% ↗
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
