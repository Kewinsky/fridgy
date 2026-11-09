begin;

create table public.generated_recipes (
  slug text primary key check (slug ~ '^ai-[0-9a-f-]{36}$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe jsonb not null check (jsonb_typeof(recipe) = 'object'),
  created_at timestamptz not null default now()
);
create index generated_recipes_user_created_idx on public.generated_recipes(user_id, created_at desc);

revoke all on public.generated_recipes from public, anon, authenticated;
grant select, insert on public.generated_recipes to authenticated;
alter table public.generated_recipes enable row level security;
create policy "Users read own generated recipes" on public.generated_recipes for select to authenticated using (user_id = (select auth.uid()));
create policy "Users add own generated recipes" on public.generated_recipes for insert to authenticated with check (user_id = (select auth.uid()));

commit;
