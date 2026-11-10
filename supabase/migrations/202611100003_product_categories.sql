create or replace function public.save_manual_receipt(receipt_items jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare target_household uuid; receipt_id uuid;
begin
  if jsonb_typeof(receipt_items) <> 'array' or jsonb_array_length(receipt_items) not between 1 and 100 then
    raise exception 'Invalid receipt items';
  end if;
  if exists (
    select 1 from jsonb_array_elements(receipt_items) as e(item)
    where length(trim(item->>'name')) not between 1 and 150
       or coalesce((item->>'quantity')::numeric, 0) <= 0
       or length(trim(item->>'unit')) not between 1 and 30
       or item->>'storageLocation' not in ('Lodówka','Zamrażarka','Spiżarnia')
       or item->>'category' not in (
         'Owoce','Nabiał','Warzywa','Mięso','Mrożonki','Ryby','Pieczywo','Sypkie','Przetwory',
         'Napoje','Słodycze i przekąski','Przyprawy i dodatki','Inne'
       )
       or (item->>'estimatedUseBy')::date is null
  ) then raise exception 'Invalid receipt product'; end if;
  select household_id into target_household from public.profiles where user_id = auth.uid();
  if target_household is null then raise exception 'Unauthenticated'; end if;
  insert into public.receipts(household_id, created_by, items)
    values (target_household, auth.uid(), receipt_items) returning id into receipt_id;
  insert into public.products(household_id, name, quantity, unit, category, storage_location, estimated_use_by)
    select target_household, trim(item->>'name'), (item->>'quantity')::numeric,
      trim(item->>'unit'), item->>'category', item->>'storageLocation', (item->>'estimatedUseBy')::date
    from jsonb_array_elements(receipt_items) as e(item);
  return receipt_id;
end;
$$;
