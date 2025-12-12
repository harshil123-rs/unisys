-- 1. Add new columns for rich data
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS timeline JSONB;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS shipment_details JSONB;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS risk_factors JSONB;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS ai_suggestions JSONB;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS required_documents JSONB;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS notifications JSONB;

-- 2. Populate TN88995 (The one we will demo)
UPDATE shipments
SET
    timeline = '[
        {"status": "Picked Up", "time": "Dec 10, 3:10 PM", "location": "Bangalore Warehouse", "completed": true},
        {"status": "Arrived at Sorting Center", "time": "Dec 10, 9:10 PM", "location": "Bangalore Hub", "completed": true},
        {"status": "In Transit", "time": "Dec 11, 10:00 AM", "location": "On the way to Hyderabad", "completed": true},
        {"status": "Reached Destination Hub", "time": "Dec 12, 05:30 AM", "location": "Hyderabad Hub", "completed": true},
        {"status": "Out for Delivery", "time": "Dec 13, 08:00 AM", "location": "Hyderabad", "completed": false},
        {"status": "Delivered", "time": "Pending", "location": "Customer Address", "completed": false}
    ]',
    shipment_details = '{
        "delivery_partner": "Delhivery",
        "type": "Electronics",
        "weight": "4.2 kg",
        "value": "₹45,000",
        "service_type": "Express",
        "dimensions": "30x20x15 cm"
    }',
    risk_factors = '{
        "route_congestion": 42,
        "weather_impact": 30,
        "hub_traffic": 10,
        "historical_delay": 18
    }',
    ai_suggestions = '[
        {
            "type": "warning",
            "title": "Recommended Action",
            "message": "Notify the customer about the expected delay of 2–4 hours due to traffic."
        },
        {
            "type": "info",
            "title": "Packaging Rule",
            "message": "Lithium batteries require DG Declaration. Please verify documents."
        },
        {
            "type": "success",
            "title": "Route Insight",
            "message": "Alternate route via Surat may reduce travel time by 1 hour."
        }
    ]',
    required_documents = '[
        {"name": "Invoice", "status": "verified"},
        {"name": "Packing List", "status": "verified"},
        {"name": "DG Declaration", "status": "missing"},
        {"name": "MSDS", "status": "missing"}
    ]',
    notifications = '[
        {"message": "SMS sent to receiver: Out for delivery", "time": "Dec 12, 09:00 AM"},
        {"message": "Delay notification scheduled", "time": "Dec 12, 10:30 AM"}
    ]'
WHERE id = 'TN88995';

-- 3. Populate TN88912 (Another one)
UPDATE shipments
SET
    timeline = '[
        {"status": "Picked Up", "time": "Dec 11, 2:00 PM", "location": "Mumbai", "completed": true},
        {"status": "In Transit", "time": "Dec 12, 11:00 AM", "location": "En route to Delhi", "completed": true},
        {"status": "Delivered", "time": "Pending", "location": "Delhi", "completed": false}
    ]',
    shipment_details = '{
        "delivery_partner": "BlueDart",
        "type": "Documents",
        "weight": "0.5 kg",
        "value": "₹500",
        "service_type": "Standard",
        "dimensions": "A4 Envelope"
    }',
    risk_factors = '{
        "route_congestion": 10,
        "weather_impact": 5,
        "hub_traffic": 20,
        "historical_delay": 5
    }',
    ai_suggestions = '[
        {
            "type": "success",
            "title": "On Time",
            "message": "Shipment is moving faster than expected."
        }
    ]',
    required_documents = '[
        {"name": "Invoice", "status": "verified"},
        {"name": "Waybill", "status": "verified"}
    ]',
    notifications = '[]'
WHERE id = 'TN88912';
