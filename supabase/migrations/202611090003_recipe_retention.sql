begin;

create function public.prune_fridgy_recipe_history()
returns void language plpgsql security definer set search_path = '' as $$
declare current_user_id uuid;
begin
  current_user_id := auth.uid();
  if current_user_id is null then raise exception 'Unauthorized'; end if;

  perform 1 from public.recipe_libraries where user_id = current_user_id for update;
  if not found then raise exception 'Recipe library not found'; end if;

  delete from public.recipes r
  where r.user_id = current_user_id
    and r.source = 'ai'
    and r.created_at <= now() - interval '7 days'
    and not exists (
      select 1 from public.recipe_libraries l
      where l.user_id = current_user_id
        and coalesce(l.library->'favoriteSlugs', '[]'::jsonb) ? r.slug
    );
end;
$$;

revoke all on function public.prune_fridgy_recipe_history() from public;
grant execute on function public.prune_fridgy_recipe_history() to authenticated;
notify pgrst, 'reload schema';

commit;
