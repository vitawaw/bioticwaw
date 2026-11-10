-- BIOTICWAW 1.6.6 · applied on TEST (20261110103536) and LIVE on 2026-11-10.
-- publish_site() and antibiotics_all() read each drug's interactions: an index on drug_id (performance advisor).
create index if not exists antibiotic_interactions_drug_idx on public.antibiotic_interactions (drug_id);
