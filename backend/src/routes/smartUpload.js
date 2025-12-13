const fs = require('fs');
const csv = require('csv-parser');
const OpenAI = require('openai');
const { supabase } = require('../services/supabaseService');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/smart-upload
const smartUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const userId = req.body.userId;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                if (results.length === 0) {
                    throw new Error('CSV file is empty');
                }

                // 1. Take a sample (first 3 rows) to understand structure
                const sample = results.slice(0, 3);
                const headers = Object.keys(results[0]);

                // 2. Ask AI to map columns and clean data
                const systemPrompt = `
                You are a Data Import Assistant.
                Map the user's CSV data to our 'shipments' schema.
                
                Target Schema:
                - carrier (string)
                - location (string, address)
                - origin (string, address)
                - destination (string, address)
                - status (string: 'Pending', 'In Transit', 'Delivered')
                - eta (string, e.g. "12 Dec, 10:00 AM")
                - delay_risk (number, 0-100)
                - shipment_details (json: { value, weight, item_type, description })

                Instructions:
                - Analyze the provided JSON sample.
                - Return a JSON array where EACH row from the input is transformed to match the Target Schema.
                - If a field is missing, infer it or use a default (e.g. status='Pending').
                - Generate a realistic 'eta' if missing.
                - Generate a random 'delay_risk' if missing.
                - Ensure 'shipment_details' is a valid JSON object.
                - Do NOT return markdown, just the raw JSON array.
                `;

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: JSON.stringify(results) } // Sending all data for now (assuming small file for demo)
                    ],
                    response_format: { type: "json_object" }
                });

                const aiResponse = JSON.parse(completion.choices[0].message.content);
                let processedShipments = aiResponse.shipments || aiResponse.data || aiResponse;

                // Handle if AI returns an object with a key instead of array
                if (!Array.isArray(processedShipments)) {
                    // try to find the array
                    const key = Object.keys(processedShipments).find(k => Array.isArray(processedShipments[k]));
                    if (key) processedShipments = processedShipments[key];
                    else throw new Error('AI failed to return an array of shipments');
                }

                // 3. Add required system fields
                const finalShipments = processedShipments.map(s => ({
                    ...s,
                    id: 'TN' + Math.floor(100000 + Math.random() * 900000),
                    user_id: userId,
                    lat: 0, // Geocoding can be done later
                    lng: 0,
                    origin_lat: 0,
                    origin_lng: 0,
                    dest_lat: 0,
                    dest_lng: 0
                }));

                // 4. Insert into Supabase
                const { data, error } = await supabase
                    .from('shipments')
                    .insert(finalShipments)
                    .select();

                if (error) throw error;

                // 5. Log the upload
                await supabase.from('upload_logs').insert({
                    user_id: userId,
                    filename: req.file.originalname,
                    record_count: finalShipments.length
                });

                // Clean up
                fs.unlinkSync(req.file.path);

                res.json({
                    success: true,
                    count: finalShipments.length,
                    message: `Successfully processed and imported ${finalShipments.length} shipments using AI.`
                });

            } catch (err) {
                console.error('Smart upload error:', err);
                res.status(500).json({ error: err.message });
            }
        });
};

module.exports = { smartUpload };
