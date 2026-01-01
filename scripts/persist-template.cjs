
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
    console.log("Starting Persistence...");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase credentials");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read existing template
    const dumpPath = path.join(process.cwd(), 'default-template.json');
    if (!fs.existsSync(dumpPath)) {
        console.error("No default-template.json found.");
        process.exit(1);
    }
    const template = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));
    console.log("Loaded template:", template.name);

    // Get or Create Org
    const { data: orgs, error: orgError } = await supabase.from('organizations').select('id').limit(1);

    if (orgError && orgError.code === 'PGRST205') {
        console.error("Table 'organizations' still not found. Did you run the migrations?", orgError.message);
        process.exit(1);
    }

    let orgId;
    if (orgs && orgs.length > 0) {
        orgId = orgs[0].id;
        console.log("Found existing Org ID:", orgId);
    } else {
        console.log("No orgs found. Creating Default Firm...");
        const slug = 'default-firm-' + Date.now();
        const { data: newOrg, error: createError } = await supabase.from('organizations').insert({
            name: 'Default Firm',
            slug: slug,
        }).select().single();

        if (createError) {
            console.error("Failed to create org:", createError);
            process.exit(1);
        }
        orgId = newOrg.id;
        console.log("Created Org ID:", orgId);
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
    } else {
        console.log("SUCCESS! Template ID:", data.id);
        // Optional: cleanup
        // fs.unlinkSync(dumpPath);
    }
}

main().catch(e => {
    console.error("Unhandled error:", e);
});
