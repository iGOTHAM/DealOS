const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const migrationFile = process.argv[2];

if (!migrationFile) {
    console.error('Please provide a migration file path.');
    process.exit(1);
}

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function applyMigration() {
    try {
        await client.connect();
        const sql = fs.readFileSync(path.resolve(migrationFile), 'utf8');
        await client.query(sql);
        console.log('Migration applied successfully.');
    } catch (err) {
        console.error('Error applying migration:', err);
    } finally {
        await client.end();
    }
}

applyMigration();
