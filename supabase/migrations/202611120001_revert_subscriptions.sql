begin;

-- Restore recipe writes before removing the subscription completion function.
drop policy "Owners add custom recipes" on public.recipes;
create policy "Members add household recipes" on public.recipes for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_household_member(household_id)
    and (source = 'ai' or public.is_fridgy_household_owner(household_id)));

drop trigger check_fridgy_daily_idea_limit on public.daily_recipe_ideas;
drop trigger check_fridgy_member_limit on public.household_memberships;
drop trigger check_fridgy_custom_recipe_limit on public.recipes;
drop trigger count_fridgy_free_ai_use on public.subscription_usage;
drop trigger create_fridgy_subscription on public.households;

drop function public.check_fridgy_daily_idea_limit();
drop function public.check_fridgy_member_limit();
drop function public.check_fridgy_custom_recipe_limit();
drop function public.complete_fridgy_generation(uuid, uuid, jsonb);
drop function public.finish_fridgy_usage(uuid, boolean);
drop function public.reserve_fridgy_usage(uuid, text);
drop function public.start_fridgy_trial(uuid);
drop function public.get_fridgy_subscription(uuid);
drop function public.fridgy_household_plan(uuid);
drop function public.count_fridgy_free_ai_use();
drop function public.create_fridgy_subscription();

drop table public.subscription_usage;
drop table public.household_subscriptions;
drop table public.subscription_plans;
alter table public.profiles
  drop column premium_trial_started_at,
  drop column free_ai_uses_lifetime;

notify pgrst, 'reload schema';
commit;
