-- Apply after schema.sql. SECURITY INVOKER enforces owner RLS for writes.
grant insert, update on public.study_sync_entries to authenticated;
drop policy if exists study_sync_owner_insert on public.study_sync_entries;
create policy study_sync_owner_insert on public.study_sync_entries for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists study_sync_owner_update on public.study_sync_entries;
create policy study_sync_owner_update on public.study_sync_entries for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
alter function public.study_sync_cas(text,text,text,bigint) security invoker;
