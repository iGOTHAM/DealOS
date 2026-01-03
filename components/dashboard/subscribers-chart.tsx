"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip, Cell } from "recharts"

const data = [
    { name: "Sun", value: 400 },
    { name: "Mon", value: 300 },
    { name: "Tue", value: 900 }, // Peak
    { name: "Wed", value: 200 },
    { name: "Thu", value: 300 },
    { name: "Fri", value: 200 },
    { name: "Sat", value: 500 },
]

export function SubscribersChart() {
    return (
        <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        Total Subscriber
                    </CardTitle>
                    <div className="mt-2 text-2xl font-bold">24,473</div>
                    <div className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded w-fit mt-1">
                        8.3% ↗ +749 increased
                    </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 border-border/50 text-xs">
                    Weekly <ChevronDown className="h-3 w-3" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <XAxis
                                dataKey="name"
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.value > 800 ? "var(--chart-1)" : "var(--muted-foreground)"} opacity={entry.value > 800 ? 1 : 0.2} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
