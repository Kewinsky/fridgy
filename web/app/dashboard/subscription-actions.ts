"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getSubscriptionState } from "@/lib/subscription-usage";

async function currentHousehold(expectedHouseholdId: string) {
  const householdId = z.uuid().parse(expectedHouseholdId);
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("household_id").eq("user_id", user.id).single();
  if (profileError || profile?.household_id !== householdId) throw new Error("Active household changed");
  return { supabase, householdId, userId: user.id };
}

export async function readSubscriptionState(expectedHouseholdId: string) {
  const { supabase, householdId } = await currentHousehold(expectedHouseholdId);
  return getSubscriptionState(supabase, householdId);
}

export async function startPremiumTrial(expectedHouseholdId: string) {
  const { supabase, householdId } = await currentHousehold(expectedHouseholdId);
  const { data, error } = await supabase.rpc("start_fridgy_trial", { target_household: householdId });
  if (error) throw new Error(error.message);
  return { started: data === true };
}

export async function setTestPremium(expectedHouseholdId: string, enabled: boolean) {
  if (process.env.NODE_ENV !== "development") throw new Error("Test Premium is available only in development");
  const { supabase, householdId, userId } = await currentHousehold(expectedHouseholdId);
  const { data: household, error: householdError } = await supabase.from("households")
    .select("owner_id").eq("id", householdId).single();
  if (householdError || household?.owner_id !== userId) throw new Error("Only the household owner can change Premium");
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
  const { url } = getSupabaseConfig();
  const admin = createAdminClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: current, error: readError } = await admin.from("household_subscriptions")
    .select("source,premium_until").eq("household_id", householdId).single();
  if (readError || !current) throw new Error(readError?.message ?? "Subscription unavailable");
  if (current.source !== "test" && current.premium_until && new Date(current.premium_until) > new Date())
    throw new Error("An active trial or paid plan cannot be changed in test mode");
  if (!enabled && current.source !== "test") throw new Error("Test Premium is not active");
  const { error } = await admin.from("household_subscriptions").update(enabled
    ? { source: "test", premium_until: new Date(Date.now() + 365 * 86400000).toISOString() }
    : { source: null, premium_until: null }).eq("household_id", householdId);
  if (error) throw new Error(error.message);
}
