import OpenAI from 'openai';

interface LLMInput {
    taskType: string;
    systemPrompt: string;
    userPrompt: string;
    retrievedContext?: string;
    outputSchema?: any; // For now, we'll return raw text or JSON parsed text
    modelOverride?: string;
    temperature?: number;
}

interface LLMOutput {
    text: string;
    citations: string[]; // Mocking citations for now, dependent on implementation
    modelUsed: string;
    tokens: number;
}

export interface MemoTemplate {
    name: string;
    description: string;
    sections: any[];
    tone_voice: string;
}

// Lazily initialize client
let openRouterClient: OpenAI | null = null;

const getClient = () => {
    if (!openRouterClient) {
        openRouterClient = new OpenAI({
            apiKey: process.env.OPENROUTER_API_KEY || 'dummy-key-for-build',
            baseURL: 'https://openrouter.ai/api/v1',
            dangerouslyAllowBrowser: false,
        });
    }
    return openRouterClient;
};

export const runLLM = async ({
    taskType,
    systemPrompt,
    userPrompt,
    retrievedContext,
    outputSchema,
    modelOverride,
    temperature = 0.7,
}: LLMInput): Promise<LLMOutput> => {
    const model = modelOverride || process.env.DEFAULT_LLM_MODEL || 'openai/gpt-4o';

    // Construct the full prompt with context
    let finalUserPrompt = userPrompt;
    if (retrievedContext) {
        finalUserPrompt += `\n\n### CONTEXT ###\n${retrievedContext}\n\n### END CONTEXT ###`;
    }

    try {
        const completion = await getClient().chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: finalUserPrompt },
            ],
            temperature: temperature,
        });

        const choice = completion.choices[0];
        const text = choice?.message?.content || '';

        // Log the run to Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseServiceKey) {
            try {
                const { createClient } = require('@supabase/supabase-js');
                const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

                await supabaseAdmin.from('ai_runs').insert({
                    task_type: taskType,
                    model: model,
                    tokens_used: completion.usage?.total_tokens || 0,
                    prompt_fragment: systemPrompt.substring(0, 100), // Store snippet
                    output_fragment: text.substring(0, 100),
                });
            } catch (logError) {
                console.error("Failed to log AI run to DB:", logError);
            }
        }

        console.log(`[LLM Run] Task: ${taskType}, Model: ${model}, Tokens: ${completion.usage?.total_tokens}`);

        return {
            text,
            citations: [], // TODO: Parse citations from text if structured
            modelUsed: model,
            tokens: completion.usage?.total_tokens || 0,
        };
    } catch (error) {
        console.error('[LLM Error]', error);
        throw error;
    }
};
