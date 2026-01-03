
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTemplates() {
    const { data, error } = await supabase.from('memo_templates').select('id, name, type');

    if (error) {
        console.error('Error fetching templates:', error);
        return;
    }

    console.log('Found Templates:', data);

    // Also check Deal Documents just in case
    const { data: docs } = await supabase.from('deal_documents').select('id, name, deal_id');
    console.log('Found Documents:', docs);
}

checkTemplates();
