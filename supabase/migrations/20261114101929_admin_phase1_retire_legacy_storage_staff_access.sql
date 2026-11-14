-- Verification documents remain private; only the admin Worker service role accesses them.
drop policy if exists "Staff can view professional verification files" on storage.objects;
