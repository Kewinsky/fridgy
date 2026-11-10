begin;

alter table public.profiles alter column household_id drop not null;
alter table public.households add column onboarding_finished boolean not null default false;
update public.households set onboarding_finished = true;

create function public.complete_fridgy_onboarding_after_cooking()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.households set onboarding_finished = true where id = new.household_id;
  return new;
end;
$$;
create trigger complete_fridgy_onboarding_after_cooking
  after insert on public.cooking_history
  for each row execute function public.complete_fridgy_onboarding_after_cooking();
revoke all on function public.complete_fridgy_onboarding_after_cooking() from public, anon, authenticated;

create or replace function public.bootstrap_fridgy_user(new_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.profiles where user_id = new_user) then return; end if;
  insert into public.profiles(user_id) values (new_user);
end;
$$;

notify pgrst, 'reload schema';
commit;
