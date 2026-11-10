-- BIOTICWAW 1.5.0 · cleanup and hardening after the move to antibiotics.
-- TEST first; LIVE only at release (the live 1.17.3 page still uses the vitamin tables).
-- 1) Content functions keep the SAME output shape (refs, inter, nut, del) so the owner page keeps working,
--    but read and write sources only. 'inter' and 'nut' are always empty and ignored when saved.
-- 2) The vitamin tables public.interactions and public.nutrients (empty), their helpers, the old publish_config and the
--    1.17 visit statistics (log_hits, site_stats, stat_counts, stat_people) are removed.
-- 3) Visitors and signed-in users can no longer call the trigger functions directly.
-- 4) Every definer / content function has a fixed search path that lists pg_temp last.

-- ===== 1) content functions (sources only) =====
create or replace function public.get_content() returns jsonb
  language sql stable set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'refs', coalesce((select jsonb_agg(private.j_src(s)
        || case when s.pub is null then '{}'::jsonb else jsonb_build_object('pv', private.j_src(jsonb_populate_record(null::sources, s.pub)) || '{"rv":true}') end
        || case when s.reviewed then '{}'::jsonb else jsonb_build_object('by', coalesce(private.who(s.updated_by), '')) end order by s.id)
      from sources s where not s.deleted), '[]'::jsonb),
    'next_ref', (select coalesce(max(id), 29) + 1 from sources),
    'inter', '[]'::jsonb,
    'nut', jsonb_build_object('hide', '[]'::jsonb, 'custom', '[]'::jsonb),
    'del', jsonb_build_object(
      'refs',  coalesce((select jsonb_agg(private.j_src(jsonb_populate_record(null::sources, s.pub)) || jsonb_build_object('rv', true, 'by', coalesce(private.who(s.updated_by), '')) order by s.id)
                 from sources s where s.deleted and s.pub is not null and not (s.pub ->> 'deleted')::boolean), '[]'::jsonb),
      'inter', '[]'::jsonb,
      'nut',   '[]'::jsonb)
  )
$$;

create or replace function public.save_content(p jsonb) returns void
  language plpgsql set search_path = public, pg_temp as $$
declare x jsonb;
begin
  if coalesce(private.my_role(), '') not in ('owner','editor') then raise exception 'not allowed'; end if;
  if p ? 'refs' and not private.can_edit('refs') then raise exception 'no permission: sources'; end if;
  -- 'inter' and 'nut' (vitamin era) are ignored: antibiotics are saved with the antibiotic_* functions

  if p ? 'refs' then
    for x in select * from jsonb_array_elements(p->'refs') loop
      insert into sources(id, org, title, url, use_ar, use_en, reviewed, hidden, kind)
      values ((x->>'id')::int, x->>'org', x->>'title', coalesce(x->>'url',''), coalesce(x->>'ar',''), coalesce(x->>'en',''), coalesce((x->>'rv')::boolean, false),
              coalesce((x->>'hidden')::boolean, false), coalesce(x->>'kind',''))
      on conflict (id) do update set org = excluded.org, title = excluded.title, url = excluded.url, use_ar = excluded.use_ar, use_en = excluded.use_en,
        reviewed = excluded.reviewed, hidden = excluded.hidden, kind = excluded.kind, deleted = false
      where (sources.org, sources.title, sources.url, sources.use_ar, sources.use_en, sources.reviewed, sources.hidden, sources.kind, sources.deleted)
        is distinct from (excluded.org, excluded.title, excluded.url, excluded.use_ar, excluded.use_en, excluded.reviewed, excluded.hidden, excluded.kind, false);
    end loop;
    update sources set deleted = true where not deleted and id not in (select (x2->>'id')::int from jsonb_array_elements(p->'refs') x2);
  end if;
end $$;

create or replace function public.review_change(p_kind text, p_id text, p_accept boolean) returns void
  language plpgsql security definer set search_path = '' as $$
declare who uuid; lbl text;
begin
  if coalesce(private.my_role(), '') <> 'owner' then raise exception 'only the owner'; end if;
  if p_kind = 'r' then
    select updated_by, title into who, lbl from public.sources where id = p_id::int and not reviewed;
    if p_accept then update public.sources set reviewed = true where id = p_id::int;
    else
      update public.sources t set (org, title, url, use_ar, use_en, hidden, kind, deleted, reviewed) =
        (select p.org, p.title, p.url, p.use_ar, p.use_en, p.hidden, p.kind, p.deleted, true from jsonb_populate_record(null::public.sources, t.pub) p)
       where t.id = p_id::int and t.pub is not null;
      if not found then update public.sources set deleted = true, reviewed = true where id = p_id::int and not reviewed; end if;
    end if;
  else
    raise exception 'bad kind';
  end if;
  if who is not null and who <> auth.uid() and exists (select 1 from public.members where user_id = who and role = 'editor') then
    insert into public.notifications (user_id, kind, item, label)
      values (who, case when p_accept then 'approved' else 'rejected' end, p_kind, left(coalesce(lbl, ''), 200));
  end if;
