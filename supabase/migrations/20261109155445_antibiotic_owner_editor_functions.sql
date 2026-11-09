-- BIOTICWAW 1.4.x · applied on TEST 2026-11-09 (version 20261109155445). Apply on LIVE at release.
-- Owner editor for antibiotics. Every function checks the owner role itself.
create or replace function public.antibiotics_all() returns jsonb
  language plpgsql security definer set search_path = 'public' as $$
begin
  if coalesce(private.my_role(), '') <> 'owner' then raise exception 'only the owner'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'n',jsonb_build_object('ar',a.name_ar,'en',a.name_en),
      'aware',a.aware,'cls',jsonb_build_object('ar',a.class_ar,'en',a.class_en),'uses',jsonb_build_object('ar',a.uses_ar,'en',a.uses_en),
      'dose',jsonb_build_object('ar',a.dose_ar,'en',a.dose_en),'renal',jsonb_build_object('ar',a.renal_ar,'en',a.renal_en),
      'timing',jsonb_build_object('ar',a.timing_ar,'en',a.timing_en),'r',to_jsonb(a.source_ids),'hidden',a.hidden,'deleted',a.deleted,'reviewed',a.reviewed,
      'inter',coalesce((select jsonb_agg(jsonb_build_object('id',x.id,'b',jsonb_build_object('ar',x.with_ar,'en',x.with_en),'d',jsonb_build_object('ar',x.desc_ar,'en',x.desc_en),'sev',x.severity,'r',to_jsonb(x.source_ids),'deleted',x.deleted) order by x.sort, x.id)
                        from public.antibiotic_interactions x where x.drug_id = a.id), '[]'::jsonb)) order by a.sort, a.id)
    from public.antibiotics a), '[]'::jsonb);
end $$;

create or replace function public.antibiotic_save(p jsonb) returns text
  language plpgsql security definer set search_path = 'public' as $$
declare v_id text := lower(trim(p->>'id'));
begin
  if coalesce(private.my_role(), '') <> 'owner' then raise exception 'only the owner'; end if;
  if v_id !~ '^[a-z0-9_]{1,24}$' then raise exception 'bad id'; end if;
  insert into public.antibiotics (id, name_ar, name_en, aware, class_ar, class_en, uses_ar, uses_en, dose_ar, dose_en, renal_ar, renal_en,
      timing_ar, timing_en, interactions_ar, interactions_en, source_ids, sort, hidden, reviewed, reviewed_at, updated_at, updated_by)
  values (v_id, coalesce(p#>>'{n,ar}',''), coalesce(p#>>'{n,en}',''), coalesce(p->>'aware',''),
      coalesce(p#>>'{cls,ar}',''), coalesce(p#>>'{cls,en}',''), coalesce(p#>>'{uses,ar}',''), coalesce(p#>>'{uses,en}',''),
      coalesce(p#>>'{dose,ar}',''), coalesce(p#>>'{dose,en}',''), coalesce(p#>>'{renal,ar}',''), coalesce(p#>>'{renal,en}',''),
      coalesce(p#>>'{timing,ar}',''), coalesce(p#>>'{timing,en}',''), '', '',
      coalesce((select array_agg(x::int) from jsonb_array_elements_text(coalesce(p->'r','[]'::jsonb)) x), '{}'),
      coalesce((p->>'sort')::int, 1000), coalesce((p->>'hidden')::boolean, false), true, now(), now(), auth.uid())
  on conflict (id) do update set name_ar = excluded.name_ar, name_en = excluded.name_en, aware = excluded.aware,
      class_ar = excluded.class_ar, class_en = excluded.class_en, uses_ar = excluded.uses_ar, uses_en = excluded.uses_en,
      dose_ar = excluded.dose_ar, dose_en = excluded.dose_en, renal_ar = excluded.renal_ar, renal_en = excluded.renal_en,
      timing_ar = excluded.timing_ar, timing_en = excluded.timing_en, source_ids = excluded.source_ids, sort = excluded.sort,
      hidden = excluded.hidden, reviewed = true, reviewed_at = now(), deleted = false, updated_at = now(), updated_by = auth.uid();
  return v_id;
end $$;

create or replace function public.antibiotic_set_flag(p_id text, p_hidden boolean default null, p_deleted boolean default null) returns void
  language plpgsql security definer set search_path = 'public' as $$
begin
  if coalesce(private.my_role(), '') <> 'owner' then raise exception 'only the owner'; end if;
  update public.antibiotics set hidden = coalesce(p_hidden, hidden), deleted = coalesce(p_deleted, deleted), updated_at = now(), updated_by = auth.uid() where id = p_id;
end $$;

create or replace function public.antibiotic_interaction_save(p jsonb) returns bigint
  language plpgsql security definer set search_path = 'public' as $$
declare v_id bigint;
begin
  if coalesce(private.my_role(), '') <> 'owner' then raise exception 'only the owner'; end if;
  if not exists (select 1 from public.antibiotics where id = p->>'drug') then raise exception 'unknown antibiotic'; end if;
  if coalesce(p->>'id','') <> '' then
    update public.antibiotic_interactions set with_ar = p#>>'{b,ar}', with_en = coalesce(p#>>'{b,en}',''), desc_ar = p#>>'{d,ar}', desc_en = coalesce(p#>>'{d,en}',''),
      severity = coalesce(p->>'sev','moderate'), source_ids = coalesce((select array_agg(x::int) from jsonb_array_elements_text(coalesce(p->'r','[]'::jsonb)) x), '{}'),
      reviewed = true, reviewed_at = now(), deleted = false, updated_at = now() where id = (p->>'id')::bigint returning id into v_id;
  else
    insert into public.antibiotic_interactions (drug_id, with_ar, with_en, desc_ar, desc_en, severity, source_ids, sort, reviewed, reviewed_at)
    values (p->>'drug', p#>>'{b,ar}', coalesce(p#>>'{b,en}',''), p#>>'{d,ar}', coalesce(p#>>'{d,en}',''), coalesce(p->>'sev','moderate'),
      coalesce((select array_agg(x::int) from jsonb_array_elements_text(coalesce(p->'r','[]'::jsonb)) x), '{}'), 1000, true, now())
    returning id into v_id;
  end if;
  return v_id;
end $$;

create or replace function public.antibiotic_interaction_delete(p_id bigint) returns void
  language plpgsql security definer set search_path = 'public' as $$
begin
  if coalesce(private.my_role(), '') <> 'owner' then raise exception 'only the owner'; end if;
  update public.antibiotic_interactions set deleted = true, updated_at = now() where id = p_id;
end $$;

revoke all on function public.antibiotics_all(), public.antibiotic_save(jsonb), public.antibiotic_set_flag(text, boolean, boolean), public.antibiotic_interaction_save(jsonb), public.antibiotic_interaction_delete(bigint) from public, anon;
grant execute on function public.antibiotics_all(), public.antibiotic_save(jsonb), public.antibiotic_set_flag(text, boolean, boolean), public.antibiotic_interaction_save(jsonb), public.antibiotic_interaction_delete(bigint) to authenticated;
