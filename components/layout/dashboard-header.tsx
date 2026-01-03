"use client"

import { Bell, Search, HelpCircle, Gift, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/layout/sidebar"

export function DashboardHeader({ orgId }: { orgId: string }) {
    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex w-full max-w-md items-center space-x-2">
                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden mr-2">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 bg-[#0F172A] border-[#1E293B]">
                        <Sidebar orgId={orgId} className="border-none" />
                    </SheetContent>
                </Sheet>

                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full bg-secondary/50 pl-9 md:w-[300px] lg:w-[400px] rounded-full border-transparent focus-visible:bg-background focus-visible:ring-primary/20"
                    />
                    <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 hidden sm:flex">
                            <span className="text-xs">⌘</span>F
                        </kbd>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full hidden sm:flex">
                    <Gift className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full hidden sm:flex">
                    <HelpCircle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-background"></span>
                </Button>

                <div className="h-8 w-px bg-border/50 mx-1 hidden sm:block"></div>

                <div className="flex items-center gap-3 pl-1">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold leading-none">Young Alaska</p>
                        <p className="text-xs text-muted-foreground">Business</p>
                    </div>
                    <Avatar className="h-9 w-9 border-2 border-background ring-2 ring-border/50">
                        <AvatarImage src="/placeholder-user.jpg" alt="User" />
                        <AvatarFallback>YA</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    )
}
