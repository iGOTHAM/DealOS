"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUp, Sparkles, Bot, Paperclip } from "lucide-react"

export function ChatPanel({ dealName }: { dealName: string }) {

    // Mock chat history
    const messages = [
        { id: 1, role: "assistant", content: `Hello! I've analyzed the 5 documents you uploaded for ${dealName}. I'm ready to help you evaluate this opportunity.` },
        { id: 2, role: "user", content: "What are the key risks mentioned in the legal report?" },
        { id: 3, role: "assistant", content: "Based on the Legal Diligence Report, here are the primary risks:\n\n1. **Change of Control**: The Master Services Agreement with the largest customer requires consent for any change of control.\n2. **Pending Litigation**: There is an ongoing IP dispute regarding a patent filed in 2022.\n3. **Employee Retention**: Key executive agreements have weak non-compete clauses." },
    ]

    return (
        <div className="flex flex-col h-full bg-background relative">
            {/* Header */}
            <div className="h-14 border-b border-border/50 flex items-center px-6 justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h2 className="font-semibold text-sm">Deal Analyst</h2>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
                <div className="space-y-6 max-w-3xl mx-auto">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}>
                            {msg.role === "assistant" && (
                                <Avatar className="h-8 w-8 border border-border/50 bg-secondary/50">
                                    <AvatarFallback><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`rounded-2xl px-5 py-3 text-sm leading-relaxed max-w-[80%] shadow-sm ${msg.role === "user"
                                    ? "bg-secondary text-foreground rounded-tr-sm"
                                    : "bg-white border border-border/50 text-foreground rounded-tl-sm"
                                }`}>
                                <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br/>").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") }} />
                            </div>
                        </div>
                    ))}

                    {/* Suggested Prompts (NotebookLM Style) */}
                    <div className="grid grid-cols-2 gap-2 mt-8">
                        <Button variant="outline" className="justify-start h-auto py-3 px-4 text-left text-xs text-muted-foreground bg-white hover:bg-secondary/20 hover:text-primary rounded-xl border-border/50">
                            Summarize Q3 Financial Performance
                        </Button>
                        <Button variant="outline" className="justify-start h-auto py-3 px-4 text-left text-xs text-muted-foreground bg-white hover:bg-secondary/20 hover:text-primary rounded-xl border-border/50">
                            Draft an Investment Memo Outline
                        </Button>
                        <Button variant="outline" className="justify-start h-auto py-3 px-4 text-left text-xs text-muted-foreground bg-white hover:bg-secondary/20 hover:text-primary rounded-xl border-border/50">
                            List Top 3 Competitors from CIM
                        </Button>
                        <Button variant="outline" className="justify-start h-auto py-3 px-4 text-left text-xs text-muted-foreground bg-white hover:bg-secondary/20 hover:text-primary rounded-xl border-border/50">
                            Identify Red Flags in Org Structure
                        </Button>
                    </div>
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border/50 shrink-0">
                <div className="max-w-3xl mx-auto relative group">
                    <div className="absolute left-3 top-3 p-1 rounded-md hover:bg-secondary cursor-pointer text-muted-foreground">
                        <Paperclip className="h-4 w-4" />
                    </div>
                    <Input
                        placeholder="Ask anything about this deal..."
                        className="pl-12 pr-12 h-14 rounded-full border-border/50 bg-secondary/10 focus-visible:ring-primary/20 focus-visible:bg-background text-base shadow-sm transition-all"
                    />
                    <Button size="icon" className="absolute right-2 top-2 h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-50">
                        <ArrowUp className="h-5 w-5" />
                    </Button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-muted-foreground">
                        DealOS can make mistakes. Please double check important information.
                    </p>
                </div>
            </div>
        </div>
    )
}
