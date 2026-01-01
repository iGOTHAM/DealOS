import { NextRequest, NextResponse } from 'next/server';
import { analyzeMemoTemplate } from '@/lib/llm/memo-generator';

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const template = await analyzeMemoTemplate(text);

        return NextResponse.json({ template });
    } catch (error) {
        console.error('Error analyzing template:', error);
        return NextResponse.json({ error: 'Failed to analyze template' }, { status: 500 });
    }
}
