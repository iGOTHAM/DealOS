import { runLLM } from './llm';

export interface MemoSection {
    id: string;
    title: string;
    description: string;
    required_data: string[];
    hidden_questions: string[]; // diligence questions
}

export interface MemoTemplate {
    name: string;
    description: string;
    sections: MemoSection[];
    tone_voice: string;
}

export const analyzeMemoTemplate = async (templateText: string): Promise<MemoTemplate> => {
    const systemPrompt = `You are an expert Private Equity Investment Professional. 
    Your task is to analyze a sample Investment Committee (IC) Memo and extract its structure and style into a reusable template.
    
    Identify the key sections, the specific questions asked (both explicit and implicit 'hidden' diligence questions), and the tone of voice.
    
    Return the result as a JSON object adhering to the following schema:
    {
        "name": "Suggested Name for Template",
        "description": "Brief description of the memo style",
        "tone_voice": "Description of the writing style (e.g., 'Make it bulleted', 'Formal and concise')",
        "sections": [
            {
                "id": "unique_id",
                "title": "Section Title",
                "description": "What goes in this section",
                "required_data": ["List of data points needed, e.g., 'Revenue', 'EBITDA'"],
                "hidden_questions": ["List of implicit diligence questions this section answers"]
            }
        ]
    }
    `;

    const output = await runLLM({
        taskType: 'analyze_template',
        systemPrompt,
        userPrompt: `Here is the sample IC Memo text:\n\n${templateText}`,
        outputSchema: true, // simplified signal to return JSON
        temperature: 0.2, // Low temp for extraction
        modelOverride: 'openai/gpt-4o' // Strong model needed for extraction
    });

    try {
        // Basic JSON parsing cleanup if needed
        const jsonString = output.text.replace(/```json\n?|\n?```/g, '');
        return JSON.parse(jsonString) as MemoTemplate;
    } catch (e) {
        console.error("Failed to parse memo template", e);
        throw new Error("Failed to analyze template");
    }
};

export const generateMemoSection = async (
    section: MemoSection,
    dealContext: string,
    toneVoice: string
): Promise<string> => {
    const systemPrompt = `You are an Associate at a top-tier Private Equity firm writing an IC Memo.
    
    Your goal is to write the "${section.title}" section.
    
    Style/Tone: ${toneVoice}
    
    Focus on answering these diligence questions:
    ${section.hidden_questions.map(q => `- ${q}`).join('\n')}
    `;

    const output = await runLLM({
        taskType: `generate_section_${section.id}`,
        systemPrompt,
        userPrompt: `Context for this deal:\n${dealContext}\n\nWrite the ${section.title} section.`,
        temperature: 0.4
    });

    return output.text;
};
