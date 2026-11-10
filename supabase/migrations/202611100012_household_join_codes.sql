begin;

create function public.new_fridgy_join_code()
returns text language sql volatile set search_path = '' as $$
  select string_agg(substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    get_byte(extensions.gen_random_bytes(1), 0) % 36 + 1, 1), '' order by n)
  from generate_series(1, 6) as positions(n);
$$;

create table public.household_join_codes (
  household_id uuid primary key references public.households(id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z0-9]{6}$')
);
revoke all on public.household_join_codes from public, anon, authenticated;
alter table public.household_join_codes enable row level security;

create function public.assign_fridgy_join_code(target_household uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  loop
    insert into public.household_join_codes(household_id, code)
      values (target_household, public.new_fridgy_join_code())
      on conflict (code) do nothing;
    exit when found;
  end loop;
end;
$$;

create function public.attach_fridgy_join_code()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.assign_fridgy_join_code(new.id);
  return new;
end;
$$;
create trigger attach_fridgy_join_code after insert on public.households
  for each row execute function public.attach_fridgy_join_code();

do $$
declare household record;
begin
  for household in select h.id from public.households h
    where not exists (select 1 from public.household_join_codes c where c.household_id = h.id)
  loop
    perform public.assign_fridgy_join_code(household.id);
  end loop;
end;
$$;

create table public.household_join_requests (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create unique index household_join_requests_one_pending
  on public.household_join_requests(household_id, user_id) where status = 'pending';
create index household_join_requests_owner_queue
  on public.household_join_requests(household_id, created_at) where status = 'pending';
revoke all on public.household_join_requests from public, anon, authenticated;
alter table public.household_join_requests enable row level security;

create function public.get_fridgy_join_code(target_household uuid)
returns text language plpgsql stable security definer set search_path = '' as $$
declare result text;
begin
  if auth.uid() is null or not exists (
    select 1 from public.households where id = target_household and owner_id = auth.uid()
  ) then raise exception 'Only the household owner can view the join code'; end if;
  select code into result from public.household_join_codes where household_id = target_household;
  return result;
end;
$$;

create function public.rotate_fridgy_join_code(target_household uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare current_code text; replacement text;
begin
  perform 1 from public.households where id = target_household and owner_id = auth.uid() for update;
  if auth.uid() is null or not found then
    raise exception 'Only the household owner can change the join code';
  end if;
  select code into current_code from public.household_join_codes where household_id = target_household;
  loop
    replacement := public.new_fridgy_join_code();
    if replacement = current_code then continue; end if;
    begin
      update public.household_join_codes set code = replacement where household_id = target_household;
      exit;
    exception when unique_violation then null;
    end;
  end loop;
  update public.household_join_requests set status = 'denied', decided_at = now()
    where household_id = target_household and status = 'pending';
  return replacement;
end;
$$;

create function public.request_fridgy_household_join(join_code text)
returns text language plpgsql security definer set search_path = '' as $$
declare target_household uuid;
begin
  if auth.uid() is null then raise exception 'Unauthenticated'; end if;
  if join_code is null or upper(trim(join_code)) !~ '^[A-Z0-9]{6}$' then return 'invalid'; end if;
  select h.id into target_household from public.household_join_codes c
    join public.households h on h.id = c.household_id
    where c.code = upper(trim(join_code)) for share of h;
  if target_household is null then return 'invalid'; end if;
  if exists (select 1 from public.household_memberships
    where household_id = target_household and user_id = auth.uid()) then
    update public.profiles set household_id = target_household
      where user_id = auth.uid() and household_id is null;
    return 'member';
  end if;
  if exists (select 1 from public.household_join_requests
    where household_id = target_household and user_id = auth.uid() and status = 'pending') then return 'pending'; end if;
  insert into public.household_join_requests(household_id, user_id)
    values (target_household, auth.uid()) on conflict do nothing;
  if not found then return 'pending'; end if;
  return 'requested';
end;
$$;

create function public.list_fridgy_join_requests(target_household uuid)
returns table(id uuid, username text, email text, requested_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.households where id = target_household and owner_id = auth.uid()
  ) then raise exception 'Only the household owner can view join requests'; end if;
  return query
    select r.id, p.username, u.email::text, r.created_at
    from public.household_join_requests r
    join public.profiles p on p.user_id = r.user_id
    join auth.users u on u.id = r.user_id
    where r.household_id = target_household and r.status = 'pending'
    order by r.created_at;
end;
$$;

create function public.get_my_fridgy_join_status(join_code text)
returns text language sql stable security definer set search_path = '' as $$
  select coalesce((
    select r.status from public.household_join_requests r
    join public.household_join_codes c on c.household_id = r.household_id
    where r.user_id = (select auth.uid()) and c.code = upper(trim(join_code))
    order by r.created_at desc limit 1
  ), 'denied');
$$;

create function public.decide_fridgy_household_join(join_request uuid, approve boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare target_household uuid; requester uuid; current_status text;
begin
  if auth.uid() is null or approve is null then raise exception 'Invalid decision'; end if;
  select household_id into target_household from public.household_join_requests where id = join_request;
  if target_household is null then raise exception 'Request unavailable'; end if;
  perform 1 from public.households where id = target_household and owner_id = auth.uid() for update;
  if not found then raise exception 'Only the household owner can decide join requests'; end if;
  select user_id, status into requester, current_status from public.household_join_requests
    where id = join_request for update;
  if current_status is distinct from 'pending' then raise exception 'Request unavailable'; end if;
  if approve then
    insert into public.household_memberships(household_id, user_id)
      values (target_household, requester) on conflict do nothing;
    update public.profiles set household_id = target_household
      where user_id = requester and household_id is null;
  end if;
  update public.household_join_requests set status = case when approve then 'approved' else 'denied' end,
    decided_at = now() where id = join_request;
end;
$$;

-- Old email links can still submit a request, but cannot grant membership directly.
create or replace function public.accept_household_invitation(invite_token uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare invitation public.household_invitations%rowtype; signed_in_email text;
begin
  if auth.uid() is null then raise exception 'Unauthenticated'; end if;
  select email into signed_in_email from auth.users where id = auth.uid();
  select * into invitation from public.household_invitations where token = invite_token for update;
  if invitation.token is null or invitation.accepted_at is not null or invitation.expires_at < now()
     or lower(invitation.email) <> lower(signed_in_email) then raise exception 'Invitation unavailable'; end if;
  insert into public.household_join_requests(household_id, user_id)
    values (invitation.household_id, auth.uid()) on conflict do nothing;
  update public.household_invitations set accepted_at = now() where token = invite_token;
end;
$$;
revoke insert on public.household_invitations from authenticated;

create function public.is_fridgy_household_owner(target_household uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.households
    where id = target_household and owner_id = (select auth.uid()));
$$;

drop policy "Members add household recipes" on public.recipes;
create policy "Members add household recipes" on public.recipes for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_household_member(household_id)
    and (source = 'ai' or public.is_fridgy_household_owner(household_id)));
drop policy "Members edit household recipes" on public.recipes;
create policy "Owners edit household recipes" on public.recipes for update to authenticated
  using (public.is_fridgy_household_owner(household_id))
  with check (public.is_fridgy_household_owner(household_id));
drop policy "Members delete household recipes" on public.recipes;
create policy "Owners delete household recipes" on public.recipes for delete to authenticated
  using (public.is_fridgy_household_owner(household_id));

create or replace function public.delete_fridgy_custom_recipe(target_slug text, expected_household uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if target_slug is null or length(trim(target_slug)) not between 1 and 150 then
    raise exception 'Invalid recipe';
  end if;
  perform public.assert_fridgy_active_household(expected_household);
  if not public.is_fridgy_household_owner(expected_household) then
    raise exception 'Only the household owner can delete recipes';
  end if;
  delete from public.recipes where household_id = expected_household and slug = target_slug and source = 'custom';
  if not found then raise exception 'Recipe not found'; end if;
  delete from public.cooking_history where household_id = expected_household and recipe_slug = target_slug;
end;
$$;

revoke all on function public.new_fridgy_join_code(), public.assign_fridgy_join_code(uuid),
  public.attach_fridgy_join_code(), public.get_fridgy_join_code(uuid),
  public.rotate_fridgy_join_code(uuid), public.request_fridgy_household_join(text),
  public.list_fridgy_join_requests(uuid), public.get_my_fridgy_join_status(text),
  public.decide_fridgy_household_join(uuid, boolean),
  public.is_fridgy_household_owner(uuid) from public, anon, authenticated;
grant execute on function public.get_fridgy_join_code(uuid), public.rotate_fridgy_join_code(uuid),
  public.request_fridgy_household_join(text), public.list_fridgy_join_requests(uuid),
  public.get_my_fridgy_join_status(text), public.decide_fridgy_household_join(uuid, boolean),
  public.is_fridgy_household_owner(uuid)
  to authenticated;

do $$
begin
  if public.new_fridgy_join_code() !~ '^[A-Z0-9]{6}$'
     or exists (select 1 from public.households h left join public.household_join_codes c on c.household_id = h.id where c.household_id is null) then
    raise exception 'Household join codes were not initialized correctly';
  end if;
end;
$$;

notify pgrst, 'reload schema';
commit;
