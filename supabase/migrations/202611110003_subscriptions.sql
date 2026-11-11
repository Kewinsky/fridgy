begin;

-- This table is the live source of truth for prices and limits. Edit its two rows to change a plan.
create table public.subscription_plans (
  id text primary key check (id in ('free', 'premium')),
  price_monthly_grosz integer check (price_monthly_grosz >= 0),
  price_yearly_grosz integer check (price_yearly_grosz >= 0),
  currency text not null default 'PLN',
  trial_days integer not null default 0 check (trial_days >= 0),
  saved_custom_recipes integer check (saved_custom_recipes >= 0),
  ai_uses_lifetime integer check (ai_uses_lifetime >= 0),
  ai_uses_monthly integer check (ai_uses_monthly >= 0),
  receipt_scans_monthly integer not null check (receipt_scans_monthly >= 0),
  -- shortcut: daily_recipe_ideas has one row per day, extend its key before allowing more than one.
  daily_ideas_per_day integer not null check (daily_ideas_per_day between 0 and 1),
  household_members integer not null check (household_members >= 1),
  check (id = 'free' or (price_monthly_grosz is not null and price_yearly_grosz is not null))
);
insert into public.subscription_plans
  (id, price_monthly_grosz, price_yearly_grosz, trial_days, saved_custom_recipes,
   ai_uses_lifetime, ai_uses_monthly, receipt_scans_monthly, daily_ideas_per_day, household_members)
values
  ('free', 0, 0, 0, 5, 5, null, 2, 0, 1),
  ('premium', 1999, 14999, 14, null, null, 30, 20, 1, 6);
revoke all on public.subscription_plans from public, anon, authenticated;
grant select on public.subscription_plans to anon, authenticated;
alter table public.subscription_plans enable row level security;
create policy "Visitors read plans" on public.subscription_plans for select to anon, authenticated using (true);

create table public.household_subscriptions (
  household_id uuid primary key references public.households(id) on delete cascade,
  source text check (source in ('trial', 'stripe', 'test')),
  premium_until timestamptz,
  trial_started_at timestamptz,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  billing_interval text check (billing_interval in ('monthly', 'yearly')),
  check ((source is null) = (premium_until is null))
);
alter table public.profiles
  add column premium_trial_started_at timestamptz,
  add column free_ai_uses_lifetime integer not null default 0 check (free_ai_uses_lifetime >= 0);
insert into public.household_subscriptions(household_id) select id from public.households;
revoke all on public.household_subscriptions from public, anon, authenticated;
grant select, insert, update on public.household_subscriptions to service_role;
alter table public.household_subscriptions enable row level security;

create function public.create_fridgy_subscription()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.household_subscriptions(household_id) values (new.id);
  return new;
end;
$$;
create trigger create_fridgy_subscription after insert on public.households
  for each row execute function public.create_fridgy_subscription();

create table public.subscription_usage (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  kind text not null check (kind in ('ai', 'receipt')),
  plan text not null check (plan in ('free', 'premium')),
  status text not null default 'pending' check (status in ('pending', 'success')),
  created_at timestamptz not null default now()
);
create index subscription_usage_count_idx on public.subscription_usage(household_id, kind, plan, created_at);
revoke all on public.subscription_usage from public, anon, authenticated;
alter table public.subscription_usage enable row level security;

create function public.count_fridgy_free_ai_use()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.status = 'pending' and new.status = 'success' and new.kind = 'ai' and new.plan = 'free' then
    update public.profiles set free_ai_uses_lifetime = free_ai_uses_lifetime + 1 where user_id = new.user_id;
  end if;
  return new;
end;
$$;
create trigger count_fridgy_free_ai_use after update of status on public.subscription_usage
  for each row execute function public.count_fridgy_free_ai_use();

create function public.fridgy_household_plan(target_household uuid)
returns text language sql stable security definer set search_path = '' as $$
  select case when s.premium_until > now() then 'premium' else 'free' end
  from public.household_subscriptions s where s.household_id = target_household;
$$;

