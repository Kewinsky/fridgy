begin;

create table public.daily_recipe_ideas (
  user_id uuid not null references auth.users(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  idea_date date not null,
  status text not null default 'pending' check (status in ('pending', 'ready', 'failed')),
  recipe_slug text,
  reserved_at timestamptz not null default now(),
  primary key (user_id, household_id, idea_date)
);
revoke all on public.daily_recipe_ideas from public, anon, authenticated;
grant select on public.daily_recipe_ideas to authenticated;
alter table public.daily_recipe_ideas enable row level security;
create policy "Users read own daily ideas" on public.daily_recipe_ideas
  for select to authenticated using (user_id = (select auth.uid()));

create function public.reserve_fridgy_daily_idea(target_household uuid, target_date date)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or target_date <> (now() at time zone 'Europe/Warsaw')::date
     or not exists (select 1 from public.profiles where user_id = auth.uid() and household_id = target_household) then
    raise exception 'Daily idea unavailable';
  end if;
  insert into public.daily_recipe_ideas(user_id, household_id, idea_date)
    values (auth.uid(), target_household, target_date) on conflict do nothing;
  return found;
end;
$$;
revoke all on function public.reserve_fridgy_daily_idea(uuid,date) from public, anon;
grant execute on function public.reserve_fridgy_daily_idea(uuid,date) to authenticated;

create function public.complete_fridgy_daily_idea(target_household uuid, target_date date, recipe_payload jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare target_slug text := recipe_payload->>'slug';
begin
  if auth.uid() is null or recipe_payload->>'source' <> 'ai'
     or target_slug !~ '^ai-[0-9a-f-]{36}$'
     or not exists (select 1 from public.daily_recipe_ideas
       where user_id = auth.uid() and household_id = target_household and idea_date = target_date and status = 'pending') then
    raise exception 'Daily idea unavailable';
  end if;
  insert into public.recipes(user_id, slug, source, recipe)
    values (auth.uid(), target_slug, 'ai', recipe_payload);
  update public.daily_recipe_ideas set status = 'ready', recipe_slug = target_slug
    where user_id = auth.uid() and household_id = target_household and idea_date = target_date and status = 'pending';
  if not found then raise exception 'Daily idea unavailable'; end if;
end;
$$;
revoke all on function public.complete_fridgy_daily_idea(uuid,date,jsonb) from public, anon;
grant execute on function public.complete_fridgy_daily_idea(uuid,date,jsonb) to authenticated;

create function public.fail_fridgy_daily_idea(target_household uuid, target_date date)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.daily_recipe_ideas set status = 'failed'
    where user_id = auth.uid() and household_id = target_household and idea_date = target_date and status = 'pending';
end;
$$;
revoke all on function public.fail_fridgy_daily_idea(uuid,date) from public, anon;
grant execute on function public.fail_fridgy_daily_idea(uuid,date) to authenticated;

notify pgrst, 'reload schema';

commit;
