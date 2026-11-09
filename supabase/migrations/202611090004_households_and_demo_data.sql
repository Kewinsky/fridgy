begin;

create table public.household_memberships (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (household_id, user_id)
);
create index household_memberships_user_idx on public.household_memberships(user_id);
insert into public.household_memberships(household_id, user_id)
select household_id, user_id from public.profiles;
revoke all on public.household_memberships from public, anon, authenticated;
grant select on public.household_memberships to authenticated;
alter table public.household_memberships enable row level security;
create policy "Users read own memberships" on public.household_memberships
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_household_member(target_household uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.household_memberships
    where user_id = (select auth.uid()) and household_id = target_household
  );
$$;

alter table public.recipes add column is_demo boolean not null default false;

create function public.shares_fridgy_household(other_user uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.household_memberships mine
    join public.household_memberships theirs using (household_id)
    where mine.user_id = (select auth.uid()) and theirs.user_id = other_user
  );
$$;
revoke all on function public.shares_fridgy_household(uuid) from public, anon;
grant execute on function public.shares_fridgy_household(uuid) to authenticated;

drop policy "Users read own recipes" on public.recipes;
create policy "Household members read shared recipes" on public.recipes for select to authenticated
  using (user_id = (select auth.uid()) or public.shares_fridgy_household(user_id));

create policy "Members read household recipe images" on storage.objects for select to authenticated
  using (
    bucket_id = 'recipe-images' and exists (
      select 1 from public.recipes r
      where r.user_id::text = (storage.foldername(name))[1]
        and r.recipe->>'imagePath' = split_part(name, '/', 2)
        and (r.user_id = (select auth.uid()) or public.shares_fridgy_household(r.user_id))
    )
  );

create function public.keep_household_assignment()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.household_id <> old.household_id then
    raise exception 'Household assignment cannot change';
  end if;
  return new;
end;
$$;
create trigger keep_product_household before update on public.products
  for each row execute function public.keep_household_assignment();
create trigger keep_shopping_household before update on public.shopping_items
  for each row execute function public.keep_household_assignment();
revoke all on function public.keep_household_assignment() from public, anon, authenticated;

