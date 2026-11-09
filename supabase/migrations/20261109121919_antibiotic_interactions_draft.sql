-- BIOTICWAW 1.4.x · applied on TEST 2026-11-09 (version 20261109121919). Apply on LIVE at release.
-- Interactions of each antibiotic (draft). Same rules as public.antibiotics: no direct access, every row cites a source.
create table if not exists public.antibiotic_interactions (
  id          bigint generated always as identity primary key,
  drug_id     text not null references public.antibiotics(id) on delete cascade,
  with_ar     text not null check (length(trim(with_ar)) > 0),
  with_en     text not null default '',
  desc_ar     text not null check (length(trim(desc_ar)) > 0),
  desc_en     text not null default '',
  severity    text not null default 'moderate' check (severity in ('major','moderate','minor')),
  source_ids  int[] not null check (cardinality(source_ids) > 0),
  sort        int not null default 1000,
  reviewed    boolean not null default false,
  reviewed_at timestamptz,
  deleted     boolean not null default false,
  updated_at  timestamptz not null default now(),
  constraint ai_no_html check (concat_ws(' ', with_ar, with_en, desc_ar, desc_en) !~ '[<>]')
);
comment on table public.antibiotic_interactions is 'Draft antibiotic interactions (phase 2). Not published until the owner approves and publishes.';
alter table public.antibiotic_interactions enable row level security;
revoke all on public.antibiotic_interactions from anon, authenticated;
