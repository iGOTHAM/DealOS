import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    console.log("Checking database connection...");

    // Check Org
    const { data: org, error: orgError } = await supabase.from('organizations').select('id').limit(1);
    if (orgError) {
        console.error("FAIL: Could not access 'organizations'.", orgError.message);
    } else {
        console.log("SUCCESS: Accessed 'organizations'. Found:", org?.length ?? 0);
    }

    // Check Memo Templates
    const { data: tmpl, error: tmplError } = await supabase.from('memo_templates').select('id').limit(1);
    if (tmplError) {
        console.error("FAIL: Could not access 'memo_templates'.", tmplError.message);
        console.log("Hint: If you just created the table, try running \"NOTIFY pgrst, 'reload config';\" in the SQL Editor to refresh the API cache.");
    } else {
        console.log("SUCCESS: Accessed 'memo_templates'. Found:", tmpl?.length ?? 0);
    }
}

main();
