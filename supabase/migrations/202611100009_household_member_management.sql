begin;

create function public.list_fridgy_household_members(target_household uuid)
returns table(user_id uuid, username text, email text, is_owner boolean)
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.households h
    where h.id = target_household and h.owner_id = auth.uid()
  ) then
    raise exception 'Only the household owner can view members';
  end if;

  return query
    select m.user_id, p.username, u.email::text, m.user_id = h.owner_id
    from public.household_memberships m
    join public.households h on h.id = m.household_id
    join public.profiles p on p.user_id = m.user_id
    join auth.users u on u.id = m.user_id
    where m.household_id = target_household
    order by (m.user_id = h.owner_id) desc, lower(p.username), m.user_id;
end;
$$;

create function public.transfer_fridgy_household_owner(target_household uuid, next_owner uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare current_owner uuid;
begin
  select owner_id into current_owner from public.households
    where id = target_household for update;
  if auth.uid() is null or current_owner is distinct from auth.uid()
     or next_owner is null or next_owner = current_owner
     or not exists (
       select 1 from public.household_memberships
       where household_id = target_household and user_id = next_owner
     ) then
    raise exception 'Only the owner can transfer ownership to another member';
  end if;
  update public.households set owner_id = next_owner where id = target_household;
end;
$$;

create function public.remove_fridgy_household_member(target_household uuid, target_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare current_owner uuid;
begin
  select owner_id into current_owner from public.households
    where id = target_household for update;
  if auth.uid() is null or current_owner is distinct from auth.uid()
     or target_user is null or target_user = current_owner
     or not exists (
       select 1 from public.household_memberships
       where household_id = target_household and user_id = target_user
     ) then
    raise exception 'Only the owner can remove another member';
  end if;
  update public.profiles set household_id = (
    select household_id from public.household_memberships
    where user_id = target_user and household_id <> target_household
    order by household_id limit 1
  ) where user_id = target_user and household_id = target_household;
  delete from public.household_invitations i
    using auth.users u
    where i.household_id = target_household and i.accepted_at is null
      and u.id = target_user and lower(i.email) = lower(u.email);
  delete from public.household_memberships
    where household_id = target_household and user_id = target_user;
end;
$$;

-- Protect shared households even if account deletion races with an invitation acceptance.
create function public.guard_fridgy_owner_deletion()
returns trigger language plpgsql security definer set search_path = '' as $$
declare owned_household uuid;
begin
  for owned_household in
    select id from public.households where owner_id = old.id for update
  loop
    if exists (
      select 1 from public.household_memberships
      where household_id = owned_household and user_id <> old.id
    ) then
      raise exception 'Transfer ownership before deleting this account';
    end if;
  end loop;
  return old;
end;
$$;
create trigger guard_fridgy_owner_deletion before delete on auth.users
  for each row execute function public.guard_fridgy_owner_deletion();

-- Shared recipes survive account deletion without retaining the former author's ID.
alter table public.recipes alter column user_id drop not null;
alter table public.daily_recipe_ideas alter column user_id drop not null;
create or replace function public.keep_fridgy_recipe_assignment()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' and new.household_id is null then
    select household_id into new.household_id from public.profiles where user_id = new.user_id;
  end if;
  if tg_op = 'UPDATE' and (
    new.household_id is distinct from old.household_id
    or (new.user_id is distinct from old.user_id and not (
      new.user_id is null and pg_trigger_depth() > 1
    ))
  ) then
    raise exception 'Recipe household and author cannot change';
  end if;
  return new;
end;
$$;

create function public.anonymize_fridgy_deleted_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.recipes set user_id = null where user_id = old.id;
  update public.daily_recipe_ideas set user_id = null where user_id = old.id;
  return old;
end;
$$;
create trigger anonymize_fridgy_deleted_user after delete on auth.users
  for each row execute function public.anonymize_fridgy_deleted_user();

-- Change only the image owner field so concurrent recipe edits are preserved.
create function public.relocate_fridgy_recipe_image(
  target_household uuid, target_slug text, filename text, previous_owner uuid
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'Service role required';
  end if;
  update public.recipes
  set recipe = jsonb_set(recipe, '{imageOwnerId}', to_jsonb(target_household::text))
  where household_id = target_household and slug = target_slug
    and recipe->>'imagePath' = filename
    and coalesce(recipe->>'imageOwnerId', user_id::text) = previous_owner::text;
end;
$$;

revoke all on function public.list_fridgy_household_members(uuid),
  public.transfer_fridgy_household_owner(uuid, uuid),
  public.remove_fridgy_household_member(uuid, uuid),
  public.guard_fridgy_owner_deletion(),
  public.anonymize_fridgy_deleted_user(),
  public.relocate_fridgy_recipe_image(uuid, text, text, uuid) from public, anon, authenticated;
grant execute on function public.list_fridgy_household_members(uuid),
  public.transfer_fridgy_household_owner(uuid, uuid),
  public.remove_fridgy_household_member(uuid, uuid) to authenticated;
grant execute on function public.relocate_fridgy_recipe_image(uuid, text, text, uuid) to service_role;

-- An ex-member must not be able to delete a photo still used by a shared recipe.
create function public.fridgy_recipe_image_in_use(image_path text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.recipes r
    where coalesce(r.recipe->>'imageOwnerId', r.user_id::text) = split_part(image_path, '/', 1)
      and r.recipe->>'imagePath' = split_part(image_path, '/', 2)
  );
$$;
revoke all on function public.fridgy_recipe_image_in_use(text) from public, anon, authenticated;
grant execute on function public.fridgy_recipe_image_in_use(text) to authenticated;
drop policy "Users delete own recipe images" on storage.objects;
create policy "Users delete unreferenced own recipe images" on storage.objects
  for delete to authenticated using (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and not public.fridgy_recipe_image_in_use(name)
  );

notify pgrst, 'reload schema';
commit;