create function public.seed_fridgy_household(target_household uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.products(household_id, name, quantity, unit, category, storage_location, estimated_use_by, is_demo, seed_key) values
    (target_household, 'Mleko 2%', 1, 'l', 'Nabiał', 'Lodówka', current_date + 3, true, 'milk'),
    (target_household, 'Jajka', 6, 'szt.', 'Nabiał', 'Lodówka', current_date + 10, true, 'eggs'),
    (target_household, 'Pomidory', 4, 'szt.', 'Warzywa', 'Lodówka', current_date + 5, true, 'tomatoes'),
    (target_household, 'Makaron', 500, 'g', 'Sypkie', 'Spiżarnia', current_date + 180, true, 'pasta'),
    (target_household, 'Ziemniaki', 1, 'kg', 'Warzywa', 'Spiżarnia', current_date + 14, true, 'potatoes');
  insert into public.shopping_items(household_id, name, is_demo, seed_key) values
    (target_household, 'Banany', true, 'bananas'),
    (target_household, 'Kawa ziarnista', true, 'coffee'),
    (target_household, 'Woda gazowana', true, 'water');
end;
$$;
revoke all on function public.seed_fridgy_household(uuid) from public, anon, authenticated;

create function public.seed_fridgy_user_recipes(target_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare seeded_at timestamptz := now();
begin
  with seeded as materialized (
    select dish.*, 'demo-' || gen_random_uuid() as slug from (values
      ('Jajecznica z pomidorami', 'Proste śniadanie z jajek i pomidorów.', 15,
        '[{"name":"Jajka","amount":"4 szt.","quantity":4,"unit":"szt.","available":true},{"name":"Pomidory","amount":"2 szt.","quantity":2,"unit":"szt.","available":true}]'::jsonb,
        '["Pokrój pomidory.","Roztrzep jajka i usmaż je na patelni.","Dodaj pomidory i dopraw do smaku."]'::jsonb, '["eggs"]'::jsonb),
      ('Makaron z pomidorami', 'Szybki makaron z prostym sosem pomidorowym.', 25,
        '[{"name":"Makaron","amount":"200 g","quantity":200,"unit":"g","available":true},{"name":"Pomidory","amount":"4 szt.","quantity":4,"unit":"szt.","available":true}]'::jsonb,
        '["Ugotuj makaron al dente.","Pokrój pomidory i duś je na patelni, aż powstanie sos.","Połącz makaron z sosem i dopraw do smaku."]'::jsonb, '["gluten"]'::jsonb),
      ('Placki ziemniaczane', 'Klasyczne chrupiące placki ziemniaczane.', 35,
        '[{"name":"Ziemniaki","amount":"600 g","quantity":600,"unit":"g","available":true},{"name":"Jajka","amount":"1 szt.","quantity":1,"unit":"szt.","available":true},{"name":"Olej","amount":"30 ml","quantity":30,"unit":"ml","available":false}]'::jsonb,
        '["Zetrzyj ziemniaki i odciśnij nadmiar wody.","Wymieszaj z jajkiem i dopraw.","Smaż małe placki na rozgrzanym oleju z obu stron."]'::jsonb, '["eggs"]'::jsonb)
    ) as dish(title, description, minutes, ingredients, steps, allergens)
  )
  insert into public.recipes(user_id, slug, source, recipe, created_at, is_demo)
  select target_user, dish.slug, 'custom',
    jsonb_build_object(
      'slug', dish.slug, 'source', 'custom', 'createdAt', seeded_at,
      'title', dish.title, 'description', dish.description, 'time', dish.minutes,
      'difficulty', 'Łatwy', 'cuisine', 'Polska', 'servings', 2,
      'ingredients', dish.ingredients, 'steps', dish.steps, 'allergens', dish.allergens
    ), seeded_at, true
  from seeded dish;
end;
$$;
revoke all on function public.seed_fridgy_user_recipes(uuid) from public, anon, authenticated;

do $$
declare existing_user record;
begin
  for existing_user in select user_id from public.profiles loop
    perform public.seed_fridgy_user_recipes(existing_user.user_id);
  end loop;
end;
$$;

-- The auth trigger also calls this function for every newly registered user.
create or replace function public.bootstrap_fridgy_user(new_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare new_household uuid;
begin
  if exists (select 1 from public.profiles where user_id = new_user) then return; end if;
  insert into public.households(owner_id, name) values (new_user, 'Mój dom') returning id into new_household;
  insert into public.profiles(user_id, household_id) values (new_user, new_household);
  insert into public.household_memberships(household_id, user_id) values (new_household, new_user);
  insert into public.recipe_libraries(user_id) values (new_user);
  perform public.seed_fridgy_household(new_household);
  perform public.seed_fridgy_user_recipes(new_user);
end;
$$;

create function public.create_fridgy_household(household_name text, include_demo_data boolean)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_household uuid; current_user_id uuid := auth.uid();
begin
  if current_user_id is null or household_name is null
     or length(trim(household_name)) not between 1 and 100 or include_demo_data is null then
    raise exception 'Invalid household input';
  end if;
  insert into public.households(owner_id, name) values (current_user_id, trim(household_name)) returning id into new_household;
  insert into public.household_memberships(household_id, user_id) values (new_household, current_user_id);
  if include_demo_data then
    perform public.seed_fridgy_household(new_household);
  end if;
  update public.profiles set household_id = new_household where user_id = current_user_id;
  if not found then raise exception 'Profile missing'; end if;
  return new_household;
end;
$$;
revoke all on function public.create_fridgy_household(text,boolean) from public, anon;
grant execute on function public.create_fridgy_household(text,boolean) to authenticated;

create function public.switch_fridgy_household(target_household uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.is_household_member(target_household) then
    raise exception 'Household unavailable';
  end if;
  update public.profiles set household_id = target_household where user_id = auth.uid();
  if not found then raise exception 'Profile missing'; end if;
end;
$$;
revoke all on function public.switch_fridgy_household(uuid) from public, anon;
grant execute on function public.switch_fridgy_household(uuid) to authenticated;

create or replace function public.accept_household_invitation(invite_token uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare invitation public.household_invitations%rowtype; signed_in_email text;
begin
  if auth.uid() is null then raise exception 'Unauthenticated'; end if;
  select email into signed_in_email from auth.users where id = auth.uid();
  select * into invitation from public.household_invitations where token = invite_token for update;
  if invitation.token is null or invitation.accepted_at is not null or invitation.expires_at < now()
     or lower(invitation.email) <> lower(signed_in_email) then
    raise exception 'Invitation unavailable';
  end if;
  insert into public.household_memberships(household_id, user_id)
    values (invitation.household_id, auth.uid()) on conflict do nothing;
  update public.profiles set household_id = invitation.household_id where user_id = auth.uid();
  update public.household_invitations set accepted_at = now() where token = invite_token;
end;
$$;

create or replace function public.delete_fridgy_custom_recipe(target_slug text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from public.recipes where user_id = auth.uid() and slug = target_slug and source = 'custom';
  if not found then raise exception 'Recipe not found'; end if;
  update public.recipe_libraries set library = jsonb_set(
    library, '{favoriteSlugs}',
    coalesce((select jsonb_agg(value) from jsonb_array_elements_text(library->'favoriteSlugs') as favorites(value) where value <> target_slug), '[]'::jsonb)
  ) where coalesce(library->'favoriteSlugs', '[]'::jsonb) ? target_slug;
end;
$$;

create or replace function public.prune_fridgy_recipe_history()
returns void language plpgsql security definer set search_path = '' as $$
declare current_user_id uuid := auth.uid();
begin
  if current_user_id is null then raise exception 'Unauthorized'; end if;
  perform 1 from public.recipe_libraries where user_id = current_user_id for update;
  if not found then raise exception 'Recipe library not found'; end if;
  delete from public.recipes r
  where r.user_id = current_user_id and r.source = 'ai'
    and r.created_at <= now() - interval '7 days'
    and not exists (
      select 1 from public.recipe_libraries l
      where coalesce(l.library->'favoriteSlugs', '[]'::jsonb) ? r.slug
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
    where user_id = auth.uid() and is_demo;
  delete from public.recipes where user_id = auth.uid() and is_demo;
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
    ) where coalesce(l.library->'favoriteSlugs', '[]'::jsonb) ?| demo_slugs
         or exists (
           select 1 from jsonb_array_elements(coalesce(l.library->'history', '[]'::jsonb)) as records(value)
           where records.value->>'recipeSlug' = any(demo_slugs)
         );
  end if;
end;
$$;

create function public.assert_fridgy_active_household(expected_household uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare active_household uuid;
begin
  select household_id into active_household from public.profiles
    where user_id = auth.uid() for share;
  if active_household is distinct from expected_household then
    raise exception 'Active household changed. Refresh and try again';
  end if;
end;
$$;
revoke all on function public.assert_fridgy_active_household(uuid) from public, anon, authenticated;

create function public.save_manual_receipt_for_household(receipt_items jsonb, expected_household uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
begin
  perform public.assert_fridgy_active_household(expected_household);
  return public.save_manual_receipt(receipt_items);
end;
$$;
revoke all on function public.save_manual_receipt_for_household(jsonb,uuid) from public, anon;
grant execute on function public.save_manual_receipt_for_household(jsonb,uuid) to authenticated;

create function public.finish_fridgy_cooking_for_household(
  recipe_slug text, recipe_title text, recipe_cuisine text, deductions jsonb, expected_household uuid
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.assert_fridgy_active_household(expected_household);
  perform public.finish_fridgy_cooking(recipe_slug, recipe_title, recipe_cuisine, deductions);
end;
$$;
revoke all on function public.finish_fridgy_cooking_for_household(text,text,text,jsonb,uuid) from public, anon;
grant execute on function public.finish_fridgy_cooking_for_household(text,text,text,jsonb,uuid) to authenticated;

create function public.remove_fridgy_demo_for_household(expected_household uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.assert_fridgy_active_household(expected_household);
  perform public.reset_fridgy_demo();
end;
$$;
revoke all on function public.remove_fridgy_demo_for_household(uuid) from public, anon;
grant execute on function public.remove_fridgy_demo_for_household(uuid) to authenticated;

notify pgrst, 'reload schema';
commit;