end $$;

create or replace function public.publish_site(note text default '') returns jsonb
  language plpgsql security definer set search_path = public, pg_temp as $$
declare s jsonb; refs jsonb; snap jsonb; ab jsonb;
begin
  if coalesce(private.my_role(), '') <> 'owner' then raise exception 'only the owner can publish'; end if;
  select data into s from site_config where id = 'draft';
  if s is null then select data into s from site_config where id = 'published'; end if;
  s := coalesce(s, '{}'::jsonb) - 'refs' - 'inter' - 'nut' - 'ab';

  select coalesce(jsonb_agg(jsonb_build_object('id',id,'org',org,'title',title,'url',url,'ar',use_ar,'en',use_en,'kind',kind) order by id), '[]'::jsonb)
    into refs from private.pub_sources() where not deleted and not hidden;

  -- approved antibiotics and their approved interactions. Only reviewed rows reach visitors.
  select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'n',jsonb_build_object('ar',a.name_ar,'en',a.name_en),'aware',a.aware,
      'cls',jsonb_build_object('ar',a.class_ar,'en',a.class_en),'uses',jsonb_build_object('ar',a.uses_ar,'en',a.uses_en),
      'dose',jsonb_build_object('ar',a.dose_ar,'en',a.dose_en),'renal',jsonb_build_object('ar',a.renal_ar,'en',a.renal_en),
      'timing',jsonb_build_object('ar',a.timing_ar,'en',a.timing_en),'r',to_jsonb(a.source_ids),
      'inter',coalesce((select jsonb_agg(jsonb_build_object('b',jsonb_build_object('ar',x.with_ar,'en',x.with_en),'d',jsonb_build_object('ar',x.desc_ar,'en',x.desc_en),'sev',x.severity,'r',to_jsonb(x.source_ids)) order by x.sort, x.id)
                          from public.antibiotic_interactions x where x.drug_id = a.id and x.reviewed and not x.deleted), '[]'::jsonb)
    ) order by a.sort, a.id), '[]'::jsonb)
    into ab from public.antibiotics a where a.reviewed and not a.deleted and not a.hidden;

  -- 'inter' and 'nut' stay in the snapshot, empty, so an older page that reads them does not break
  snap := s || jsonb_build_object('refs', refs, 'inter', '[]'::jsonb, 'nut', jsonb_build_object('hide', '[]'::jsonb, 'custom', '[]'::jsonb), 'ab', ab, 'published_at', now());
  insert into site_config (id, data, updated_at, updated_by) values ('published', snap, now(), auth.uid())
    on conflict (id) do update set data = excluded.data, updated_at = now(), updated_by = auth.uid();
  insert into config_history (data, note) values (snap, note);
  return jsonb_build_object('refs', jsonb_array_length(refs), 'ab', jsonb_array_length(ab));
end $$;

create or replace function public.team_list() returns jsonb
  language plpgsql stable security definer set search_path = '' as $$
begin
  if coalesce(private.my_role(), '') <> 'owner' then raise exception 'only the owner'; end if;
  return jsonb_build_object(
    'members', coalesce((select jsonb_agg(jsonb_build_object(
        'id', m.user_id, 'email', m.email, 'name', m.name, 'role', m.role, 'status', m.status, 'perms', m.perms,
        'since', m.created_at, 'last', u.last_sign_in_at,
        'pending', (select count(*) from public.sources where updated_by = m.user_id and not reviewed and not deleted))
        order by (m.role = 'owner') desc, m.created_at)
      from public.members m left join auth.users u on u.id = m.user_id where m.status <> 'removed'), '[]'::jsonb),
    'invites', coalesce((select jsonb_agg(jsonb_build_object('email', i.email, 'name', i.name, 'perms', i.perms, 'at', i.created_at, 'key', i.token) order by i.created_at desc)
      from private.invites i where i.role = 'editor' and not i.revoked and i.used_at is null), '[]'::jsonb));
end $$;

-- the shared triggers on sources: the vitamin branches are removed
create or replace function private.content_guard() returns trigger
  language plpgsql security definer set search_path = '' as $$
