begin;

drop function if exists public.reserve_fridgy_receipt_scan();
drop table if exists public.receipt_scan_requests;
drop function if exists public.reserve_fridgy_recipe_generation();
drop table if exists public.recipe_generation_requests;

notify pgrst, 'reload schema';
commit;
