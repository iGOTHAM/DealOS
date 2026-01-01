
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')

serve(async (req) => {
    const { analysisType, dealId } = await req.json()

    // 1. Fetch Context (Mock)
    const context = "Founded in 2020, SaaS B2B, $5M ARR, growing 50% YoY. Churn is 5%."

    // 2. Define Prompts
    let prompt = ""
    switch (analysisType) {
        case "Opportunity Snapshot":
            prompt = "Create a 3-bullet opportunity snapshot for this deal based on the context. Focus on growth and market position."
            break;
        case "Momentum Analysis":
            prompt = "Analyze the momentum of this company. Is it accelerating or decelerating? Why?"
            break;
        case "Competitor Landscape":
            prompt = "Based on the description, who are the likely competitors and what is the competitive moat?"
            break;
        default:
            prompt = "Analyze this deal."
    }

    const systemPrompt = `You are a private equity associate.
  Context: ${context}`

    if (!OPENROUTER_API_KEY) {
        return new Response(JSON.stringify({
            result: `Mock Analysis (${analysisType}): The company shows strong fundamentals with ...`
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
                model: "openai/gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ]
            })
        })

        const data = await res.json()
        const result = data.choices[0].message.content

        return new Response(JSON.stringify({ result }), {
            headers: { "Content-Type": "application/json" }
        })

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
})
