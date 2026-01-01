
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
    const { record } = await req.json()

    // Mock processing:
    // 1. Download file
    // 2. Extract text (PDF/DOCX)
    // 3. Chunk text
    // 4. Create embeddings
    // 5. Save chunks

    console.log("Processing document version:", record)

    // Update status to 'ready' after fake processing
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabase
        .from('document_versions')
        .update({ status: 'ready' })
        .eq('id', record.id)

    return new Response(JSON.stringify({ message: "Processed" }), {
        headers: { "Content-Type": "application/json" },
    })
})
