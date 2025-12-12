-- Run this in your Supabase SQL Editor

-- 1. Add missing columns
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS origin TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS destination TEXT;

-- 2. Populate data for existing shipments
UPDATE shipments 
SET origin = 'Mumbai, MH', destination = 'Delhi, DL' 
WHERE id = 'TN88912';

UPDATE shipments 
SET origin = 'Bangalore, KA', destination = 'Hyderabad, TS' 
WHERE id = 'TN88995';

UPDATE shipments 
SET origin = 'Chennai, TN', destination = 'Kolkata, WB' 
WHERE id = 'TN12345';

-- Add more updates as needed for your real data
