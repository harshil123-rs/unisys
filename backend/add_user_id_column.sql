
-- Add user_id column to shipments table
ALTER TABLE shipments 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing shipments to belong to the primary user
UPDATE shipments
SET user_id = '33778a02-62bd-4bcc-8bc4-dec732fe3ee9'
WHERE user_id IS NULL;

-- Verify the update
SELECT count(*) as total_shipments, count(user_id) as assigned_shipments FROM shipments;
