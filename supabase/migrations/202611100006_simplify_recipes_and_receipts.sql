begin;

alter table public.recipes add column is_favorite boolean not null default false;
update public.recipes r set is_favorite = true
from public.recipe_libraries l
where l.household_id = r.household_id
  and coalesce(l.library->'favoriteSlugs', '[]'::jsonb) ? r.slug;

create table public.cooking_history (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  recipe_slug text not null,
  recipe_title text not null,
  cuisine text not null,
  cooked_at timestamptz not null default now()
);
create index cooking_history_household_date_idx on public.cooking_history(household_id, cooked_at desc);
insert into public.cooking_history(household_id, recipe_slug, recipe_title, cuisine, cooked_at)
select l.household_id, record.value->>'recipeSlug', record.value->>'recipeTitle',
  record.value->>'cuisine', (record.value->>'cookedAt')::timestamptz
from public.recipe_libraries l
cross join lateral jsonb_array_elements(coalesce(l.library->'history', '[]'::jsonb)) record(value);
revoke all on public.cooking_history from public, anon, authenticated;
grant select on public.cooking_history to authenticated;
alter table public.cooking_history enable row level security;
create policy "Members read household cooking history" on public.cooking_history
  for select to authenticated using (public.is_household_member(household_id));

drop function public.toggle_fridgy_household_favorite(text,uuid);
create function public.toggle_fridgy_household_favorite(target_slug text, expected_household uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare favorite boolean;
begin
  if target_slug is null or length(trim(target_slug)) not between 1 and 150 then
    raise exception 'Invalid recipe slug';
  end if;
  perform public.assert_fridgy_active_household(expected_household);
  update public.recipes set is_favorite = not is_favorite
    where household_id = expected_household and slug = target_slug
    returning is_favorite into favorite;
  if not found then raise exception 'Recipe not found'; end if;
  return favorite;
end;
$$;
revoke all on function public.toggle_fridgy_household_favorite(text,uuid) from public, anon;
grant execute on function public.toggle_fridgy_household_favorite(text,uuid) to authenticated;

create or replace function public.finish_fridgy_cooking(recipe_slug text, recipe_title text, recipe_cuisine text, deductions jsonb)
returns void language plpgsql security definer set search_path = '' as $$
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
  insert into public.cooking_history(household_id, recipe_slug, recipe_title, cuisine)
    values (target_household, recipe_slug, recipe_title, recipe_cuisine);
end;
$$;

create or replace function public.delete_fridgy_custom_recipe(target_slug text, expected_household uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if target_slug is null or length(trim(target_slug)) not between 1 and 150 then
    raise exception 'Invalid recipe';
  end if;
  perform public.assert_fridgy_active_household(expected_household);
  delete from public.recipes where household_id = expected_household and slug = target_slug and source = 'custom';
  if not found then raise exception 'Recipe not found'; end if;
  delete from public.cooking_history where household_id = expected_household and recipe_slug = target_slug;
end;
$$;

create or replace function public.prune_fridgy_recipe_history()
returns void language plpgsql security definer set search_path = '' as $$
declare target_household uuid;
begin
  select household_id into target_household from public.profiles where user_id = auth.uid();
  if target_household is null then raise exception 'Unauthorized'; end if;
  perform public.assert_fridgy_active_household(target_household);
  with removed as (
    delete from public.recipes
    where household_id = target_household and source = 'ai' and not is_favorite
      and created_at <= now() - interval '7 days'
    returning slug
  )
  delete from public.cooking_history
    where household_id = target_household and recipe_slug in (select slug from removed);
end;
$$;

create or replace function public.reset_fridgy_demo()
returns void language plpgsql security definer set search_path = '' as $$
declare target_household uuid;
begin
  select h.id into target_household from public.households h
    join public.profiles p on p.household_id = h.id
    where p.user_id = auth.uid() and h.owner_id = auth.uid();
  if target_household is null then raise exception 'Only the household owner can remove demo data'; end if;
  with removed as (
    delete from public.recipes where household_id = target_household and is_demo returning slug
  )
  delete from public.cooking_history
    where household_id = target_household and recipe_slug in (select slug from removed);
  delete from public.products where household_id = target_household and is_demo;
  delete from public.shopping_items where household_id = target_household and is_demo;
end;
$$;

create or replace function public.bootstrap_fridgy_user(new_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare new_household uuid;
begin
  if exists (select 1 from public.profiles where user_id = new_user) then return; end if;
  insert into public.households(owner_id, name) values (new_user, 'Mój dom') returning id into new_household;
  insert into public.profiles(user_id, household_id) values (new_user, new_household);
  insert into public.household_memberships(household_id, user_id) values (new_household, new_user);
  perform public.seed_fridgy_household(new_household);
  perform public.seed_fridgy_user_recipes(new_user);
end;
$$;

create or replace function public.create_fridgy_household(household_name text, include_demo_data boolean)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_household uuid; current_user_id uuid := auth.uid();
begin
  if current_user_id is null or household_name is null
     or length(trim(household_name)) not between 1 and 100 or include_demo_data is null then
    raise exception 'Invalid household input';
  end if;
  insert into public.households(owner_id, name) values (current_user_id, trim(household_name)) returning id into new_household;
  insert into public.household_memberships(household_id, user_id) values (new_household, current_user_id);
  update public.profiles set household_id = new_household where user_id = current_user_id;
  if not found then raise exception 'Profile missing'; end if;
  if include_demo_data then perform public.seed_fridgy_household(new_household); end if;
  return new_household;
end;
$$;

drop table public.recipe_libraries;

drop function public.save_manual_receipt_for_household(jsonb,uuid);
drop function public.save_manual_receipt(jsonb);
create function public.save_manual_receipt(receipt_items jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
declare target_household uuid;
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
       or item->>'category' not in (
         'Owoce','Nabiał','Warzywa','Mięso','Mrożonki','Ryby','Pieczywo','Sypkie','Przetwory',
         'Napoje','Słodycze i przekąski','Przyprawy i dodatki','Inne'
       )
       or (item->>'estimatedUseBy')::date is null
  ) then raise exception 'Invalid receipt product'; end if;
  select household_id into target_household from public.profiles where user_id = auth.uid();
  if target_household is null then raise exception 'Unauthenticated'; end if;
  insert into public.products(household_id, name, quantity, unit, category, storage_location, estimated_use_by)
    select target_household, trim(item->>'name'), (item->>'quantity')::numeric,
      trim(item->>'unit'), item->>'category', item->>'storageLocation', (item->>'estimatedUseBy')::date
    from jsonb_array_elements(receipt_items) as e(item);
end;
$$;
revoke all on function public.save_manual_receipt(jsonb) from public, anon, authenticated;

create function public.save_manual_receipt_for_household(receipt_items jsonb, expected_household uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.assert_fridgy_active_household(expected_household);
  perform public.save_manual_receipt(receipt_items);
end;
$$;
revoke all on function public.save_manual_receipt_for_household(jsonb,uuid) from public, anon;
grant execute on function public.save_manual_receipt_for_household(jsonb,uuid) to authenticated;

drop table public.receipts;
notify pgrst, 'reload schema';
commit;
