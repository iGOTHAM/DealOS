"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    BarChart3,
    Briefcase,
    FileText,
    Home,
    PieChart,
    Settings,
    CreditCard,
    Users,
    MessageSquare,
    Package,
    Receipt,
    Activity,
    Cpu,
    Shield,
    HelpCircle,
    Building2,
    ChevronLeft
} from "lucide-react"

import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button" 

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    orgId: string
}

type SidebarItem = {
    href: string
    label: string
    icon: any
    active: boolean
    badge?: number
    tag?: string
}

type SidebarSection = {
    title: string
    items: SidebarItem[]
}

export function Sidebar({ className, orgId }: SidebarProps) {
    const pathname = usePathname()

    const sections: SidebarSection[] = [
        {
            title: "MAIN",
            items: [
                {
                    href: `/${orgId}`,
                    label: "Dashboard",
                    icon: Home,
                    active: pathname === `/${orgId}`,
                },
                {
                    href: `/${orgId}/deals`, // Future proofing, though same as dashboard for now
                    label: "Deals",
                    icon: Briefcase,
                    active: pathname.includes("/deals"),
                },
            ]
        },
        {
            title: "SYSTEM",
            items: [
                {
                    href: `/${orgId}/settings`,
                    label: "Settings",
                    icon: Settings,
                    active: pathname.includes("/settings"),
                },
                {
                    href: `/${orgId}/help`,
                    label: "Help & Support",
                    icon: HelpCircle,
                    active: pathname.includes("/help"),
                },
            ]
        }
    ]

    return (
        <div className={cn("pb-12 h-screen border-r border-[#1E293B] bg-[#0F172A] text-slate-400 flex flex-col", className)}>
            <div className="p-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-3 font-bold text-xl text-white font-sans tracking-tight">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    DealOS
                </div>
            </div>

            <div className="space-y-6 px-3 py-4 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {sections.map((section) => (
                    <div key={section.title}>
                        <h4 className="mb-2 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {section.title}
                        </h4>
                        <div className="space-y-0.5">
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center justify-between rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                                        item.active
                                            ? "bg-[#1E293B] text-white shadow-sm"
                                            : "hover:bg-[#1E293B]/50 hover:text-slate-200"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={cn("h-4 w-4 transition-transform", item.active ? "text-blue-500" : "text-slate-500 group-hover:text-slate-300")} />
                                        {item.label}
                                    </div>
                                    {item.badge && (
                                        <span className={cn("flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold", item.active ? "bg-blue-600 text-white" : "bg-[#1E293B] text-slate-500")}>
                                            {item.badge}
                                        </span>
                                    )}
                                    {item.tag && (
                                        <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-1.5 py-0.5 rounded font-bold border border-emerald-500/20">
                                            {item.tag}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 mt-auto">
                <div className="bg-[#1E293B] rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-[#0F172A]">
                            KJ
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-medium text-sm text-slate-200 truncate">King James</p>
                            <p className="text-xs text-slate-500 truncate">Admin</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] py-1.5 rounded-md transition-colors font-medium">
                            Settings
                        </button>
                        <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] py-1.5 rounded-md transition-colors font-medium">
                            Log out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
