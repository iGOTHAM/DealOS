
"use client"

import { useMemo, useState } from "react"
import {
    DndContext,
    DragOverlay,
    useSensors,
    useSensor,
    PointerSensor,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragEndEvent,
    closestCorners,
    KeyboardSensor,
} from "@dnd-kit/core"
import { SortableContext, arrayMove } from "@dnd-kit/sortable"
import { createPortal } from "react-dom"
import { Deal } from "@/components/deal/columns"
import { KanbanColumn } from "@/components/deal/kanban-column"
import { KanbanCard } from "@/components/deal/kanban-card"
import { createClient } from "@/lib/supabase/client"

export type Column = {
    id: string
    title: string
}

const defaultColumns: Column[] = [
    { id: "Sourced", title: "Sourced" },
    { id: "NDA", title: "NDA" },
    { id: "CIM Review", title: "CIM Review" },
    { id: "IOI", title: "IOI" },
    { id: "LOI", title: "LOI" },
    { id: "Diligence", title: "Diligence" },
    { id: "Final IC", title: "Final IC" },
    { id: "Closed Won", title: "Closed Won" },
    { id: "Closed Lost", title: "Closed Lost" },
]

interface KanbanBoardProps {
    initialDeals: Deal[]
    orgId: string
}

export function KanbanBoard({ initialDeals, orgId }: KanbanBoardProps) {
    const [deals, setDeals] = useState<Deal[]>(initialDeals)
    const [activeDeal, setActiveDeal] = useState<Deal | null>(null)

    const columns = useMemo(() => defaultColumns, [])
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px movement to start drag (more responsive)
            },
        }),
        useSensor(KeyboardSensor)
    )

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Deal") {
            setActiveDeal(event.active.data.current.deal)
            return
        }
    }

    async function onDragEnd(event: DragEndEvent) {
        setActiveDeal(null)
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id // Column ID or Card ID

        const activeDeal = deals.find((d) => d.id === activeId)
        if (!activeDeal) return

        // Dropping over a column
        let newStage = activeDeal.stage

        // Check if over a column directly
        if (columns.some(c => c.id === overId)) {
            newStage = overId as string
        }
        // Check if over another card
        else {
            const overDeal = deals.find(d => d.id === overId)
            if (overDeal) {
                newStage = overDeal.stage
            }
        }

        if (activeDeal.stage !== newStage) {
            // Optimistic update
            const updatedDeals = deals.map(d =>
                d.id === activeId ? { ...d, stage: newStage } : d
            )
            setDeals(updatedDeals as Deal[]) // Type assertion needed if Deal type mismatch nulls

            // DB update
            const supabase = createClient()
            await supabase.from('deals').update({ stage: newStage }).eq('id', activeId)
        }
    }

    return (
        <div className="flex h-[calc(100vh-200px)] w-full overflow-x-auto overflow-y-hidden px-4 pb-4">
            <DndContext
                sensors={sensors}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                collisionDetection={closestCorners}
            >
                <div className="flex gap-2">
                    {columns.map((col) => (
                        <KanbanColumn
                            key={col.id}
                            column={col}
                            deals={deals.filter((d) => d.stage === col.id)}
                        />
                    ))}
                </div>

                {typeof document !== 'undefined' && createPortal(
                    <DragOverlay>
                        {activeDeal && (
                            <KanbanCard deal={activeDeal} />
                        )}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    )
}
