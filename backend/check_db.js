const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkShipments() {
    const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Shipment keys:', Object.keys(data[0]));
        console.log('Sample data:', data[0]);
    }
}

checkShipments();
