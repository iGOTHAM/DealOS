
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')

serve(async (req) => {
    const { query, dealId, history } = await req.json()

    // 1. Fetch Context (Mock + Firm POV)
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch deal to get org_id
    const { data: deal } = await supabase.from('deals').select('org_id').eq('id', dealId).single()

    let firmPov = ""
    if (deal) {
        const { data: org } = await supabase.from('organizations').select('firm_pov').eq('id', deal.org_id).single()
        if (org && org.firm_pov) firmPov = `\n\nFIRM POV / INVESTMENT THESIS GUIDELINES:\n${org.firm_pov}`
    }

    const context = "This is a mock context from Deal documents. The deal is about a SaaS company."

    // 2. Construct System Prompt
    const systemPrompt = `You are an investment analyst assistant. Use the following context to answer the user's question about the deal.
  ${firmPov}
  
  Context:
  ${context}
  
  If the answer is not in the context, say so.
  `

    console.log("Asking deal:", query)

    if (!OPENROUTER_API_KEY) {
        return new Response(JSON.stringify({
            answer: "OpenRouter API Key not set. Mock response: This is a great deal.",
            sources: []
        }), { headers: { "Content-Type": "application/json" } })
    }

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://dealos.ai",
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo", // Default for MVP
                messages: [
                    { role: "system", content: systemPrompt },
                    ...history,
                    { role: "user", content: query }
                ]
            })
        })

        const data = await res.json()
        const answer = data.choices[0].message.content

        return new Response(JSON.stringify({
            answer,
            sources: [{ name: "Mock Document.pdf", page: 1 }]
        }), { headers: { "Content-Type": "application/json" } })

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
})
