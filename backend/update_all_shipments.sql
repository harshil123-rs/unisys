-- 1. Add columns if they don't exist
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS origin TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS destination TEXT;

-- 2. Update ALL rows with random real Indian cities
WITH cities AS (
    SELECT unnest(ARRAY[
        'Mumbai, MH', 'Delhi, DL', 'Bangalore, KA', 'Chennai, TN', 
        'Kolkata, WB', 'Hyderabad, TS', 'Pune, MH', 'Ahmedabad, GJ', 
        'Jaipur, RJ', 'Surat, GJ', 'Lucknow, UP', 'Kanpur, UP',
        'Nagpur, MH', 'Indore, MP', 'Thane, MH', 'Bhopal, MP',
        'Visakhapatnam, AP', 'Patna, BR', 'Vadodara, GJ', 'Ghaziabad, UP',
        'Ludhiana, PB', 'Agra, UP', 'Nashik, MH', 'Faridabad, HR',
        'Meerut, UP', 'Rajkot, GJ', 'Kalyan-Dombivli, MH', 'Vasai-Virar, MH',
        'Varanasi, UP', 'Srinagar, JK', 'Aurangabad, MH', 'Dhanbad, JH'
    ]) AS city_name
)
UPDATE shipments
SET 
    origin = (SELECT city_name FROM cities ORDER BY random() LIMIT 1),
    destination = (SELECT city_name FROM cities ORDER BY random() LIMIT 1);

-- 3. Fix any cases where origin matches destination
UPDATE shipments
SET destination = 'New Delhi, DL'
WHERE origin = destination;

-- 4. Verify the update
SELECT id, origin, destination FROM shipments LIMIT 10;
