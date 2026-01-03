import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Deal } from "@/components/deal/columns"
import { Building2, MessageSquare, Paperclip } from "lucide-react"

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
        data: { type: "Deal", deal },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={{ ...style, touchAction: "none" }}
                className="h-[80px] w-full rounded-md border-2 border-blue-500/50 bg-white shadow-xl opacity-90 cursor-grabbing rotate-2"
            />
        )
    }

    // Mock data for UI if missing
    // @ts-ignore
    const value = deal.value ? deal.value.toLocaleString() : "5,000"
    const contact = "John Smith" // placeholder

    return (
        <div
            ref={setNodeRef}
            style={{ ...style, touchAction: "none" }}
            {...attributes}
            {...listeners}
            className="group outline-none touch-none"
        >
            <div className="bg-white rounded-md border border-slate-200 p-2 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group-hover:border-blue-400 group-hover:ring-1 group-hover:ring-blue-400/20">
                <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-sm bg-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-[10px] font-bold">{deal.name.charAt(0)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight truncate" title={deal.name}>
                            {deal.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 mt-0.5 truncate">New opportunity</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
