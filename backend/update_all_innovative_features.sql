-- 1. Add new columns for rich data
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS timeline JSONB;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS shipment_details JSONB;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS risk_factors JSONB;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS ai_suggestions JSONB;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS required_documents JSONB;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS notifications JSONB;

-- 2. Update ALL rows with randomized realistic data
UPDATE shipments
SET
    -- Randomize Timeline based on status
    timeline = CASE 
        WHEN status = 'Delivered' THEN '[
            {"status": "Picked Up", "time": "Dec 10, 10:00 AM", "location": "Origin Hub", "completed": true},
            {"status": "In Transit", "time": "Dec 11, 02:00 PM", "location": "Transit Hub", "completed": true},
            {"status": "Out for Delivery", "time": "Dec 12, 09:00 AM", "location": "Destination City", "completed": true},
            {"status": "Delivered", "time": "Dec 12, 02:00 PM", "location": "Customer Address", "completed": true}
        ]'::jsonb
        WHEN status = 'In Transit' THEN '[
            {"status": "Picked Up", "time": "Dec 12, 10:00 AM", "location": "Origin Hub", "completed": true},
            {"status": "In Transit", "time": "Dec 13, 08:00 AM", "location": "Transit Hub", "completed": true},
            {"status": "Out for Delivery", "time": "Pending", "location": "Destination City", "completed": false}
        ]'::jsonb
        ELSE '[
            {"status": "Picked Up", "time": "Dec 14, 09:00 AM", "location": "Origin Hub", "completed": true},
            {"status": "In Transit", "time": "Pending", "location": "Transit Hub", "completed": false}
        ]'::jsonb
    END,

    -- Randomize Details
    shipment_details = jsonb_build_object(
        'delivery_partner', (ARRAY['Delhivery', 'BlueDart', 'FedEx', 'DHL'])[floor(random() * 4 + 1)],
        'type', (ARRAY['Electronics', 'Documents', 'Apparel', 'Furniture'])[floor(random() * 4 + 1)],
        'weight', (floor(random() * 10 + 1) || ' kg'),
        'value', ('₹' || floor(random() * 50000 + 1000)),
        'service_type', (ARRAY['Standard', 'Express'])[floor(random() * 2 + 1)],
        'dimensions', '30x20x15 cm'
    ),

    -- Randomize Risks
    risk_factors = jsonb_build_object(
        'route_congestion', floor(random() * 50),
        'weather_impact', floor(random() * 30),
        'hub_traffic', floor(random() * 20),
        'historical_delay', floor(random() * 15)
    ),

    -- Randomize AI Suggestions
    ai_suggestions = CASE 
        WHEN random() > 0.5 THEN '[
            {"type": "warning", "title": "Weather Alert", "message": "Heavy rain reported in transit route. Expect minor delays."},
            {"type": "success", "title": "Route Optimized", "message": "AI rerouted shipment to avoid highway congestion."}
        ]'::jsonb
        ELSE '[
            {"type": "info", "title": "Packaging Check", "message": "Ensure fragile items are cushioned properly."},
            {"type": "success", "title": "On Schedule", "message": "Shipment is moving 10% faster than average."}
        ]'::jsonb
    END,

    -- Randomize Docs
    required_documents = '[
        {"name": "Invoice", "status": "verified"},
        {"name": "Packing List", "status": "verified"},
        {"name": "E-Way Bill", "status": "verified"}
    ]'::jsonb,

    -- Randomize Notifications
    notifications = '[
        {"message": "Shipment picked up", "time": "2 days ago"},
        {"message": "In transit update", "time": "1 day ago"}
    ]'::jsonb;
