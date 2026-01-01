
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Briefcase, FileText, Home, PieChart, Settings } from "lucide-react"

import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button" // Keeping it minimal

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    orgId: string
}

export function Sidebar({ className, orgId }: SidebarProps) {
    const pathname = usePathname()

    const routes = [
        {
            href: `/${orgId}/deals`,
            label: "Deals",
            icon: Briefcase,
            active: pathname.includes("/deals"),
        },
        {
            href: `/${orgId}/analysis`,
            label: "Analysis",
            icon: PieChart,
            active: pathname.includes("/analysis"),
        },
        {
            href: `/${orgId}/documents`,
            label: "Documents",
            icon: FileText,
            active: pathname.includes("/documents"),
        },
        {
            href: `/${orgId}/settings`,
            label: "Settings",
            icon: Settings,
            active: pathname.includes("/settings"),
        },
    ]

    return (
        <div className={cn("pb-12 h-screen border-r bg-background", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        DealOS
                    </h2>
                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                    route.active ? "bg-accent text-accent-foreground" : "transparent"
                                )}
                            >
                                <route.icon className="mr-2 h-4 w-4" />
                                {route.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
