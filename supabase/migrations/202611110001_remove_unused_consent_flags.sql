begin;

alter table public.profiles
  drop column personalization_consent,
  drop column analytics_consent;

notify pgrst, 'reload schema';
commit;
