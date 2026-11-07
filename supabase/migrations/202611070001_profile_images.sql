alter table public.profiles
  add column avatar_path text
  check (avatar_path is null or avatar_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$');

grant update (avatar_path) on public.profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-images',
  'profile-images',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "Users upload own profile images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users read own profile images"
on storage.objects for select to authenticated
using (
  bucket_id = 'profile-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users delete own profile images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'profile-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
