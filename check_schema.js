const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Shipment Row Keys:', data.length > 0 ? Object.keys(data[0]) : 'No data found');
        console.log('Sample Row:', data[0]);
    }
}

checkSchema();
