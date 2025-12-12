-- Create shipments table
create table if not exists shipments (
  id text primary key,
  carrier text,
  status text, -- 'In Transit', 'Delayed', 'Delivered'
  location text,
  lat float,
  lng float,
  eta text,
  delay_risk int, -- 0-100
  weather text,
  origin_lat float,
  origin_lng float,
  dest_lat float,
  dest_lng float,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert sample data (You can edit this or add more rows)
insert into shipments (id, carrier, status, location, lat, lng, eta, delay_risk, weather, origin_lat, origin_lng, dest_lat, dest_lng)
values
  ('TN88912', 'Delhivery', 'In Transit', 'Pune, MH', 18.5204, 73.8567, '13 Dec, 4:00 PM', 65, 'Light Rain', 19.0760, 72.8777, 18.5204, 73.8567),
  ('TN99100', 'BlueDart', 'Delayed', 'Delhi Hub', 28.6139, 77.2090, '15 Dec, 10:00 AM', 85, 'Heavy Fog', 30.7333, 76.7794, 28.6139, 77.2090),
  ('TN77221', 'FedEx', 'In Transit', 'Bangalore', 12.9716, 77.5946, '14 Dec, 2:00 PM', 30, 'Clear Sky', 13.0827, 80.2707, 12.9716, 77.5946);
