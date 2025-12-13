-- Create shipment_bookings table
CREATE TABLE IF NOT EXISTS shipment_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    pickup_date DATE NOT NULL,
    weight FLOAT NOT NULL,
    item_type TEXT NOT NULL,
    description TEXT,
    carrier TEXT NOT NULL,
    estimated_price FLOAT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    tracking_id TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE shipment_bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create their own bookings
CREATE POLICY "Users can create their own bookings" ON shipment_bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own bookings
-- (Modified to allow everyone to view for the purpose of the Client Portal demo, 
-- or we can assume the Client is a specific user. For simplicity in this demo, we allow all auth users to view)
CREATE POLICY "Authenticated users can view all bookings" ON shipment_bookings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Users can update bookings (for approval/rejection)
CREATE POLICY "Authenticated users can update bookings" ON shipment_bookings
    FOR UPDATE USING (auth.role() = 'authenticated');
