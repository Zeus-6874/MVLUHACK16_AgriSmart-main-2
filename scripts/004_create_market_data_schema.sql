-- Market data schema for Agmarknet + other sources

create table if not exists market_price_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  source_type text not null default 'agmarknet',
  source_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists market_prices (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references market_price_sources(id) on delete set null,
  commodity text not null,
  commodity_hi text,
  variety text,
  market_name text,
  state text not null,
  district text,
  arrival_date date not null,
  min_price numeric,
  max_price numeric,
  modal_price numeric,
  unit text default 'quintal',
  created_at timestamptz not null default now(),
  unique (commodity, market_name, arrival_date)
);

create table if not exists market_price_history (
  id uuid primary key default gen_random_uuid(),
  market_price_id uuid references market_prices(id) on delete cascade,
  fetched_at timestamptz not null default now(),
  payload jsonb not null
);

create index if not exists idx_market_prices_state on market_prices(state);
create index if not exists idx_market_prices_commodity on market_prices(commodity);
create index if not exists idx_market_prices_arrival_date on market_prices(arrival_date);

