-- Recreate this already-applied hardening migration when provisioning another Supabase project.
-- Existing browser clients must not be able to erase cloud learning records with a NULL tombstone.
create or replace function public.study_sync_cas(
  p_app_id text, p_storage_key text, p_value text, p_expected_revision bigint
) returns table(applied boolean, revision bigint, value text)
language plpgsql security invoker set search_path = ''
as $$
declare r public.study_sync_entries%rowtype;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if p_value is null then
    raise exception 'Null cloud sync writes are forbidden (data-loss protection)' using errcode = '22004';
  end if;
  if p_app_id not in ('os-lab', 'self-research')
     or length(p_storage_key) not between 1 and 400
     or p_expected_revision < 0 or length(p_value) > 1048576 then
    raise exception 'Invalid study sync input';
  end if;
  if p_expected_revision = 0 then
    insert into public.study_sync_entries (user_id, app_id, storage_key, value)
    values ((select auth.uid()), p_app_id, p_storage_key, p_value)
    on conflict do nothing returning * into r;
    if found then return query select true, r.revision, r.value; return; end if;
  else
    update public.study_sync_entries e
       set value = p_value, revision = e.revision + 1, updated_at = now()
     where e.user_id = (select auth.uid()) and e.app_id = p_app_id
       and e.storage_key = p_storage_key and e.revision = p_expected_revision
     returning * into r;
    if found then return query select true, r.revision, r.value; return; end if;
  end if;
  select * into r from public.study_sync_entries e where e.user_id = (select auth.uid())
    and e.app_id = p_app_id and e.storage_key = p_storage_key;
  return query select false, coalesce(r.revision, 0), r.value;
end; $$;
revoke all on function public.study_sync_cas(text,text,text,bigint) from public, anon;
grant execute on function public.study_sync_cas(text,text,text,bigint) to authenticated;
