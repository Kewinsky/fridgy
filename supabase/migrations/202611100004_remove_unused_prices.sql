begin;

alter table public.profiles drop column currency;

update public.receipts
set items = (
  select jsonb_agg(entry.item - 'price' order by entry.position)
  from jsonb_array_elements(items) with ordinality as entry(item, position)
)
where jsonb_path_exists(items, '$[*].price');

alter table public.receipts
  add constraint receipts_items_without_price check (not jsonb_path_exists(items, '$[*].price'));

notify pgrst, 'reload schema';

commit;
