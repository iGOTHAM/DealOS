
"use client"

import { useState } from "react"
import { Deal } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { KanbanBoard } from "./kanban-board"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, List } from "lucide-react"

export function DealsView({ deals, orgId }: { deals: Deal[], orgId: string }) {
    const [view, setView] = useState("list")

    return (
        <Tabs defaultValue="list" className="w-full" onValueChange={setView}>
            <div className="flex items-center justify-between mb-4">
                <TabsList>
                    <TabsTrigger value="list"><List className="mr-2 h-4 w-4" /> List</TabsTrigger>
                    <TabsTrigger value="kanban"><LayoutGrid className="mr-2 h-4 w-4" /> Kanban</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="list">
                <DataTable columns={columns} data={deals} />
            </TabsContent>
            <TabsContent value="kanban">
                <KanbanBoard initialDeals={deals} orgId={orgId} />
            </TabsContent>
        </Tabs>
    )
}
