import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { createClient } from '@supabase/supabase-js';
import { analyzeMemoTemplate } from '../lib/llm/memo-generator';

async function main() {
    console.log("Starting IC Memo Template Ingestion...");

    // 1. Setup Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Read Files
    const files = [
        'Scheer RIC sample for Boot Camp.pdf',
        'RIC Memo Instructions 6 4 2013.docx'
    ];
    let combinedText = "";

    for (const fileName of files) {
        const filePath = path.join(process.cwd(), fileName);
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            continue;
        }

        console.log(`Processing ${fileName}...`);

        if (fileName.endsWith('.pdf')) {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            combinedText += `\n\n--- DOCUMENT: ${fileName} ---\n\n${data.text}`;
        } else if (fileName.endsWith('.docx')) {
            const buffer = fs.readFileSync(filePath);
            const result = await mammoth.extractRawText({ buffer: buffer });
            combinedText += `\n\n--- DOCUMENT: ${fileName} ---\n\n${result.value}`;
        }
    }

    if (!combinedText.trim()) {
        console.error("No text extracted from files.");
        process.exit(1);
    }

    console.log(`Extracted ${combinedText.length} characters of text.`);

    // 3. Analyze with LLM
    console.log("Analyzing text with LLM to generate template structure...");
    try {
        const template = await analyzeMemoTemplate(combinedText);
        console.log("Template generated successfully:", template.name);

        // 4. Insert into Supabase
        // We need an Organization ID to attach this to. 
        // We'll try to find the default one 'Acme Capital' or just pick the first one.

        let orgId: string;

        const { data: orgs, error: orgError } = await supabase
            .from('organizations')
            .select('id')
            .limit(1);

        if (orgError) {
            console.error("Error checking organizations:", orgError);
            process.exit(1);
        }

        if (!orgs || orgs.length === 0) {
            console.log("No organization found. Creating default 'Acme Capital'...");
            const { data: newOrg, error: createError } = await supabase
                .from('organizations')
                .insert({
                    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                    name: 'Acme Capital',
                    slug: 'acme-capital',
                    firm_pov: 'We prefer B2B SaaS with high retention and clear path to profitability.'
                })
                .select()
                .single();

            if (createError || !newOrg) {
                console.error("Failed to create default organization:", createError);
                process.exit(1);
            }
            orgId = newOrg.id;
        } else {
            orgId = orgs[0].id;
        }

        const { data: insertData, error: insertError } = await supabase
            .from('memo_templates')
            .insert({
                org_id: orgId,
                name: template.name || 'Master IC Memo Template',
                description: template.description,
                structure_json: template.sections,
                tone_voice: template.tone_voice
            })
            .select();

        if (insertError) {
            console.error("Error inserting template into Supabase:", insertError);
            process.exit(1);
        }

        console.log("Template saved to database:", insertData);

    } catch (e) {
        console.error("Error during analysis or storage:", e);
        process.exit(1);
    }
}

main();
