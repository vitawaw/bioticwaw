-- BIOTICWAW: clean database (run on bioticwaw-test first, then on bioticwaw after approval).
-- Keeps the structure, the owner account (members), the owner invite (private.invites) and the sign-in accounts.
-- Removes all content, the published settings, the history, the notifications, the activity and the visit counters.
-- This cannot be undone.

truncate table
  public.antibiotic_interactions,
  public.antibiotics,
  public.interactions,
  public.nutrients,
  public.sources,
  public.site_config,
  public.config_history,
  public.notifications,
  public.activity,
  public.stat_counts,
  public.stat_people
restart identity cascade;

drop function if exists public.log_hits(jsonb);
drop function if exists public.site_stats(integer);
drop table if exists public.stat_counts;
drop table if exists public.stat_people;

-- check: every count below should be 0, and the owner account should still exist
select
  (select count(*) from public.antibiotics) as antibiotics,
  (select count(*) from public.sources) as sources,
  (select count(*) from public.nutrients) as nutrients,
  (select count(*) from public.site_config) as site_config_rows,
  (select count(*) from public.members where role = 'owner') as owner_accounts;
