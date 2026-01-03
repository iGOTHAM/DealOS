import { NextRequest, NextResponse } from 'next/server';
import { generateMemoSection, MemoSection } from '@/lib/llm/memo-generator';
import { getEmbeddings } from '@/lib/llm/llm';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        const { section, dealId, toneVoice } = await req.json();

        if (!section || !dealId) {
            return NextResponse.json({ error: 'Missing section or dealId' }, { status: 400 });
        }

        // 1. Retrieve Context via RAG
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Create query for simple similarity search
        const queryText = `${section.title}: ${section.description} ${section.hidden_questions.join(' ')}`;
        const queryEmbedding = await getEmbeddings(queryText);

        const { data: chunks, error: searchError } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: 0.3, // Lower threshold to ensure we get something
            match_count: 5,
            filter_deal_id: dealId
        });

        if (searchError) {
            console.error('Vector search error:', searchError);
            // proceed without context
        }

        const contextText = chunks?.map((c: any) => c.content).join('\n---\n') || "";

        // If no context found, fallback to a generic message or keep empty to allow hallucination/general knowledge
        const finalContext = contextText || "No document context found for this section.";

        console.log(`Generating section '${section.title}' with ${chunks?.length || 0} chunks of context.`);

        // 2. Generate Section
        const content = await generateMemoSection(
            section as MemoSection,
            finalContext,
            toneVoice || 'Professional'
        );

        return NextResponse.json({ content, sources: chunks });
    } catch (error) {
        console.error('Error generating section:', error);
        return NextResponse.json({ error: 'Failed to generate section' }, { status: 500 });
    }
}
