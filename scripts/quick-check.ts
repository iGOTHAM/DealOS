import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const check = async () => {
    console.log("Checking SELECT...");
    const { count, error: selectError } = await supabase.from('memo_templates').select('*', { count: 'exact', head: true });
    if (selectError) {
        console.log("SELECT STATUS: ERROR", selectError);
    } else {
        console.log("SELECT STATUS: SUCCESS");
    }

    console.log("Checking INSERT...");
    const { data, error: insertError } = await supabase.from('memo_templates').insert({
        org_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Default Acme Capital ID
        name: 'Test Template',
        structure_json: {},
        description: 'Test'
    }).select().single();

    if (insertError) {
        console.log("INSERT STATUS: ERROR", insertError);
    } else {
        console.log("INSERT STATUS: SUCCESS", data.id);

        // Cleanup
        await supabase.from('memo_templates').delete().eq('id', data.id);
    }
};

check();
