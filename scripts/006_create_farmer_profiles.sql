-- Farmer profile schema for onboarding

create table if not exists farmer_profiles (
  user_id text primary key,
  full_name text,
  phone text,
  email text,
  state text,
  district text,
  land_area numeric,
  land_unit text default 'acre',
  primary_crop text,
  experience_years integer,
  preferred_language text default 'en',
  irrigation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_farmer_profiles_updated_at
before update on farmer_profiles
for each row
execute procedure trigger_set_timestamp();

