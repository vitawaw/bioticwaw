-- BIOTICWAW 1.4.x · applied on TEST 2026-11-09 (version 20261109122321). Apply on LIVE at release.
-- publish_site() also publishes the reviewed antibiotics and their reviewed interactions under the key 'ab'.
create or replace function public.publish_site(note text default '') returns jsonb
  language plpgsql security definer set search_path = 'public' as $$
declare s jsonb; inter jsonb; nut_custom jsonb; hide jsonb; refs jsonb; snap jsonb; ab jsonb;
begin
  if coalesce(private.my_role(), '') <> 'owner' then raise exception 'only the owner can publish'; end if;
  select data into s from site_config where id = 'draft';
  if s is null then select data into s from site_config where id = 'published'; end if;
  s := coalesce(s, '{}'::jsonb) - 'refs' - 'inter' - 'nut' - 'ab';

  select coalesce(jsonb_agg(id order by sort), '[]'::jsonb) into hide from private.pub_nutrients() where builtin and hidden;
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'n',jsonb_build_object('ar',name_ar,'en',name_en),'h',jsonb_build_object('ar',hint_ar,'en',hint_en),'uk',unit,'rows',dose_rows,'plan',jsonb_build_object('ar',plan_ar,'en',plan_en),'note',jsonb_build_object('ar',note_ar,'en',note_en),'r',to_jsonb(source_ids)) order by sort, id), '[]'::jsonb)
    into nut_custom from private.pub_nutrients() where not builtin and not hidden and not deleted;
  select coalesce(jsonb_agg(jsonb_build_object('k',i.nutrient_id,'a',jsonb_build_object('ar',i.supp_ar,'en',i.supp_en),'b',jsonb_build_object('ar',i.with_ar,'en',i.with_en),'d',jsonb_build_object('ar',i.desc_ar,'en',i.desc_en),'sev',i.severity,'r',to_jsonb(i.source_ids)) order by i.sort, i.id), '[]'::jsonb)
    into inter from private.pub_interactions() i join private.pub_nutrients() n on n.id = i.nutrient_id
    where not i.deleted and not i.hidden and not n.hidden and not n.deleted;
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'org',org,'title',title,'url',url,'ar',use_ar,'en',use_en,'kind',kind) order by id), '[]'::jsonb)
    into refs from private.pub_sources() where not deleted and not hidden;

  -- 1.18 (test): approved antibiotics and their approved interactions. Only reviewed rows reach visitors.
  select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'n',jsonb_build_object('ar',a.name_ar,'en',a.name_en),'aware',a.aware,
      'cls',jsonb_build_object('ar',a.class_ar,'en',a.class_en),'uses',jsonb_build_object('ar',a.uses_ar,'en',a.uses_en),
      'dose',jsonb_build_object('ar',a.dose_ar,'en',a.dose_en),'renal',jsonb_build_object('ar',a.renal_ar,'en',a.renal_en),
      'timing',jsonb_build_object('ar',a.timing_ar,'en',a.timing_en),'r',to_jsonb(a.source_ids),
      'inter',coalesce((select jsonb_agg(jsonb_build_object('b',jsonb_build_object('ar',x.with_ar,'en',x.with_en),'d',jsonb_build_object('ar',x.desc_ar,'en',x.desc_en),'sev',x.severity,'r',to_jsonb(x.source_ids)) order by x.sort, x.id)
                          from public.antibiotic_interactions x where x.drug_id = a.id and x.reviewed and not x.deleted), '[]'::jsonb)
    ) order by a.sort, a.id), '[]'::jsonb)
    into ab from public.antibiotics a where a.reviewed and not a.deleted and not a.hidden;

  snap := s || jsonb_build_object('refs', refs, 'inter', inter, 'nut', jsonb_build_object('hide', hide, 'custom', nut_custom), 'ab', ab, 'published_at', now());
  insert into site_config (id, data, updated_at, updated_by) values ('published', snap, now(), auth.uid())
    on conflict (id) do update set data = excluded.data, updated_at = now(), updated_by = auth.uid();
  insert into config_history (data, note) values (snap, note);
  return jsonb_build_object('refs', jsonb_array_length(refs), 'inter', jsonb_array_length(inter), 'custom', jsonb_array_length(nut_custom), 'ab', jsonb_array_length(ab));
end $$;
