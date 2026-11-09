-- BIOTICWAW 1.4.x · applied on TEST 2026-11-09 (version 20261109220340). Apply on LIVE at release.
-- The owner approves an antibiotic and its interactions (the 🔔 list). Checks the owner role itself.
create or replace function public.antibiotic_approve(p_id text) returns void
  language plpgsql security definer set search_path = 'public' as $$
begin
  if coalesce(private.my_role(), '') <> 'owner' then raise exception 'only the owner'; end if;
  update public.antibiotics set reviewed = true, reviewed_at = now(), updated_at = now(), updated_by = auth.uid() where id = p_id and not deleted;
  update public.antibiotic_interactions set reviewed = true, reviewed_at = now(), updated_at = now() where drug_id = p_id and not deleted;
end $$;
revoke all on function public.antibiotic_approve(text) from public, anon;
grant execute on function public.antibiotic_approve(text) to authenticated;
