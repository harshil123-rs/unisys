
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
    const { data, error } = await supabase
        .from('shipments')
        .select('user_id')
        .limit(5);

    if (error) {
        console.error('Error fetching shipments:', error);
    } else {
        if (data && data.length > 0) {
            console.log('Successfully fetched user_id from shipments. Sample data:', data);
            const withUserId = data.filter(s => s.user_id).length;
            console.log(`Found ${withUserId} records with user_id out of ${data.length} sampled.`);
        } else {
            console.log('Shipments table is empty.');
        }
    }
}

verifyMigration();
