alter table public.profiles add column username text;

update public.profiles as profile
set username = left(
  coalesce(
    nullif(btrim(account.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(account.email, '@', 1), ''),
    account.id::text
  ),
  100
)
from auth.users as account
where profile.user_id = account.id;

alter table public.profiles
  alter column username set default 'User',
  alter column username set not null;

alter table public.profiles
  add constraint profiles_username_length check (length(btrim(username)) between 1 and 100);

grant update (username) on public.profiles to authenticated;

create or replace function public.on_fridgy_user_created()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.bootstrap_fridgy_user(new.id);
  update public.profiles
  set username = left(
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(new.email, '@', 1), ''),
      new.id::text
    ),
    100
  )
  where user_id = new.id;
  return new;
end;
$$;
