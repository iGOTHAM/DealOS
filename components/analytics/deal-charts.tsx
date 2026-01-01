
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
    {
        name: "Jan",
        revenue: 4000,
        margin: 2400,
    },
    {
        name: "Feb",
        revenue: 3000,
        margin: 1398,
    },
    {
        name: "Mar",
        revenue: 2000,
        margin: 9800,
    },
    {
        name: "Apr",
        revenue: 2780,
        margin: 3908,
    },
    {
        name: "May",
        revenue: 1890,
        margin: 4800,
    },
    {
        name: "Jun",
        revenue: 2390,
        margin: 3800,
    },
]

export function DealCharts() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>Monthly revenue vs margin</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="margin" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Revenue Concentration</CardTitle>
                    <CardDescription>Top customers by revenue</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[350px] text-muted-foreground border-dashed border-2 rounded-md m-4">
                    Upload Customer List CSV to view
                </CardContent>
            </Card>
        </div>
    )
}
