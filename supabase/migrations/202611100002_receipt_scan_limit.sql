create table public.receipt_scan_requests (
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index receipt_scan_requests_user_created_idx on public.receipt_scan_requests(user_id, created_at desc);
revoke all on public.receipt_scan_requests from public, anon, authenticated;
alter table public.receipt_scan_requests enable row level security;

create function public.reserve_fridgy_receipt_scan()
returns boolean language plpgsql security definer set search_path = '' as $$
declare current_user_id uuid;
begin
  current_user_id := auth.uid();
  if current_user_id is null then raise exception 'Unauthorized'; end if;
  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text, 1));
  delete from public.receipt_scan_requests
    where user_id = current_user_id and created_at <= now() - interval '1 hour';
  if (select count(*) from public.receipt_scan_requests
      where user_id = current_user_id and created_at > now() - interval '1 hour') >= 10 then
    return false;
  end if;
  insert into public.receipt_scan_requests(user_id) values (current_user_id);
  return true;
end;
$$;
revoke all on function public.reserve_fridgy_receipt_scan() from public;
grant execute on function public.reserve_fridgy_receipt_scan() to authenticated;
