begin;

alter table public.profiles
  add column inventory_view text not null default 'readable'
    check (inventory_view in ('readable', 'compact', 'detailed'));

grant update (inventory_view) on public.profiles to authenticated;

notify pgrst, 'reload schema';
commit;
