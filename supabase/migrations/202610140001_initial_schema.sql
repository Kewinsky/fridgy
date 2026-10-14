begin;

create extension if not exists pgcrypto with schema extensions;

create table public.households (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 100),
  created_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  notification_days integer[] not null default '{0,1,3}',
  diet text not null default 'none',
  allergies text not null default '',
  excluded_ingredients text not null default '',
  deduction_mode text not null default 'ask' check (deduction_mode in ('always','never','ask')),
  receipt_mode text not null default 'review' check (receipt_mode in ('automatic','review')),
  currency text not null default 'PLN' check (currency in ('PLN','EUR','GBP','CHF')),
  date_format text not null default 'DD.MM.YYYY',
  preferred_cuisines text[] not null default '{Polska,Włoska,Azjatycka}',
  personalization_consent boolean not null default true,
  analytics_consent boolean not null default false
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 150),
  quantity numeric(12,3) not null check (quantity >= 0),
  unit text not null check (length(trim(unit)) between 1 and 30),
  category text not null,
  storage_location text not null check (storage_location in ('Lodówka','Zamrażarka','Spiżarnia')),
  estimated_use_by date not null,
  status text not null default 'active' check (status in ('active','consumed')),
  is_demo boolean not null default false,
  seed_key text,
  created_at timestamptz not null default now()
);
create index products_household_id_idx on public.products(household_id);

create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 150),
  done boolean not null default false,
  is_demo boolean not null default false,
  seed_key text,
  created_at timestamptz not null default now()
);
create index shopping_items_household_id_idx on public.shopping_items(household_id);

create table public.recipe_libraries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  library jsonb not null default '{"version":1,"customRecipes":[],"favoriteSlugs":[],"history":[]}'::jsonb
);

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  created_at timestamptz not null default now()
);

create table public.household_invitations (
  token uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  email text not null check (length(trim(email)) between 3 and 254),
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz
);
create index household_invitations_email_idx on public.household_invitations(lower(email));

revoke all on public.households, public.profiles, public.products, public.shopping_items,
  public.recipe_libraries, public.receipts, public.household_invitations from public, anon, authenticated;
grant select on public.households, public.profiles, public.recipe_libraries to authenticated;
grant select, insert, update, delete on public.products, public.shopping_items to authenticated;
grant update (library) on public.recipe_libraries to authenticated;
grant select, insert on public.receipts, public.household_invitations to authenticated;

create function public.is_household_member(target_household uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where user_id = (select auth.uid()) and household_id = target_household
  );
$$;

alter table public.households enable row level security;
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.shopping_items enable row level security;
alter table public.recipe_libraries enable row level security;
alter table public.receipts enable row level security;
alter table public.household_invitations enable row level security;

create policy "Members read household" on public.households for select to authenticated using (public.is_household_member(id));
create policy "Owners update household" on public.households for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
revoke update on public.households from public, anon, authenticated;
grant update (name) on public.households to authenticated;
create policy "Users read own profile" on public.profiles for select to authenticated using (user_id = (select auth.uid()));
create policy "Users update own profile" on public.profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and public.is_household_member(household_id));
revoke update on public.profiles from public, anon, authenticated;
grant update (notification_days, diet, allergies, excluded_ingredients, deduction_mode, receipt_mode,
  currency, date_format, preferred_cuisines, personalization_consent, analytics_consent)
  on public.profiles to authenticated;
create policy "Members read products" on public.products for select to authenticated using (public.is_household_member(household_id));
create policy "Members add products" on public.products for insert to authenticated with check (public.is_household_member(household_id));
create policy "Members update products" on public.products for update to authenticated using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "Members delete products" on public.products for delete to authenticated using (public.is_household_member(household_id));
create policy "Members read shopping" on public.shopping_items for select to authenticated using (public.is_household_member(household_id));
create policy "Members add shopping" on public.shopping_items for insert to authenticated with check (public.is_household_member(household_id));
create policy "Members update shopping" on public.shopping_items for update to authenticated using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "Members delete shopping" on public.shopping_items for delete to authenticated using (public.is_household_member(household_id));
create policy "Users read own recipes" on public.recipe_libraries for select to authenticated using (user_id = (select auth.uid()));
create policy "Users update own recipes" on public.recipe_libraries for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Members read receipts" on public.receipts for select to authenticated using (public.is_household_member(household_id));
create policy "Members add receipts" on public.receipts for insert to authenticated with check (public.is_household_member(household_id) and created_by = (select auth.uid()));
create policy "Owners manage invitations" on public.household_invitations for all to authenticated using (
  exists (select 1 from public.households where id = household_id and owner_id = (select auth.uid()))
) with check (
  exists (select 1 from public.households where id = household_id and owner_id = (select auth.uid()))
  and created_by = (select auth.uid())
);
revoke update on public.household_invitations from public, anon, authenticated;

