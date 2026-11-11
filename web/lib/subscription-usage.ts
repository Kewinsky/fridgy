import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { SubscriptionPlan, SubscriptionState } from "@/lib/subscription-plans";

export async function getSubscriptionState(supabase: SupabaseClient, householdId: string) {
  const { data, error } = await supabase.rpc("get_fridgy_subscription", { target_household: householdId });
  if (error || !data) throw new Error(error?.message ?? "Subscription unavailable");
  return data as SubscriptionState;
}

export async function getSubscriptionPlans(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("subscription_plans").select("*");
  if (error || !data) throw new Error(error?.message ?? "Plans unavailable");
  return data as SubscriptionPlan[];
}

export async function reserveUsage(supabase: SupabaseClient, householdId: string, kind: "ai" | "receipt") {
  const { data, error } = await supabase.rpc("reserve_fridgy_usage", {
    target_household: householdId, target_kind: kind,
  });
  if (error) throw new Error(error.message);
  return data as string | null;
}

export async function finishUsage(supabase: SupabaseClient, reservationId: string, succeeded: boolean) {
  const { error } = await supabase.rpc("finish_fridgy_usage", { reservation_id: reservationId, succeeded });
  if (error) throw new Error(error.message);
}
