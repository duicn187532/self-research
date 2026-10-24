-- Additional server-side guard. Existing NULL rows are historical damage; do not
-- delete or rewrite them, because users might need browser backup restoration.
-- NOT VALID allows preserving those old rows while blocking future NULL inserts/updates.
alter table public.study_sync_entries
  add constraint study_sync_value_not_null check (value is not null) not valid;
