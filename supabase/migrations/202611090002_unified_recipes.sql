begin;

create table public.recipes (
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null check (length(slug) between 1 and 150),
  source text not null check (source in ('custom', 'ai')),
  recipe jsonb not null check (jsonb_typeof(recipe) = 'object'),
  created_at timestamptz not null default now(),
  primary key (user_id, slug)
);
create index recipes_user_created_idx on public.recipes(user_id, created_at desc);

insert into public.recipes (user_id, slug, source, recipe, created_at)
select libraries.user_id, item->>'slug', 'custom', item,
  coalesce((item->>'createdAt')::timestamptz, now())
from public.recipe_libraries libraries,
  jsonb_array_elements(coalesce(libraries.library->'customRecipes', '[]'::jsonb)) item;

insert into public.recipes (user_id, slug, source, recipe, created_at)
select user_id, slug, 'ai', recipe, created_at from public.generated_recipes;

update public.recipe_libraries set library = library - 'customRecipes';
alter table public.recipe_libraries alter column library set default '{"version":1,"favoriteSlugs":[],"history":[]}'::jsonb;
drop table public.generated_recipes;

revoke all on public.recipes from public, anon, authenticated;
grant select, insert, update, delete on public.recipes to authenticated;
alter table public.recipes enable row level security;
create policy "Users read own recipes" on public.recipes for select to authenticated using (user_id = (select auth.uid()));
create policy "Users add own recipes" on public.recipes for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Users update own recipes" on public.recipes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Users delete own recipes" on public.recipes for delete to authenticated using (user_id = (select auth.uid()));

create table public.recipe_generation_requests (
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index recipe_generation_requests_user_created_idx on public.recipe_generation_requests(user_id, created_at desc);
revoke all on public.recipe_generation_requests from public, anon, authenticated;
alter table public.recipe_generation_requests enable row level security;

create function public.reserve_fridgy_recipe_generation()
returns boolean language plpgsql security definer set search_path = '' as $$
declare current_user_id uuid;
begin
  current_user_id := auth.uid();
  if current_user_id is null then raise exception 'Unauthorized'; end if;
  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text, 0));
  delete from public.recipe_generation_requests
    where user_id = current_user_id and created_at <= now() - interval '1 hour';
  if (select count(*) from public.recipe_generation_requests
      where user_id = current_user_id and created_at > now() - interval '1 hour') >= 4 then
    return false;
  end if;
  insert into public.recipe_generation_requests(user_id) values (current_user_id);
  return true;
end;
$$;
revoke all on function public.reserve_fridgy_recipe_generation() from public;
grant execute on function public.reserve_fridgy_recipe_generation() to authenticated;

create function public.delete_fridgy_custom_recipe(target_slug text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from public.recipes where user_id = auth.uid() and slug = target_slug and source = 'custom';
  if not found then raise exception 'Recipe not found'; end if;
  update public.recipe_libraries set library = jsonb_set(
    library, '{favoriteSlugs}',
    coalesce((select jsonb_agg(value) from jsonb_array_elements_text(library->'favoriteSlugs') as favorites(value) where value <> target_slug), '[]'::jsonb)
  ) where user_id = auth.uid();
end;
$$;
revoke all on function public.delete_fridgy_custom_recipe(text) from public;
grant execute on function public.delete_fridgy_custom_recipe(text) to authenticated;

commit;
