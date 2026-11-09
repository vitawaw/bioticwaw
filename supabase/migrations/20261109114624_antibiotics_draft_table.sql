-- BIOTICWAW 1.4.x · applied on TEST 2026-11-09 (version 20261109114624). Apply on LIVE at release.
-- Antibiotics (draft content). Row security on and no policies: the page never reads this table directly;
-- the owner uses definer functions that check the owner role, and visitors only get reviewed rows through publish_site().
create table if not exists public.antibiotics (
  id          text primary key check (id ~ '^[a-z0-9_]{1,24}$'),
  name_ar     text not null check (length(trim(name_ar)) > 0),
  name_en     text not null default '',
  aware       text not null default '' check (aware in ('access','watch','reserve','')),
  class_ar    text not null default '',
  class_en    text not null default '',
  uses_ar     text not null default '',
  uses_en     text not null default '',
  dose_ar     text not null default '',
  dose_en     text not null default '',
  renal_ar    text not null default '',
  renal_en    text not null default '',
  timing_ar   text not null default '',
  timing_en   text not null default '',
  interactions_ar text not null default '',
  interactions_en text not null default '',
  source_ids  int[] not null default '{}',
  sort        int not null default 1000,
  hidden      boolean not null default false,
  deleted     boolean not null default false,
  reviewed    boolean not null default false,
  reviewed_at timestamptz,
  updated_at  timestamptz not null default now(),
  updated_by  uuid default auth.uid(),
  constraint antibiotics_no_html check (concat_ws(' ', name_ar, name_en, class_ar, class_en, uses_ar, uses_en, dose_ar, dose_en, renal_ar, renal_en, timing_ar, timing_en, interactions_ar, interactions_en) !~ '[<>]')
);
comment on table public.antibiotics is 'Draft antibiotic content (phase 1). Not published. Only reviewed rows may reach visitors, after the owner approves and publishes.';
alter table public.antibiotics enable row level security;
revoke all on public.antibiotics from anon, authenticated;
