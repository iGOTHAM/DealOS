"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Filter, MoreHorizontal, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from "recharts"

const data = [
    { name: "Oct", value: 2400 },
    { name: "Nov", value: 1398 },
    { name: "Dec", value: 4000 },
    { name: "Jan", value: 3000 },
    { name: "Feb", value: 2000 },
    { name: "Mar", value: 2780 },
    { name: "Apr", value: 1890 },
    { name: "May", value: 2390 },
    { name: "Jun", value: 3490 },
]

export function SalesChart() {
    return (
        <Card className="col-span-1 md:col-span-2 rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        Sales Overview
                    </CardTitle>
                    <div className="mt-2">
                        <div className="text-2xl font-bold">$9,257.51</div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                15.8% ↗
                            </span>
                            <span className="text-xs text-muted-foreground">
                                +$143.50 increased
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 border-border/50">
                        <Filter className="h-3 w-3" /> Filter
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 border-border/50">
                        <ArrowUpRight className="h-3 w-3" /> Sort
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pl-0">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis
                                dataKey="name"
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="var(--chart-1)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
