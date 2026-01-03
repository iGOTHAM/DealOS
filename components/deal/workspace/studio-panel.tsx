"use client"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ActionRunner } from "@/components/deal/studio/action-runner"
import {
    Briefcase,
    Scale,
    AlertTriangle,
    Lightbulb,
    FileText,
    PenTool,
    Play,
    Calculator
} from "lucide-react"

export function StudioPanel({ orgId }: { orgId: string }) {
    const actions = [
        {
            title: "Financial Deep Dive",
            description: "Analyze historicals & projections",
            icon: Briefcase,
            color: "text-emerald-600 bg-emerald-50",
        },
        {
            title: "Create Financial Model",
            description: "Generate preliminary LBO/DCF",
            icon: Calculator,
            color: "text-green-600 bg-green-50",
        },
        {
            title: "Legal Review",
            description: "Identify key legal risks",
            icon: Scale,
            color: "text-blue-600 bg-blue-50",
        },
        {
            title: "Risks Assessment",
            description: "Market, operational & team risks",
            icon: AlertTriangle,
            color: "text-amber-600 bg-amber-50",
        },
        {
            title: "Growth Opportunities",
            description: "Synergies & market expansion",
            icon: Lightbulb,
            color: "text-purple-600 bg-purple-50",
        },
        {
            title: "Draft IC Memo",
            description: "Generate preliminary Investment Memo",
            icon: FileText,
            color: "text-rose-600 bg-rose-50",
        },
        {
            title: "Draft LOI",
            description: "Create Letter of Intent",
            icon: PenTool,
            color: "text-indigo-600 bg-indigo-50",
        },
    ]

    return (
        <Card className="h-full border-none shadow-none rounded-none bg-secondary/10 flex flex-col">
            <CardHeader className="pb-2 px-4 pt-4 border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Studio</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-3">
                    <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl mb-4">
                        <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                            Use these tools to generate in-depth outputs from your deal sources.
                        </p>
                    </div>

                    {actions.map((action) => (
                        <ActionRunner key={action.title} action={action} orgId={orgId}>
                            <div
                                className="group flex flex-col p-3 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className={`h-8 w-8 rounded-lg ${action.color} flex items-center justify-center`}>
                                        <action.icon className="h-4 w-4" />
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary">
                                        <Play className="h-3 w-3 fill-current" />
                                    </Button>
                                </div>
                                <h3 className="text-sm font-semibold text-foreground mb-0.5">{action.title}</h3>
                                <p className="text-xs text-muted-foreground">{action.description}</p>
                            </div>
                        </ActionRunner>
                    ))}
                </div>
            </ScrollArea>
        </Card>
    )
}
