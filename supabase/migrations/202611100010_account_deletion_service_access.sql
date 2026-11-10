begin;

-- BYPASSRLS does not grant table privileges. Account deletion reads these tables
-- through a server-only service role client before deleting the auth user.
grant usage on schema public to service_role;
grant select on public.households, public.household_memberships, public.recipes to service_role;

commit;