declare
  skip constant text[] := array['sort', 'updated_at', 'updated_by', 'reviewed', 'reviewed_at', 'pub', 'author'];
  owner boolean := auth.uid() is null or coalesce(private.my_role(), '') = 'owner'; -- uid null = trusted migration
  changed boolean := tg_op = 'INSERT' or (to_jsonb(new) - skip) <> (to_jsonb(old) - skip);
begin
  -- the stamp: a pharmacist's change carries his name; a change by the owner clears it; approving keeps it
  if tg_op = 'UPDATE' then new.author := old.author; end if;
  if changed and auth.uid() is not null then new.author := case when owner then null else auth.uid() end; end if;
  if not owner then
    -- the approved version is never taken from a pharmacist's request
    new.pub := case when tg_op = 'INSERT' then null else old.pub end;
    if tg_op = 'UPDATE' and not changed then
      new.reviewed := old.reviewed;          -- nothing that visitors see changed
    else
      new.reviewed := false;
      if tg_op = 'UPDATE' and old.reviewed then new.pub := to_jsonb(old) - 'pub'; end if;
    end if;
  end if;
  if new.reviewed then
    if owner then new.pub := null; end if;   -- approved by the owner: nothing waiting any more
    if tg_op = 'INSERT' then new.reviewed_at := now();
    elsif not old.reviewed then new.reviewed_at := now();
    end if;
  else
    new.reviewed_at := null;
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;

create or replace function private.log_content() returns trigger
  language plpgsql security definer set search_path = '' as $$
declare
  k text := case tg_table_name when 'sources' then 'src' else tg_table_name end;
  n jsonb := to_jsonb(new); o jsonb; lab text; ch text; act text;
  meta text[] := array['updated_at','updated_by','reviewed','reviewed_at','pub','sort','author','deleted','hidden'];
begin
  lab := case k when 'src' then (n->>'id') || '. ' || coalesce(n->>'org', '') else coalesce(n->>'id', '') end;
  if tg_op = 'INSERT' then perform private.log(k, 'add', n->>'id', lab, null); return null; end if;
  o := to_jsonb(old);
  select string_agg(e.key, ',' order by e.key) into ch from jsonb_each(n) e where e.key <> all (meta) and e.value is distinct from o->e.key;
  if coalesce((n->>'deleted')::boolean, false) and not coalesce((o->>'deleted')::boolean, false) then act := 'del';
  elsif not coalesce((n->>'deleted')::boolean, false) and coalesce((o->>'deleted')::boolean, false) then act := 'restore';
  elsif coalesce((n->>'reviewed')::boolean, false) and not coalesce((o->>'reviewed')::boolean, false) then act := case when ch is null then 'approve' else 'reject' end;
  elsif ch is not null then act := 'edit';
  elsif (n->>'hidden') is distinct from (o->>'hidden') then act := case when coalesce((n->>'hidden')::boolean, false) then 'hide' else 'show' end;
  else return null; -- saved again without a change: nothing to log
  end if;
  if act = 'edit' and (n->>'hidden') is distinct from (o->>'hidden') then ch := ch || ',hidden'; end if;
  perform private.log(k, act, n->>'id', lab, case when act in ('edit','reject') then ch end);
  return null;
end $$;

-- ===== 2) remove the vitamin tables and their helpers (both tables are empty; soft-deleted rows were never published) =====
drop function if exists private.j_inter(public.interactions);
drop function if exists private.j_nut(public.nutrients);
drop function if exists private.pub_interactions();
drop function if exists private.pub_nutrients();
drop function if exists public.publish_config(text);
drop table if exists public.interactions;
drop table if exists public.nutrients;
-- the visit statistics of 1.17 (the dashboard and /api/hit were removed in 1.5.0; on TEST they were already dropped)
drop function if exists public.log_hits;
drop function if exists public.site_stats;
drop table if exists public.stat_counts;
drop table if exists public.stat_people;

-- ===== 3) trigger functions are not an API =====
revoke execute on function private.add_invited_member(), private.content_guard(), private.draft_guard(), private.guard_signup() from public, anon, authenticated;

-- ===== 4) fixed search path with pg_temp last on the antibiotic functions =====
alter function public.antibiotics_all() set search_path = public, pg_temp;
alter function public.antibiotic_save(jsonb) set search_path = public, pg_temp;
alter function public.antibiotic_set_flag(text, boolean, boolean) set search_path = public, pg_temp;
alter function public.antibiotic_interaction_save(jsonb) set search_path = public, pg_temp;
alter function public.antibiotic_interaction_delete(bigint) set search_path = public, pg_temp;
alter function public.antibiotic_approve(text) set search_path = public, pg_temp;
