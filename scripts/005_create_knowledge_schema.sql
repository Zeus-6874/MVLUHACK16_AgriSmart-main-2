-- Knowledge & schemes schema (Stage 2)

create table if not exists scheme_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists schemes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_local text,
  category_id uuid references scheme_categories(id) on delete set null,
  state text not null default 'All India',
  department text,
  description text,
  eligibility text,
  benefits text,
  subsidy_details text,
  application_process text,
  official_url text,
  contact_info text,
  is_active boolean not null default true,
  last_updated date default current_date,
  created_at timestamptz not null default now(),
  unique (name, state)
);

create index if not exists idx_schemes_state on schemes(state);
create index if not exists idx_schemes_category on schemes(category_id);

create table if not exists crop_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

create table if not exists crops (
  id uuid primary key default gen_random_uuid(),
  common_name text not null,
  local_name text,
  scientific_name text,
  category_id uuid references crop_categories(id) on delete set null,
  climate text,
  soil_type text,
  optimal_ph_range text,
  water_requirements text,
  fertilizer_requirements text,
  planting_season text,
  harvest_time text,
  average_yield text,
  diseases text[],
  disease_management text,
  market_demand text,
  image_url text,
  source text,
  created_at timestamptz not null default now(),
  unique (common_name, scientific_name)
);

create table if not exists crop_notes (
  id uuid primary key default gen_random_uuid(),
  crop_id uuid references crops(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

