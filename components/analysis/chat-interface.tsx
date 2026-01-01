
"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Send, Bot, User } from "lucide-react"

type Message = {
    role: 'user' | 'assistant'
    content: string
    sources?: any[]
}

export function ChatInterface({ dealId }: { dealId: string }) {
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)

    async function sendMessage() {
        if (!input.trim() || loading) return

        const userMsg: Message = { role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setLoading(true)

        try {
            const supabase = createClient()
            const { data, error } = await supabase.functions.invoke('ask_deal', {
                body: {
                    query: userMsg.content,
                    dealId,
                    history: messages.map(m => ({ role: m.role, content: m.content }))
                }
            })

            if (error) throw error

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.answer || "No response.",
                sources: data.sources
            }])
        } catch (err) {
            console.error(err)
            setMessages(prev => [...prev, { role: 'assistant', content: "Error calling AI." }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[500px] border rounded-md">
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground mt-10">
                            Ask a question about this deal...
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Bot className="h-4 w-4" />
                                </div>
                            )}
                            <div className={`rounded-lg p-3 max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <p className="text-sm">{msg.content}</p>
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-muted-foreground/20 text-xs text-muted-foreground">
                                        Sources: {msg.sources.map(s => s.name).join(", ")}
                                    </div>
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                    <User className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && <div className="text-xs text-muted-foreground ml-12">Thinking...</div>}
                </div>
            </ScrollArea>
            <div className="p-4 border-t flex gap-2">
                <Input
                    placeholder="Type your question..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} disabled={loading || !input.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
