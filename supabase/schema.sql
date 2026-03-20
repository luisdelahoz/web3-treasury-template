-- ═══════════════════════════════════════════════════════════════
-- TREASURY MONITOR — Supabase schema
-- Run this in: Supabase dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- ── 1. GROUPS ────────────────────────────────────────────────────
create table if not exists groups (
  id         text primary key,          -- e.g. "wallets", "archemists"
  label      text not null,             -- display name
  icon       text not null default '◈', -- unicode symbol
  sort_order int  not null default 0,
  created_at timestamptz default now()
);

-- ── 2. ENTITIES ──────────────────────────────────────────────────
create table if not exists entities (
  id         uuid primary key default gen_random_uuid(),
  group_id   text not null references groups(id) on delete cascade,
  name       text not null,
  address    text not null,
  network    text not null check (network in ('ethereum', 'polygon')),
  enabled    bool not null default true,
  sort_order int  not null default 0,
  created_at timestamptz default now()
);

-- ── 3. ASSETS ────────────────────────────────────────────────────
create table if not exists assets (
  id          uuid primary key default gen_random_uuid(),
  entity_id   uuid not null references entities(id) on delete cascade,
  type        text not null check (type in ('native', 'erc20')),
  symbol      text,                     -- e.g. "USDC" (null for native, derived from network)
  address     text,                     -- contract address (null for native)
  decimals    int  default 18,
  sort_order  int  not null default 0,
  created_at  timestamptz default now()
);

-- ── 4. THRESHOLDS ────────────────────────────────────────────────
-- Separate table so thresholds can be updated independently
-- without touching the asset definition.
create table if not exists thresholds (
  id        uuid primary key default gen_random_uuid(),
  asset_id  uuid not null references assets(id) on delete cascade unique,
  warn      numeric,   -- balance at which row turns yellow
  critical  numeric,   -- balance at which row turns red
  updated_at timestamptz default now()
);

-- Auto-update updated_at on threshold changes
create or replace function update_threshold_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger thresholds_updated_at
  before update on thresholds
  for each row execute function update_threshold_timestamp();

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

alter table groups     enable row level security;
alter table entities   enable row level security;
alter table assets     enable row level security;
alter table thresholds enable row level security;

-- Authenticated users can read everything (dashboard reads)
create policy "authenticated can read groups"
  on groups for select to authenticated using (true);

create policy "authenticated can read entities"
  on entities for select to authenticated using (true);

create policy "authenticated can read assets"
  on assets for select to authenticated using (true);

create policy "authenticated can read thresholds"
  on thresholds for select to authenticated using (true);

-- Authenticated users can write everything
-- (add more granular policies if you add roles later)
create policy "authenticated can write groups"
  on groups for all to authenticated using (true) with check (true);

create policy "authenticated can write entities"
  on entities for all to authenticated using (true) with check (true);

create policy "authenticated can write assets"
  on assets for all to authenticated using (true) with check (true);

create policy "authenticated can write thresholds"
  on thresholds for all to authenticated using (true) with check (true);

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA — replace addresses with your real ones
-- ═══════════════════════════════════════════════════════════════

insert into groups (id, label, icon, sort_order) values
  ('wallets',     'Wallets',     '◈', 0),
  ('archemists',  'Archemists',  '⬡', 1)
on conflict (id) do nothing;

-- Example entity
insert into entities (id, group_id, name, address, network, sort_order) values
  ('11111111-0000-0000-0000-000000000001', 'wallets', 'Main Treasury',
   '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'ethereum', 0)
on conflict (id) do nothing;

-- Native asset for that entity
insert into assets (id, entity_id, type, sort_order) values
  ('22222222-0000-0000-0000-000000000001',
   '11111111-0000-0000-0000-000000000001', 'native', 0)
on conflict (id) do nothing;

-- USDC asset
insert into assets (id, entity_id, type, symbol, address, decimals, sort_order) values
  ('22222222-0000-0000-0000-000000000002',
   '11111111-0000-0000-0000-000000000001',
   'erc20', 'USDC', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 1)
on conflict (id) do nothing;

-- Thresholds
insert into thresholds (asset_id, warn, critical) values
  ('22222222-0000-0000-0000-000000000001', 1.0,  0.2),   -- ETH
  ('22222222-0000-0000-0000-000000000002', 5000, 1000)   -- USDC
on conflict (asset_id) do update
  set warn = excluded.warn, critical = excluded.critical;
