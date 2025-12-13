const fs = require('fs');
const csv = require('csv-parser');
const { supabase } = require('../services/supabaseService');

// POST /api/upload-csv
const uploadCsv = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const results = [];
    const userId = req.body.userId; // Passed from frontend

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Process each row
                const shipments = results.map(row => {
                    const trackingId = 'TN' + Math.floor(100000 + Math.random() * 900000);
                    return {
                        id: trackingId,
                        user_id: userId,
                        carrier: row.carrier || 'Standard',
                        status: 'Pending Pickup',
                        location: row.pickup_address,
                        origin: row.pickup_address,
                        destination: row.delivery_address,
                        lat: 0,
                        lng: 0,
                        origin_lat: 0,
                        origin_lng: 0,
                        dest_lat: 0,
                        dest_lng: 0,
                        eta: 'Calculating...',
                        delay_risk: 0,
                        shipment_details: {
                            value: row.estimated_price ? `₹${row.estimated_price}` : 'N/A',
                            weight: row.weight ? `${row.weight} kg` : 'N/A',
                            item_type: row.item_type || 'General',
                            description: row.description || 'Bulk Uploaded Shipment'
                        }
                    };
                });

                // Bulk insert into Supabase
                const { data, error } = await supabase
                    .from('shipments')
                    .insert(shipments)
                    .select();

                if (error) throw error;

                // Log the upload
                await supabase.from('upload_logs').insert({
                    user_id: userId,
                    filename: req.file.originalname,
                    record_count: shipments.length
                });

                // Clean up file
                fs.unlinkSync(req.file.path);

                res.json({ success: true, count: shipments.length, shipments: data });

            } catch (err) {
                console.error('Bulk upload error:', err);
                res.status(500).json({ error: err.message });
            }
        });
};

module.exports = { uploadCsv };