create function public.get_fridgy_subscription(target_household uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare current_plan text; current_subscription public.household_subscriptions%rowtype;
  current_limits public.subscription_plans%rowtype; month_start timestamptz;
  ai_count integer; scan_count integer; recipe_count integer; member_count integer;
begin
  if auth.uid() is null or not public.is_household_member(target_household) then raise exception 'Unauthorized'; end if;
  select * into current_subscription from public.household_subscriptions where household_id = target_household;
  current_plan := coalesce(public.fridgy_household_plan(target_household), 'free');
  select * into current_limits from public.subscription_plans where id = current_plan;
  month_start := date_trunc('month', now() at time zone 'UTC') at time zone 'UTC';
  if current_plan = 'free' then
    select free_ai_uses_lifetime into ai_count from public.profiles where user_id = auth.uid();
  else
    select count(*) into ai_count from public.subscription_usage
      where household_id = target_household and kind = 'ai' and plan = 'premium'
        and status = 'success' and created_at >= month_start;
  end if;
  select count(*) into scan_count from public.subscription_usage
    where household_id = target_household and kind = 'receipt' and plan = current_plan
      and status = 'success' and created_at >= month_start;
  select count(*) into recipe_count from public.recipes
    where household_id = target_household and source = 'custom' and not is_demo;
  select count(*) into member_count from public.household_memberships where household_id = target_household;
  return jsonb_build_object(
    'plan', current_plan, 'source', case when current_plan = 'premium' then current_subscription.source else null end,
    'premiumUntil', case when current_plan = 'premium' then current_subscription.premium_until else null end,
    'trialUsed', current_subscription.trial_started_at is not null or exists (
      select 1 from public.profiles p join public.households h on h.owner_id = p.user_id
      where h.id = target_household and p.premium_trial_started_at is not null
    ),
    'aiUsed', ai_count, 'scansUsed', scan_count, 'customRecipes', recipe_count, 'members', member_count,
    'monthlyResetAt', month_start + interval '1 month', 'limits', to_jsonb(current_limits)
  );
end;
$$;

create function public.start_fridgy_trial(target_household uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare trial_length integer; owner_id uuid; owner_trial timestamptz;
begin
  perform public.assert_fridgy_active_household(target_household);
  if not public.is_fridgy_household_owner(target_household) then raise exception 'Only the owner can start the trial'; end if;
  select h.owner_id, p.premium_trial_started_at into owner_id, owner_trial
    from public.households h join public.profiles p on p.user_id = h.owner_id
    where h.id = target_household for update of p;
  if owner_trial is not null then return false; end if;
  select trial_days into trial_length from public.subscription_plans where id = 'premium';
  if trial_length < 1 then return false; end if;
  update public.household_subscriptions
    set source = 'trial', trial_started_at = now(), premium_until = now() + make_interval(days => trial_length)
    where household_id = target_household and trial_started_at is null
      and (premium_until is null or premium_until <= now());
  if not found then return false; end if;
  update public.profiles set premium_trial_started_at = now() where user_id = owner_id;
  return true;
end;
$$;

create function public.reserve_fridgy_usage(target_household uuid, target_kind text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare current_plan text; current_limits public.subscription_plans%rowtype;
  allowed_count integer; used_count integer; reservation uuid; month_start timestamptz;
begin
  perform public.assert_fridgy_active_household(target_household);
  if target_kind not in ('ai', 'receipt') then raise exception 'Invalid usage kind'; end if;
  if target_kind = 'ai' and coalesce(public.fridgy_household_plan(target_household), 'free') = 'free' then
    perform 1 from public.profiles where user_id = auth.uid() for update;
  else
    perform 1 from public.households where id = target_household for update;
  end if;
  current_plan := coalesce(public.fridgy_household_plan(target_household), 'free');
  select * into current_limits from public.subscription_plans where id = current_plan;
  if target_kind = 'ai' then
    if current_plan = 'free' then allowed_count := current_limits.ai_uses_lifetime;
    else allowed_count := current_limits.ai_uses_monthly; end if;
  else
    allowed_count := current_limits.receipt_scans_monthly;
  end if;
  month_start := date_trunc('month', now() at time zone 'UTC') at time zone 'UTC';
  if target_kind = 'ai' and current_plan = 'free' then
    select free_ai_uses_lifetime into used_count from public.profiles where user_id = auth.uid();
    used_count := used_count + (select count(*) from public.subscription_usage
      where user_id = auth.uid() and kind = 'ai' and plan = 'free'
        and status = 'pending' and created_at > now() - interval '15 minutes');
  else
    select count(*) into used_count from public.subscription_usage
      where household_id = target_household and kind = target_kind and plan = current_plan
        and (status = 'success' or (status = 'pending' and created_at > now() - interval '15 minutes'))
        and created_at >= month_start;
  end if;
  if allowed_count is not null and used_count >= allowed_count then return null; end if;
  insert into public.subscription_usage(household_id, user_id, kind, plan)
    values (target_household, auth.uid(), target_kind, current_plan) returning id into reservation;
  return reservation;
end;
$$;

create function public.finish_fridgy_usage(reservation_id uuid, succeeded boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare reservation public.subscription_usage%rowtype;
begin
  if succeeded is null then raise exception 'Invalid usage result'; end if;
  select * into reservation from public.subscription_usage where id = reservation_id for update;
  if reservation.id is null or reservation.user_id <> auth.uid() or reservation.status <> 'pending'
    or reservation.created_at <= now() - interval '15 minutes' then raise exception 'Usage reservation expired'; end if;
  if succeeded then update public.subscription_usage set status = 'success' where id = reservation_id;
  else delete from public.subscription_usage where id = reservation_id; end if;
end;
$$;

create function public.complete_fridgy_generation(reservation_id uuid, target_household uuid, recipes_payload jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare reservation public.subscription_usage%rowtype; item jsonb;
begin
  perform public.assert_fridgy_active_household(target_household);
  select * into reservation from public.subscription_usage where id = reservation_id for update;
  if reservation.id is null or reservation.user_id <> auth.uid() or reservation.household_id <> target_household
    or reservation.kind <> 'ai' or reservation.status <> 'pending'
    or reservation.created_at <= now() - interval '15 minutes'
    or jsonb_typeof(recipes_payload) <> 'array' or jsonb_array_length(recipes_payload) not between 1 and 3 then
    raise exception 'Invalid generation completion';
  end if;
  for item in select value from jsonb_array_elements(recipes_payload) loop
    if item->>'source' <> 'ai' or length(item->>'slug') not between 1 and 150
      or length(item->>'title') not between 1 and 200 then raise exception 'Invalid generated recipe'; end if;
    insert into public.recipes(user_id, household_id, slug, source, recipe, created_at)
      values (auth.uid(), target_household, item->>'slug', 'ai', item, now());
  end loop;
  update public.subscription_usage set status = 'success' where id = reservation_id;
end;
$$;

create function public.check_fridgy_custom_recipe_limit()
returns trigger language plpgsql security definer set search_path = '' as $$
declare allowed_count integer; current_count integer;
begin
  if new.source <> 'custom' or new.is_demo then return new; end if;
  perform 1 from public.households where id = new.household_id for update;
  select saved_custom_recipes into allowed_count from public.subscription_plans
    where id = coalesce(public.fridgy_household_plan(new.household_id), 'free');
  if allowed_count is null then return new; end if;
  select count(*) into current_count from public.recipes
    where household_id = new.household_id and source = 'custom' and not is_demo;
  if current_count >= allowed_count then raise exception 'PLAN_LIMIT_CUSTOM_RECIPES'; end if;
  return new;
end;
$$;
create trigger check_fridgy_custom_recipe_limit before insert on public.recipes
  for each row execute function public.check_fridgy_custom_recipe_limit();

create function public.check_fridgy_member_limit()
returns trigger language plpgsql security definer set search_path = '' as $$
declare allowed_count integer; current_count integer;
begin
  perform 1 from public.households where id = new.household_id for update;
  select household_members into allowed_count from public.subscription_plans
    where id = coalesce(public.fridgy_household_plan(new.household_id), 'free');
  select count(*) into current_count from public.household_memberships where household_id = new.household_id;
  if current_count >= allowed_count then raise exception 'PLAN_LIMIT_MEMBERS'; end if;
  return new;
end;
$$;
create trigger check_fridgy_member_limit before insert on public.household_memberships
  for each row execute function public.check_fridgy_member_limit();

create function public.check_fridgy_daily_idea_limit()
returns trigger language plpgsql security definer set search_path = '' as $$
declare allowed_count integer;
begin
  select daily_ideas_per_day into allowed_count from public.subscription_plans
    where id = coalesce(public.fridgy_household_plan(new.household_id), 'free');
  if allowed_count < 1 then raise exception 'PLAN_LIMIT_DAILY_IDEA'; end if;
  return new;
end;
$$;
create trigger check_fridgy_daily_idea_limit before insert on public.daily_recipe_ideas
  for each row execute function public.check_fridgy_daily_idea_limit();

-- Generated recipes are written only by the completion RPC after the usage is charged.
drop policy "Members add household recipes" on public.recipes;
create policy "Owners add custom recipes" on public.recipes for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_fridgy_household_owner(household_id)
    and source = 'custom' and not is_demo);

revoke all on function public.create_fridgy_subscription(), public.count_fridgy_free_ai_use(),
  public.fridgy_household_plan(uuid),
  public.get_fridgy_subscription(uuid), public.start_fridgy_trial(uuid),
  public.reserve_fridgy_usage(uuid,text), public.finish_fridgy_usage(uuid,boolean),
  public.complete_fridgy_generation(uuid,uuid,jsonb), public.check_fridgy_custom_recipe_limit(),
  public.check_fridgy_member_limit(), public.check_fridgy_daily_idea_limit()
  from public, anon, authenticated;
grant execute on function public.get_fridgy_subscription(uuid), public.start_fridgy_trial(uuid),
  public.reserve_fridgy_usage(uuid,text), public.finish_fridgy_usage(uuid,boolean),
  public.complete_fridgy_generation(uuid,uuid,jsonb) to authenticated;

do $$
begin
  if (select count(*) from public.subscription_plans) <> 2
    or exists (select 1 from public.households h left join public.household_subscriptions s
      on s.household_id = h.id where s.household_id is null) then
    raise exception 'Subscription plans or existing households were not initialized';
  end if;
end;
$$;

notify pgrst, 'reload schema';
commit;
