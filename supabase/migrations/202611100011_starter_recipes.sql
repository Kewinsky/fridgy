begin;

alter table public.profiles
  add column demo_recipes_seeded boolean not null default false;

-- Replace the unchanged third sample dish with a dessert for existing accounts.
update public.recipes r set recipe = r.recipe || jsonb_build_object(
  'title', 'Pieczone jabłka z cynamonem',
  'description', 'Ciepły deser z trzech prostych składników.',
  'time', 25,
  'ingredients', '[{"name":"Jabłka","amount":"2 szt.","quantity":2,"unit":"szt.","available":false},{"name":"Miód","amount":"20 g","quantity":20,"unit":"g","available":false},{"name":"Cynamon","amount":"2 g","quantity":2,"unit":"g","available":false}]'::jsonb,
  'steps', '["Rozgrzej piekarnik do 180°C i wydrąż gniazda nasienne jabłek.","Wymieszaj miód z cynamonem i napełnij jabłka.","Piecz około 20 minut, aż jabłka zmiękną."]'::jsonb,
  'allergens', '[]'::jsonb
)
where r.source = 'custom' and r.is_demo and r.slug like 'demo-%'
  and r.recipe->>'title' = 'Placki ziemniaczane'
  and r.recipe->>'description' = 'Klasyczne chrupiące placki ziemniaczane.'
  and r.recipe->'ingredients' = '[{"name":"Ziemniaki","amount":"600 g","quantity":600,"unit":"g","available":true},{"name":"Jajka","amount":"1 szt.","quantity":1,"unit":"szt.","available":true},{"name":"Olej","amount":"30 ml","quantity":30,"unit":"ml","available":false}]'::jsonb
  and r.recipe->'steps' = '["Zetrzyj ziemniaki i odciśnij nadmiar wody.","Wymieszaj z jajkiem i dopraw.","Smaż małe placki na rozgrzanym oleju z obu stron."]'::jsonb
  and not (r.recipe ?| array['imagePath', 'calories', 'macros'])
  and not exists (
    select 1 from public.recipes existing
    where existing.household_id = r.household_id
      and existing.recipe->>'title' = 'Pieczone jabłka z cynamonem'
  );

create or replace function public.seed_fridgy_user_recipes(target_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare target_household uuid; seeded_at timestamptz := now();
begin
  select household_id into target_household from public.profiles where user_id = target_user;
  if target_household is null then raise exception 'Household missing for starter recipes'; end if;

  insert into public.recipes(household_id, user_id, slug, source, recipe, created_at, is_demo)
  select target_household, target_user, 'starter-' || dish.kind || '-' || target_user::text,
    'custom', jsonb_build_object(
      'slug', 'starter-' || dish.kind || '-' || target_user::text,
      'source', 'custom', 'createdAt', seeded_at,
      'title', dish.title, 'description', dish.description, 'time', dish.minutes,
      'difficulty', 'Łatwy', 'cuisine', 'Polska', 'servings', 2,
      'ingredients', dish.ingredients, 'steps', dish.steps, 'allergens', dish.allergens
    ), seeded_at, true
  from (values
    ('breakfast', 'Jajecznica z pomidorami', 'Proste śniadanie z jajek i pomidorów.', 15,
      '[{"name":"Jajka","amount":"4 szt.","quantity":4,"unit":"szt.","available":false},{"name":"Pomidory","amount":"2 szt.","quantity":2,"unit":"szt.","available":false}]'::jsonb,
      '["Pokrój pomidory.","Roztrzep jajka i usmaż je na patelni.","Dodaj pomidory i dopraw do smaku."]'::jsonb, '["eggs"]'::jsonb),
    ('lunch', 'Makaron z pomidorami', 'Szybki makaron z prostym sosem pomidorowym.', 25,
      '[{"name":"Makaron","amount":"200 g","quantity":200,"unit":"g","available":false},{"name":"Pomidory","amount":"4 szt.","quantity":4,"unit":"szt.","available":false}]'::jsonb,
      '["Ugotuj makaron al dente.","Pokrój pomidory i duś je na patelni, aż powstanie sos.","Połącz makaron z sosem i dopraw do smaku."]'::jsonb, '["gluten"]'::jsonb),
    ('dessert', 'Pieczone jabłka z cynamonem', 'Ciepły deser z trzech prostych składników.', 25,
      '[{"name":"Jabłka","amount":"2 szt.","quantity":2,"unit":"szt.","available":false},{"name":"Miód","amount":"20 g","quantity":20,"unit":"g","available":false},{"name":"Cynamon","amount":"2 g","quantity":2,"unit":"g","available":false}]'::jsonb,
      '["Rozgrzej piekarnik do 180°C i wydrąż gniazda nasienne jabłek.","Wymieszaj miód z cynamonem i napełnij jabłka.","Piecz około 20 minut, aż jabłka zmiękną."]'::jsonb, '[]'::jsonb)
  ) as dish(kind, title, description, minutes, ingredients, steps, allergens)
  where not exists (
    select 1 from public.recipes existing
    where existing.household_id = target_household and existing.source = 'custom'
      and existing.recipe->>'title' = dish.title
  )
  on conflict (household_id, slug) do nothing;
end;
$$;

-- Existing sample recipes count as the account's one set of demo recipes.
update public.profiles p set demo_recipes_seeded = true
where exists (
  select 1 from public.recipes r
  where r.user_id = p.user_id and r.source = 'custom' and r.is_demo
);

create or replace function public.create_fridgy_household(household_name text, include_demo_data boolean)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_household uuid; current_user_id uuid := auth.uid(); already_seeded boolean;
begin
  if current_user_id is null or household_name is null
     or length(trim(household_name)) not between 1 and 100 or include_demo_data is null then
    raise exception 'Invalid household input';
  end if;
  select demo_recipes_seeded into already_seeded from public.profiles
    where user_id = current_user_id for update;
  if not found then raise exception 'Profile missing'; end if;
  insert into public.households(owner_id, name)
    values (current_user_id, trim(household_name)) returning id into new_household;
  insert into public.household_memberships(household_id, user_id)
    values (new_household, current_user_id);
  update public.profiles set household_id = new_household where user_id = current_user_id;
  if include_demo_data then
    perform public.seed_fridgy_household(new_household);
    if not already_seeded then
      perform public.seed_fridgy_user_recipes(current_user_id);
      update public.profiles set demo_recipes_seeded = true where user_id = current_user_id;
    end if;
  end if;
  return new_household;
end;
$$;

notify pgrst, 'reload schema';
commit;
