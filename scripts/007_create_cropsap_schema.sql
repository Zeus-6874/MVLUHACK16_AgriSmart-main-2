-- CROPSAP alerts and Maharashtra data bank schema (Stage 3)

create table if not exists cropsap_alerts (
  id uuid primary key default gen_random_uuid(),
  reference_id text,
  state text not null default 'Maharashtra',
  district text,
  taluka text,
  village text,
  crop text not null,
  pest text,
  disease text,
  severity text,
  advisory text,
  reported_on date,
  source_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_cropsap_district on cropsap_alerts(district);
create index if not exists idx_cropsap_crop on cropsap_alerts(crop);

create table if not exists district_statistics (
  id uuid primary key default gen_random_uuid(),
  state text not null default 'Maharashtra',
  district text not null,
  taluka text,
  season text,
  crop text,
  area_ha numeric,
  production_mt numeric,
  yield_mt_per_ha numeric,
  rainfall_mm numeric,
  irrigation_coverage_percent numeric,
  horticulture_area_ha numeric,
  medicinal_plants_area_ha numeric,
  source text,
  recorded_year integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_district_statistics_district on district_statistics(district);
create index if not exists idx_district_statistics_crop on district_statistics(crop);

