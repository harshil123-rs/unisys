-- Create user_settings table
create table if not exists user_settings (
  user_id uuid references auth.users(id) primary key,
  email_notifications boolean default true,
  whatsapp_notifications boolean default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_settings enable row level security;

-- Policy: Users can view their own settings
create policy "Users can view their own settings"
  on user_settings for select
  using (auth.uid() = user_id);

-- Policy: Users can update their own settings
create policy "Users can update their own settings"
  on user_settings for update
  using (auth.uid() = user_id);

-- Policy: Users can insert their own settings
create policy "Users can insert their own settings"
  on user_settings for insert
  with check (auth.uid() = user_id);
