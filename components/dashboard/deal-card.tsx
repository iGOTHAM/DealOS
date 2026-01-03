"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { FileText, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DealCardProps {
    id: string
    title: string
    orgId: string
    sourceCount?: number
    updatedAt: string
    gradient?: string
}

const gradients = [
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-purple-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-blue-500 to-cyan-500"
]

export function DealCard({ id, title, orgId, sourceCount = 0, updatedAt, gradient }: DealCardProps) {
    // Deterministic gradient based on ID char code sum if not provided
    const randomGradient = gradient || gradients[id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length]

    return (
        <Link href={`/${orgId}/deals/${id}`}>
            <Card className="group relative h-[280px] overflow-hidden rounded-3xl border border-border/50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className={`h-32 w-full bg-gradient-to-br ${randomGradient} opacity-90 transition-opacity group-hover:opacity-100`}>
                    <div className="absolute top-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/20 text-white hover:bg-black/40">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <CardHeader className="pt-4 pb-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-md bg-secondary flex items-center justify-center">
                            <span className="text-xs font-bold">📄</span>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notebook</span>
                    </div>
                    <h3 className="line-clamp-2 text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                </CardHeader>

                <CardFooter className="absolute bottom-0 w-full p-4 text-xs text-muted-foreground flex justify-between items-center border-t border-border/30 bg-background/50 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        <span>{sourceCount} sources</span>
                    </div>
                    <span>{new Date(updatedAt).toLocaleDateString()}</span>
                </CardFooter>
            </Card>
        </Link>
    )
}
