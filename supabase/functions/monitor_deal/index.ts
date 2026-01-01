
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
    const { type, record } = await req.json()

    // Triggered by Database Webhook (e.g. insert on documents)
    console.log("Monitoring Trigger:", type, record)

    // 1. Check if new document warrants an alert
    // 2. Diff against previous data
    // 3. Insert into 'alerts' table

    return new Response(JSON.stringify({ message: "Monitored" }), {
        headers: { "Content-Type": "application/json" },
    })
})
