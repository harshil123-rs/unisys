
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in backend/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching shipments:', error);
    } else {
        if (data && data.length > 0) {
            console.log('Shipments table columns:', Object.keys(data[0]));
        } else {
            console.log('Shipments table is empty, cannot infer columns from data.');
            // Try to insert a dummy row to see errors or just assume we need to add the column if it's empty?
            // Better to try to get column info via a different method if possible, but select * limit 1 is usually good enough if there's data.
        }
    }
}

checkSchema();
