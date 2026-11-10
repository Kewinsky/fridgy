begin;

-- Old recipes have no household identity. Assign each to its author's active household.
alter table public.recipes add column household_id uuid references public.households(id) on delete cascade;
update public.recipes r set household_id = d.household_id
  from public.daily_recipe_ideas d
  where d.user_id = r.user_id and d.recipe_slug = r.slug;
update public.recipes r set household_id = p.household_id
  from public.profiles p where p.user_id = r.user_id and r.household_id is null;
alter table public.recipes alter column household_id set not null;
alter table public.recipes drop constraint recipes_pkey;
alter table public.recipes add primary key (household_id, slug);
alter table public.recipes drop constraint recipes_user_id_fkey;
drop index public.recipes_user_created_idx;
create index recipes_household_created_idx on public.recipes(household_id, created_at desc);

create function public.keep_fridgy_recipe_assignment()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' and new.household_id is null then
    select household_id into new.household_id from public.profiles where user_id = new.user_id;
  end if;
  if tg_op = 'UPDATE' then
    if new.household_id is distinct from old.household_id
       or new.user_id is distinct from old.user_id then
      raise exception 'Recipe household and author cannot change';
    end if;
  end if;
  return new;
end;
$$;
create trigger keep_fridgy_recipe_assignment before insert or update on public.recipes
  for each row execute function public.keep_fridgy_recipe_assignment();
revoke all on function public.keep_fridgy_recipe_assignment() from public, anon, authenticated;

drop policy "Household members read shared recipes" on public.recipes;
drop policy "Users add own recipes" on public.recipes;
drop policy "Users update own recipes" on public.recipes;
drop policy "Users delete own recipes" on public.recipes;
create policy "Members read household recipes" on public.recipes for select to authenticated
  using (public.is_household_member(household_id));
create policy "Members add household recipes" on public.recipes for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_household_member(household_id));
create policy "Members edit household recipes" on public.recipes for update to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));
create policy "Members delete household recipes" on public.recipes for delete to authenticated
  using (public.is_household_member(household_id));

alter table public.recipe_libraries rename to user_recipe_libraries_legacy;
create table public.recipe_libraries (
  household_id uuid primary key references public.households(id) on delete cascade,
  library jsonb not null default '{"version":1,"favoriteSlugs":[],"history":[]}'::jsonb
    check (jsonb_typeof(library) = 'object')
);
insert into public.recipe_libraries(household_id, library)
select h.id, jsonb_build_object(
  'version', 1,
  'favoriteSlugs', coalesce((
    select jsonb_agg(distinct favorite.value)
    from public.profiles p
    join public.user_recipe_libraries_legacy l on l.user_id = p.user_id
    cross join lateral jsonb_array_elements_text(coalesce(l.library->'favoriteSlugs', '[]'::jsonb)) favorite(value)
    where p.household_id = h.id
  ), '[]'::jsonb),
  'history', coalesce((
    select jsonb_agg(record.value order by record.value->>'cookedAt' desc)
    from public.profiles p
    join public.user_recipe_libraries_legacy l on l.user_id = p.user_id
    cross join lateral jsonb_array_elements(coalesce(l.library->'history', '[]'::jsonb)) record(value)
    where p.household_id = h.id
  ), '[]'::jsonb)
) from public.households h;
revoke all on public.recipe_libraries from public, anon, authenticated;
grant select on public.recipe_libraries to authenticated;
alter table public.recipe_libraries enable row level security;
create policy "Members read household recipe library" on public.recipe_libraries
  for select to authenticated using (public.is_household_member(household_id));

