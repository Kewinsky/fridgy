begin;

create or replace function public.list_fridgy_join_requests(target_household uuid)
returns table(id uuid, username text, email text, requested_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.households h
    where h.id = target_household and h.owner_id = auth.uid()
  ) then
    raise exception 'Only the household owner can view join requests';
  end if;

  return query
    select r.id, p.username, u.email::text, r.created_at
    from public.household_join_requests r
    join public.profiles p on p.user_id = r.user_id
    join auth.users u on u.id = r.user_id
    where r.household_id = target_household and r.status = 'pending'
    order by r.created_at;
end;
$$;

notify pgrst, 'reload schema';
commit;
