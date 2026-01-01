
import { SortableContext, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useMemo } from "react"
import { Column } from "@/components/deal/kanban-board"
import { Deal } from "@/components/deal/columns"
import { KanbanCard } from "@/components/deal/kanban-card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface KanbanColumnProps {
    column: Column
    deals: Deal[]
}

export function KanbanColumn({ column, deals }: KanbanColumnProps) {
    // We use the column as a droppable zone. 
    // dnd-kit SortableContext needs a list of items for sorting.

    const dealIds = useMemo(() => deals.map((d) => d.id), [deals])

    const { isOver, setNodeRef } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
        disabled: true, // We don't drag columns for now
    })

    // We need a specific droppable for the empty area or the column itself

    return (
        <div
            ref={setNodeRef}
            className={`flex h-full w-[350px] min-w-[350px] flex-col rounded-md bg-muted/50 p-2 ${isOver ? "ring-2 ring-primary" : ""
                }`}
        >
            <div className="mb-2 flex items-center justify-between p-2 font-semibold">
                <span>{column.title}</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                    {deals.length}
                </span>
            </div>

            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-2 p-1">
                    <SortableContext items={dealIds}>
                        {deals.map((deal) => (
                            <KanbanCard key={deal.id} deal={deal} />
                        ))}
                    </SortableContext>
                </div>
            </ScrollArea>
        </div>
    )
}
