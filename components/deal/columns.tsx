
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define the Deal shape matching our DB
export type Deal = {
    id: string
    name: string
    sector: string | null
    geography: string | null
    source: string | null
    stage: string | null
    probability: number | null
    updated_at: string
}

export const columns: ColumnDef<Deal>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "stage",
        header: "Stage",
    },
    {
        accessorKey: "sector",
        header: "Sector",
    },
    {
        accessorKey: "probability",
        header: "Probability",
        cell: ({ row }) => {
            const prob = parseFloat(row.getValue("probability") || "0")
            return <div className="text-right font-medium">{prob}%</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const deal = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(deal.id)}
                        >
                            Copy Deal ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>View payment details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
