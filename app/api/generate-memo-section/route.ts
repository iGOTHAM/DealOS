import { NextRequest, NextResponse } from 'next/server';
import { generateMemoSection, MemoSection } from '@/lib/llm/memo-generator';

export async function POST(req: NextRequest) {
    try {
        const { section, dealContext, toneVoice } = await req.json();

        if (!section || !dealContext) {
            return NextResponse.json({ error: 'Missing section or context' }, { status: 400 });
        }

        const content = await generateMemoSection(section as MemoSection, dealContext as string, toneVoice || 'Professional');

        return NextResponse.json({ content });
    } catch (error) {
        console.error('Error generating section:', error);
        return NextResponse.json({ error: 'Failed to generate section' }, { status: 500 });
    }
}