create function public.bootstrap_fridgy_user(new_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare new_household uuid;
begin
  if exists (select 1 from public.profiles where user_id = new_user) then return; end if;
  insert into public.households(owner_id, name) values (new_user, 'Mój dom') returning id into new_household;
  insert into public.profiles(user_id, household_id) values (new_user, new_household);
  insert into public.recipe_libraries(user_id) values (new_user);
  insert into public.products(household_id, name, quantity, unit, category, storage_location, estimated_use_by, is_demo, seed_key) values
    (new_household, 'Mleko 2%', 1, 'l', 'Nabiał', 'Lodówka', current_date + 3, true, 'milk'),
    (new_household, 'Jajka', 6, 'szt.', 'Nabiał', 'Lodówka', current_date + 10, true, 'eggs'),
    (new_household, 'Pomidory', 4, 'szt.', 'Warzywa', 'Lodówka', current_date + 5, true, 'tomatoes'),
    (new_household, 'Makaron', 500, 'g', 'Sypkie', 'Spiżarnia', current_date + 180, true, 'pasta'),
    (new_household, 'Mrożony groszek', 450, 'g', 'Mrożonki', 'Zamrażarka', current_date + 90, true, 'peas');
  insert into public.shopping_items(household_id, name, is_demo, seed_key) values
    (new_household, 'Banany', true, 'bananas'), (new_household, 'Kawa ziarnista', true, 'coffee'), (new_household, 'Woda gazowana', true, 'water');
end;
$$;
revoke all on function public.bootstrap_fridgy_user(uuid) from public, anon, authenticated;

create function public.on_fridgy_user_created()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.bootstrap_fridgy_user(new.id);
  return new;
end;
$$;
revoke all on function public.on_fridgy_user_created() from public, anon, authenticated;
create trigger on_fridgy_user_created after insert on auth.users
for each row execute function public.on_fridgy_user_created();

do $$ declare existing_user record; begin
  for existing_user in select id from auth.users loop
    perform public.bootstrap_fridgy_user(existing_user.id);
  end loop;
end $$;

create function public.save_manual_receipt(receipt_items jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare target_household uuid; receipt_id uuid;
begin
  if jsonb_typeof(receipt_items) <> 'array' or jsonb_array_length(receipt_items) not between 1 and 100 then
    raise exception 'Invalid receipt items';
  end if;
  if exists (
    select 1 from jsonb_array_elements(receipt_items) as e(item)
    where length(trim(item->>'name')) not between 1 and 150
       or coalesce((item->>'quantity')::numeric, 0) <= 0
       or length(trim(item->>'unit')) not between 1 and 30
       or item->>'storageLocation' not in ('Lodówka','Zamrażarka','Spiżarnia')
       or item->>'category' not in ('Owoce','Nabiał','Warzywa','Mięso','Mrożonki','Ryby','Pieczywo','Sypkie','Przetwory')
       or (item->>'estimatedUseBy')::date is null
  ) then raise exception 'Invalid receipt product'; end if;
  select household_id into target_household from public.profiles where user_id = auth.uid();
  if target_household is null then raise exception 'Unauthenticated'; end if;
  insert into public.receipts(household_id, created_by, items)
    values (target_household, auth.uid(), receipt_items) returning id into receipt_id;
  insert into public.products(household_id, name, quantity, unit, category, storage_location, estimated_use_by)
    select target_household, trim(item->>'name'), (item->>'quantity')::numeric,
      trim(item->>'unit'), item->>'category', item->>'storageLocation', (item->>'estimatedUseBy')::date
    from jsonb_array_elements(receipt_items) as e(item);
  return receipt_id;
end;
$$;
revoke all on function public.save_manual_receipt(jsonb) from public;
grant execute on function public.save_manual_receipt(jsonb) to authenticated;

create function public.finish_fridgy_cooking(recipe_slug text, recipe_title text, recipe_cuisine text, deductions jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
declare target_household uuid; item jsonb; changed_rows integer;
begin
  if auth.uid() is null or length(trim(recipe_slug)) not between 1 and 150
     or length(trim(recipe_title)) not between 1 and 200
     or length(trim(recipe_cuisine)) not between 1 and 100
     or jsonb_typeof(deductions) <> 'array' or jsonb_array_length(deductions) > 100 then
    raise exception 'Invalid cooking session';
  end if;
  select household_id into target_household from public.profiles where user_id = auth.uid();
  if target_household is null then raise exception 'Unauthenticated'; end if;
  for item in select value from jsonb_array_elements(deductions) loop
    if (item->>'amount')::numeric <= 0 then raise exception 'Invalid deduction'; end if;
    update public.products set
      quantity = greatest(0, quantity - (item->>'amount')::numeric),
      status = case when quantity = (item->>'amount')::numeric then 'consumed' else status end
    where id = (item->>'productId')::uuid and household_id = target_household
      and status = 'active' and quantity >= (item->>'amount')::numeric;
    get diagnostics changed_rows = row_count;
    if changed_rows <> 1 then raise exception 'Product stock changed. Refresh and try again'; end if;
  end loop;
  update public.recipe_libraries set library = jsonb_set(
    library, '{history}',
    jsonb_build_array(jsonb_build_object(
      'id', gen_random_uuid(), 'recipeSlug', recipe_slug, 'recipeTitle', recipe_title,
      'cuisine', recipe_cuisine, 'cookedAt', now()
    )) || coalesce(library->'history', '[]'::jsonb)
  ) where user_id = auth.uid();
  get diagnostics changed_rows = row_count;
  if changed_rows <> 1 then raise exception 'Recipe library missing'; end if;
end;
$$;
revoke all on function public.finish_fridgy_cooking(text,text,text,jsonb) from public;
grant execute on function public.finish_fridgy_cooking(text,text,text,jsonb) to authenticated;

create function public.accept_household_invitation(invite_token uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare invitation public.household_invitations%rowtype; signed_in_email text; old_household uuid;
begin
  if auth.uid() is null then raise exception 'Unauthenticated'; end if;
  select email into signed_in_email from auth.users where id = auth.uid();
  select * into invitation from public.household_invitations where token = invite_token for update;
  if invitation.token is null or invitation.accepted_at is not null or invitation.expires_at < now()
     or lower(invitation.email) <> lower(signed_in_email) then
    raise exception 'Invitation unavailable';
  end if;
  select household_id into old_household from public.profiles where user_id = auth.uid();
  if old_household <> invitation.household_id and
     exists (select 1 from public.profiles where household_id = old_household and user_id <> auth.uid()) then
    raise exception 'Leave your current household first';
  end if;
  if old_household <> invitation.household_id and
     exists (select 1 from public.households where id = old_household and owner_id = auth.uid()) and
     (exists (select 1 from public.products where household_id = old_household and not is_demo)
      or exists (select 1 from public.shopping_items where household_id = old_household and not is_demo)
      or exists (select 1 from public.receipts where household_id = old_household)) then
    raise exception 'Export or clear your current household data before joining';
  end if;
  update public.profiles set household_id = invitation.household_id where user_id = auth.uid();
  if old_household <> invitation.household_id and
     exists (select 1 from public.households where id = old_household and owner_id = auth.uid()) then
    delete from public.households where id = old_household;
  end if;
  update public.household_invitations set accepted_at = now() where token = invite_token;
end;
$$;
revoke all on function public.accept_household_invitation(uuid) from public;
grant execute on function public.accept_household_invitation(uuid) to authenticated;

create function public.transfer_fridgy_household_owner(target_email text)
returns void language plpgsql security definer set search_path = '' as $$
declare target_household uuid; next_owner uuid;
begin
  select id into target_household from public.households where owner_id = auth.uid();
  if target_household is null then raise exception 'Only the owner can transfer the household'; end if;
  select users.id into next_owner from auth.users as users
    join public.profiles as members on members.user_id = users.id
    where members.household_id = target_household and lower(users.email) = lower(trim(target_email))
      and users.id <> auth.uid();
  if next_owner is null then raise exception 'The email is not a household member'; end if;
  update public.households set owner_id = next_owner where id = target_household;
end;
$$;
revoke all on function public.transfer_fridgy_household_owner(text) from public;
grant execute on function public.transfer_fridgy_household_owner(text) to authenticated;

create function public.reset_fridgy_demo()
returns void language plpgsql security definer set search_path = '' as $$
declare target_household uuid;
begin
  select id into target_household from public.households where owner_id = auth.uid();
  if target_household is null or
     (select count(*) from public.profiles where household_id = target_household) <> 1 then
    raise exception 'Reset is available only for a single-member household owner';
  end if;
  delete from public.products where household_id = target_household and is_demo;
  delete from public.shopping_items where household_id = target_household and is_demo;
  insert into public.products(household_id, name, quantity, unit, category, storage_location, estimated_use_by, is_demo, seed_key) values
    (target_household, 'Mleko 2%', 1, 'l', 'Nabiał', 'Lodówka', current_date + 3, true, 'milk'),
    (target_household, 'Jajka', 6, 'szt.', 'Nabiał', 'Lodówka', current_date + 10, true, 'eggs'),
    (target_household, 'Pomidory', 4, 'szt.', 'Warzywa', 'Lodówka', current_date + 5, true, 'tomatoes'),
    (target_household, 'Makaron', 500, 'g', 'Sypkie', 'Spiżarnia', current_date + 180, true, 'pasta'),
    (target_household, 'Mrożony groszek', 450, 'g', 'Mrożonki', 'Zamrażarka', current_date + 90, true, 'peas');
  insert into public.shopping_items(household_id, name, is_demo, seed_key) values
    (target_household, 'Banany', true, 'bananas'), (target_household, 'Kawa ziarnista', true, 'coffee'), (target_household, 'Woda gazowana', true, 'water');
end;
$$;
revoke all on function public.reset_fridgy_demo() from public;
grant execute on function public.reset_fridgy_demo() to authenticated;

commit;
