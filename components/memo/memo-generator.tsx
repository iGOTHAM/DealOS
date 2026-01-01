
"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, FileText } from "lucide-react"

export function MemoGenerator({ dealId }: { dealId: string }) {
    const [memo, setMemo] = useState("")
    const [loading, setLoading] = useState(false)

    async function generateMemo() {
        setLoading(true)
        try {
            const supabase = createClient()
            // For MVP, we use the 'ask_deal' function but with a specific prompt
            const { data, error } = await supabase.functions.invoke('ask_deal', {
                body: {
                    dealId,
                    query: "Generate a comprehensive Investment Committee (IC) Memo for this deal. Include Investment Thesis, Risks, and Financial Overview.",
                    history: []
                }
            })

            if (error) throw error
            setMemo(data.answer)

        } catch (err) {
            setMemo("Error generating memo. Please try again.")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Investment Committee Memo</h3>
                <Button onClick={generateMemo} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                    Generate Draft
                </Button>
            </div>

            <Textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="Memo content will appear here..."
                className="min-h-[500px] font-mono text-sm"
            />
        </div>
    )
}
