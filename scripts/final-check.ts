import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    console.log("--- FINAL DIAGNOSTIC ---");
    const { data, error } = await supabase
        .from('memo_templates')
        .select('*')
        .limit(1);

    if (error) {
        console.error("ERROR CODE:", error.code);
        console.error("ERROR MSG:", error.message);
        console.error("ERROR HINT:", error.hint);
        process.exit(1);
    } else {
        console.log("SUCCESS: Table found. Row count:", data.length);
        process.exit(0);
    }
}

main();
