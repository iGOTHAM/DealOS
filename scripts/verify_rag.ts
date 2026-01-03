
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("Testing 'match_documents' RPC...");

    // Create a dummy embedding of 1536 zeros
    const dummyEmbedding = Array(1536).fill(0);

    const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: dummyEmbedding,
        match_threshold: 0.0,
        match_count: 1,
        filter_deal_id: '00000000-0000-0000-0000-000000000000' // dummy deal id
    });

    if (error) {
        if (error.message.includes("function match_documents") && error.message.includes("does not exist")) {
            console.error("FAIL: Function match_documents does not exist.");
        } else {
            console.error("ERROR calling match_documents:", error.message);
            // If it's a permission error, it might still mean the function exists but we need auth.
            // But for public/anon key without auth, we might expect failure if RLS is tight.
            // However, checking if the error is "function not found" is the key.
        }
        process.exit(1);
    } else {
        console.log("SUCCESS: Function exists and returned data (or empty list).");
        console.log("Data:", data);
        process.exit(0);
    }
}

testConnection();
