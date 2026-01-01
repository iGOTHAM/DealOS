import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    console.log("Querying information_schema...");

    // Attempt to query information_schema to see if the table exists definitively
    // Service key might not have permission to query detailed info_schema directly via PostgREST 
    // depending on how it's exposed, but usually we can't query system tables via the API.

    // Instead, let's try to create a dummy record in 'organizations' which we know works,
    // to confirm WRITE access works in general.

    const orgId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    console.log("Verifying WRITE access to 'organizations'...");
    const { error: orgError } = await supabase.from('organizations').update({ updated_at: new Date().toISOString() }).eq('id', orgId);

    if (orgError) {
        console.error("WRITE FAIL on 'organizations':", orgError);
    } else {
        console.log("WRITE SUCCESS on 'organizations'.");
    }

    console.log("Retrying INSERT on 'memo_templates' with upsert...");
    const { data, error: insertError } = await supabase.from('memo_templates').upsert({
        id: '00000000-0000-0000-0000-000000000000',
        org_id: orgId,
        name: 'Connectivity Test',
        structure_json: {},
        description: 'Test'
    }).select();

    if (insertError) {
        console.error("INSERT FAIL:", insertError);
    } else {
        console.log("INSERT SUCCESS:", data);
        // Clean up
        await supabase.from('memo_templates').delete().eq('id', '00000000-0000-0000-0000-000000000000');
    }
}

main();
