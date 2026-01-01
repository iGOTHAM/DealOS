
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const pdf = require('pdf-parse'); // Simple require
const mammoth = require('mammoth');

async function runLLM({ systemPrompt, userPrompt }) {
    const client = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
    });

    const completion = await client.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
    });
    return { text: completion.choices[0].message.content };
}

async function main() {
    console.log("Starting Ingestion (CJS)...");
    console.log("PDF Lib Type:", typeof pdf);
    // require('pdf-parse') should be the function. 
    // If it's the object, we check keys.

    let parsePdfFunc = pdf;
    if (typeof pdf !== 'function') {
        // If it's that object we saw, we are confused. 
        // But maybe in pure CJS node run it behaves correctly.
        console.log("Keys:", Object.keys(pdf));
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const parsePdf = async (filePath) => {
        const dataBuffer = fs.readFileSync(filePath);
        // If parsePdfFunc is not function, we try to use it anyway to see error or if it's correct
        const data = await parsePdfFunc(dataBuffer);
        return data.text;
    };

    const parseDocx = async (filePath) => {
        const buffer = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    };

    const cwd = process.cwd();
    // Assuming script is run from root or we resolve relative
    const pdf1Path = path.join(cwd, 'HemaTerra LOI ION.pdf');
    const pdf2Path = path.join(cwd, 'Scheer RIC sample for Boot Camp.pdf');
    const docxPath = path.join(cwd, 'RIC Memo Instructions 6 4 2013.docx');

    console.log("Reading files...");
    let pdf1Text = "", pdf2Text = "", docxText = "";

    try {
        pdf1Text = await parsePdf(pdf1Path);
        console.log("PDF1 Read, len:", pdf1Text.length);
        pdf2Text = await parsePdf(pdf2Path);
        console.log("PDF2 Read, len:", pdf2Text.length);
        docxText = await parseDocx(docxPath);
        console.log("Docx Read, len:", docxText.length);
    } catch (e) {
        console.error("Error reading files:", e);
        process.exit(1);
    }

    const systemPrompt = `You are an expert Private Equity professional tasked with creating the definitive "Investment Committee (IC) Memo" template for your firm.
    
    You have been given three source documents:
    1. "HemaTerra LOI ION" (Sample PDF 1) - A real example of a deal memo.
    2. "Scheer RIC sample" (Sample PDF 2) - Another real example.
    3. "RIC Memo Instructions" (Guidelines) - Detailed rules on style, tone, and required content.

    YOUR TASK:
    Synthesize these inputs into a SINGLE, MASTER JSON TEMPLATE.
    
    - **Structure**: Combine the sections from the examples. If they differ, prefer the superset or the more detailed structure.
    - **Tone/Style**: Extract the specific instructions from the DOCX (e.g., "Active voice", "Conclusion first").
    - **Diligence Questions**: For each section, list the "Hidden Questions" that a junior analyst must answer to complete that section diligently. Use the "Instructions" doc to populate this heavily.

    Output must be valid JSON matching this schema:
    {
        "name": "Firm Standard IC Memo",
        "description": "The golden standard for all investment decisions, incorporating Firm guidelines.",
        "tone_voice": "Specific guidelines on writing style...",
        "sections": [
            {
                "id": "slug",
                "title": "Clean Title",
                "description": "What goes here?",
                "required_data": ["Revenue", "EBITDA CAGAR", etc],
                "hidden_questions": ["Is the growth sustainable?", "What is the churn?"]
            }
        ]
    }
    `;

    const userPrompt = `
    ### Document 1 Content (Sample PDF):
    ${pdf1Text.substring(0, 15000)} ... [truncated]

    ### Document 2 Content (Sample PDF):
    ${pdf2Text.substring(0, 15000)} ... [truncated]

    ### Document 3 Content (Guidelines):
    ${docxText.substring(0, 10000)}
    `;

    console.log("Running LLM Analysis...");
    const output = await runLLM({ systemPrompt, userPrompt });

    let template;
    try {
        const jsonString = output.text.replace(/```json\n?|\n?```/g, '');
        template = JSON.parse(jsonString);
        console.log("Template generated:", template.name);
    } catch (e) {
        console.error("Failed to parse LLM output", output.text);
        process.exit(1);
    }

    // DB Insert
    console.log("Supabase URL:", supabaseUrl);

    const { data: orgs } = await supabase.from('organizations').select('id').limit(1);

    let orgId;
    if (orgs && orgs.length > 0) {
        orgId = orgs[0].id;
    } else {
        const slug = 'default-firm-' + Date.now();
        const { data: newOrg, error: createError } = await supabase.from('organizations').insert({
            name: 'Default Firm',
            slug: slug,
        }).select().single();

        if (createError) {
            console.error("Failed to create org:", createError);
            // Dump to file and exit
            const dumpPath = path.join(process.cwd(), 'default-template.json');
            fs.writeFileSync(dumpPath, JSON.stringify(template, null, 2));
            console.log("Saved template to local file (due to DB error):", dumpPath);
            process.exit(0);
        }
        orgId = newOrg.id;
    }

    console.log("Inserting for Org:", orgId);

    const { data, error } = await supabase.from('memo_templates').insert({
        org_id: orgId,
        name: template.name,
        description: template.description,
        structure_json: template,
        tone_voice: template.tone_voice
    }).select().single();

    if (error) {
        console.error("DB Error:", error);
        // Fallback: Save to file
        const dumpPath = path.join(process.cwd(), 'default-template.json');
        fs.writeFileSync(dumpPath, JSON.stringify(template, null, 2));
        console.log("Saved template to local file:", dumpPath);
    } else {
        console.log("SUCCESS! Template ID:", data.id);
    }
}

main().catch(e => {
    console.error("Unhandled error:", e);
    // Try to save template if we have it? 
    // It's hard to access 'template' var here.
});
