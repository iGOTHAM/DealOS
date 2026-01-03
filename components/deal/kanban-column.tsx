
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
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

// Helper for column colors
const getColumnColor = (id: string) => {
    switch (id) {
        case "Sourced": return "border-blue-400"
        case "NDA": return "border-indigo-400"
        case "CIM Review": return "border-purple-400"
        case "IOI": return "border-pink-400"
        case "LOI": return "border-orange-400"
        case "Diligence": return "border-yellow-400"
        case "Final IC": return "border-emerald-400"
        case "Closed Won": return "border-green-500"
        case "Closed Lost": return "border-red-400"
        default: return "border-gray-300"
    }
}

export function KanbanColumn({ column, deals }: KanbanColumnProps) {
    const dealIds = useMemo(() => deals.map((d) => d.id), [deals])

    const { isOver, setNodeRef } = useSortable({
        id: column.id,
        data: { type: "Column", column },
        disabled: true,
    })

    const borderColor = getColumnColor(column.id)

    return (
        <div
            ref={setNodeRef}
            className={`flex h-full w-[200px] min-w-[200px] flex-col bg-[#F1F5F9] rounded-none first:rounded-l-lg last:rounded-r-lg ${isOver ? "bg-slate-200" : ""}`}
        >
            {/* Header with Top Border */}
            <div className={`mb-2 bg-white px-2 py-1.5 border-t-[3px] ${borderColor} shadow-sm mx-1.5 mt-1.5 rounded-sm`}>
                <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs text-slate-900 truncate">{column.title}</span>
                    <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0 rounded-full">
                        {deals.length}
                    </span>
                </div>
                <div className="text-[9px] text-slate-400 font-medium">
                    ${deals.reduce((acc, d) => acc + (d.value || 0), 0).toLocaleString()}
                </div>
            </div>

            <ScrollArea className="flex-1 px-2 pb-2">
                <div className="flex flex-col gap-3">
                    <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
                        {deals.map((deal) => (
                            <KanbanCard key={deal.id} deal={deal} />
                        ))}
                    </SortableContext>
                </div>
            </ScrollArea>
        </div>
    )
}