create or replace function public.assert_fridgy_active_household(expected_household uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare active_household uuid;
begin
  select household_id into active_household from public.profiles
    where user_id = auth.uid() for share;
  if auth.uid() is null or expected_household is null
     or active_household is distinct from expected_household
     or not coalesce(public.is_household_member(expected_household), false) then
    raise exception 'Active household changed. Refresh and try again';
  end if;
end;
$$;

create function public.toggle_fridgy_household_favorite(target_slug text, expected_household uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare current_library jsonb; favorites jsonb;
begin
  if target_slug is null or length(trim(target_slug)) not between 1 and 150 then
    raise exception 'Invalid recipe slug';
  end if;
  perform public.assert_fridgy_active_household(expected_household);
  if not exists (select 1 from public.recipes
    where household_id = expected_household and slug = target_slug) then
    raise exception 'Recipe not found';
  end if;
  select library into current_library from public.recipe_libraries
    where household_id = expected_household for update;
  if current_library is null then raise exception 'Recipe library missing'; end if;
  favorites := coalesce(current_library->'favoriteSlugs', '[]'::jsonb);
  if favorites ? target_slug then
    select coalesce(jsonb_agg(value), '[]'::jsonb) into favorites
    from jsonb_array_elements_text(favorites) as entries(value) where value <> target_slug;
  else
    favorites := favorites || jsonb_build_array(target_slug);
  end if;
  current_library := jsonb_set(current_library, '{favoriteSlugs}', favorites);
  update public.recipe_libraries set library = current_library where household_id = expected_household;
  return current_library;
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
  update public.recipe_libraries set library = jsonb_set(
    library, '{history}',
    jsonb_build_array(jsonb_build_object(
      'id', gen_random_uuid(), 'recipeSlug', recipe_slug, 'recipeTitle', recipe_title,
      'cuisine', recipe_cuisine, 'cookedAt', now()
    )) || coalesce(library->'history', '[]'::jsonb)
  ) where household_id = target_household;
  get diagnostics changed_rows = row_count;
  if changed_rows <> 1 then raise exception 'Recipe library missing'; end if;
end;
$$;
revoke all on function public.finish_fridgy_cooking(text,text,text,jsonb) from public, anon, authenticated;

create function public.delete_fridgy_custom_recipe(target_slug text, expected_household uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if target_slug is null or length(trim(target_slug)) not between 1 and 150 then
    raise exception 'Invalid recipe';
  end if;
  perform public.assert_fridgy_active_household(expected_household);
  delete from public.recipes where household_id = expected_household and slug = target_slug and source = 'custom';
  if not found then raise exception 'Recipe not found'; end if;
  update public.recipe_libraries set library = jsonb_set(
    jsonb_set(library, '{favoriteSlugs}', coalesce((
      select jsonb_agg(value) from jsonb_array_elements_text(coalesce(library->'favoriteSlugs', '[]'::jsonb)) f(value)
      where value <> target_slug
    ), '[]'::jsonb)),
    '{history}', coalesce((
      select jsonb_agg(value) from jsonb_array_elements(coalesce(library->'history', '[]'::jsonb)) h(value)
      where value->>'recipeSlug' <> target_slug
    ), '[]'::jsonb)
  ) where household_id = expected_household;
end;
$$;
revoke all on function public.delete_fridgy_custom_recipe(text,uuid) from public, anon;
grant execute on function public.delete_fridgy_custom_recipe(text,uuid) to authenticated;
drop function public.delete_fridgy_custom_recipe(text);

create or replace function public.prune_fridgy_recipe_history()
returns void language plpgsql security definer set search_path = '' as $$
declare target_household uuid;
begin
  select household_id into target_household from public.profiles where user_id = auth.uid();
  if target_household is null then raise exception 'Unauthorized'; end if;
  perform public.assert_fridgy_active_household(target_household);
  perform 1 from public.recipe_libraries where household_id = target_household for update;
  if not found then raise exception 'Recipe library not found'; end if;
  delete from public.recipes r
  where r.household_id = target_household and r.source = 'ai'
    and r.created_at <= now() - interval '7 days'
    and not exists (
      select 1 from public.recipe_libraries l
      where l.household_id = target_household
        and coalesce(l.library->'favoriteSlugs', '[]'::jsonb) ? r.slug
    );
end;
$$;

create or replace function public.reset_fridgy_demo()
returns void language plpgsql security definer set search_path = '' as $$
declare target_household uuid; demo_slugs text[];
begin
  select h.id into target_household from public.households h
    join public.profiles p on p.household_id = h.id
    where p.user_id = auth.uid() and h.owner_id = auth.uid();
  if target_household is null then raise exception 'Only the household owner can remove demo data'; end if;
  select array_agg(slug) into demo_slugs from public.recipes
    where household_id = target_household and is_demo;
  delete from public.recipes where household_id = target_household and is_demo;
  delete from public.products where household_id = target_household and is_demo;
  delete from public.shopping_items where household_id = target_household and is_demo;
  if demo_slugs is not null then
    update public.recipe_libraries l set library = jsonb_set(
      jsonb_set(l.library, '{favoriteSlugs}', coalesce((
        select jsonb_agg(value) from jsonb_array_elements_text(coalesce(l.library->'favoriteSlugs', '[]'::jsonb)) favorites(value)
        where value <> all(demo_slugs)
      ), '[]'::jsonb)),
      '{history}', coalesce((
        select jsonb_agg(value) from jsonb_array_elements(coalesce(l.library->'history', '[]'::jsonb)) records(value)
        where value->>'recipeSlug' <> all(demo_slugs)
      ), '[]'::jsonb)
    ) where l.household_id = target_household;
  end if;
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
  insert into public.recipe_libraries(household_id) values (new_household);
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
  insert into public.recipe_libraries(household_id) values (new_household);
  update public.profiles set household_id = new_household where user_id = current_user_id;
  if not found then raise exception 'Profile missing'; end if;
  if include_demo_data then
    perform public.seed_fridgy_household(new_household);
  end if;
  return new_household;
end;
$$;

drop policy "Members read household recipe images" on storage.objects;
create policy "Members read household recipe images" on storage.objects for select to authenticated
  using (
    bucket_id = 'recipe-images' and exists (
      select 1 from public.recipes r
      where coalesce(r.recipe->>'imageOwnerId', r.user_id::text) = (storage.foldername(name))[1]
        and r.recipe->>'imagePath' = split_part(name, '/', 2)
        and public.is_household_member(r.household_id)
    )
  );

delete from public.daily_recipe_ideas d using (
  select ctid, row_number() over (
    partition by household_id, idea_date
    order by case status when 'ready' then 0 when 'pending' then 1 else 2 end, reserved_at
  ) as rn from public.daily_recipe_ideas
) duplicates where d.ctid = duplicates.ctid and duplicates.rn > 1;
alter table public.daily_recipe_ideas drop constraint daily_recipe_ideas_pkey;
alter table public.daily_recipe_ideas add primary key (household_id, idea_date);
alter table public.daily_recipe_ideas drop constraint daily_recipe_ideas_user_id_fkey;
drop policy "Users read own daily ideas" on public.daily_recipe_ideas;
create policy "Members read household daily ideas" on public.daily_recipe_ideas
  for select to authenticated using (public.is_household_member(household_id));

create or replace function public.reserve_fridgy_daily_idea(target_household uuid, target_date date)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or target_date <> (now() at time zone 'Europe/Warsaw')::date
     or not exists (select 1 from public.profiles where user_id = auth.uid() and household_id = target_household) then
    raise exception 'Daily idea unavailable';
  end if;
  insert into public.daily_recipe_ideas(user_id, household_id, idea_date)
    values (auth.uid(), target_household, target_date) on conflict (household_id, idea_date) do nothing;
  return found;
end;
$$;

create or replace function public.complete_fridgy_daily_idea(target_household uuid, target_date date, recipe_payload jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare target_slug text := recipe_payload->>'slug';
begin
  if auth.uid() is null or recipe_payload->>'source' <> 'ai'
     or target_slug !~ '^ai-[0-9a-f-]{36}$'
     or not exists (select 1 from public.daily_recipe_ideas
       where household_id = target_household and idea_date = target_date
         and user_id = auth.uid() and status = 'pending') then
    raise exception 'Daily idea unavailable';
  end if;
  perform public.assert_fridgy_active_household(target_household);
  insert into public.recipes(user_id, household_id, slug, source, recipe)
    values (auth.uid(), target_household, target_slug, 'ai', recipe_payload);
  update public.daily_recipe_ideas set status = 'ready', recipe_slug = target_slug
    where household_id = target_household and idea_date = target_date and status = 'pending';
  if not found then raise exception 'Daily idea unavailable'; end if;
end;
$$;

drop table public.user_recipe_libraries_legacy;
notify pgrst, 'reload schema';
commit;
