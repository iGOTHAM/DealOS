
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Deal } from "@/components/deal/columns"
import Link from "next/link"

interface KanbanCardProps {
    deal: Deal
}

export function KanbanCard({ deal }: KanbanCardProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: deal.id,
        data: {
            type: "Deal",
            deal,
        },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="h-[100px] w-full rounded-md border border-primary/50 bg-background opacity-50"
            />
        )
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card className="cursor-grab hover:shadow-md">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium leading-none">
                        {deal.name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                    <div className="mt-2">
                        Prob: {deal.probability}%
                    </div>
                    {/* Link to detail page disabled during drag usually, but we can make the whole card clickable or add a button */}
                </CardContent>
            </Card>
        </div>
    )
}
