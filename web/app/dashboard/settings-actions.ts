"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

const profileSettings = z.object({
  notification_days: z.array(z.union([z.literal(0), z.literal(1), z.literal(3)])).max(3),
  diet: z.enum(["none", "vegetarian", "vegan", "pescatarian"]),
  allergies: z.string().max(500),
  excluded_ingredients: z.string().max(500),
  deduction_mode: z.enum(["always", "never", "ask"]),
  receipt_mode: z.enum(["automatic", "review"]),
  currency: z.enum(["PLN", "EUR", "GBP", "CHF"]),
  date_format: z.enum(["DD.MM.YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]),
  preferred_cuisines: z.array(z.string().max(50)).max(20),
  personalization_consent: z.boolean(),
  analytics_consent: z.boolean(),
});

export type ProfileSettings = z.infer<typeof profileSettings>;

async function currentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
  return { supabase, user: data.user };
}

export async function saveProfileSetting<K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) {
  if (!(key in profileSettings.shape)) throw new Error("Invalid setting");
  const valid = profileSettings.shape[key].parse(value);
  const { supabase, user } = await currentUser();
  const { error } = await supabase.from("profiles").update({ [key]: valid }).eq("user_id", user.id);
  if (error) throw new Error(error.message);
}

export async function saveHouseholdName(name: string) {
  const validName = z.string().trim().min(1).max(100).parse(name);
  const { supabase, user } = await currentUser();
  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("household_id").eq("user_id", user.id).single();
  if (profileError || !profile) throw new Error("Profile not found");
  const { data, error } = await supabase.from("households").update({ name: validName })
    .eq("id", profile.household_id).eq("owner_id", user.id).select("id").single();
  if (error || !data) throw new Error(error?.message ?? "Only the household owner can rename it");
}

export async function createHouseholdInvitation(email: string) {
  const validEmail = z.email().max(254).parse(email.trim().toLowerCase());
  const { supabase, user } = await currentUser();
  const { data: household, error: householdError } = await supabase.from("households")
    .select("id").eq("owner_id", user.id).single();
  if (householdError || !household) throw new Error("Only the household owner can invite members");
  const { data, error } = await supabase.from("household_invitations").insert({
    household_id: household.id, email: validEmail, created_by: user.id,
  }).select("token").single();
  if (error || !data) throw new Error(error?.message ?? "Invitation failed");
  return data.token as string;
}

export async function transferHouseholdOwnership(email: string) {
  const validEmail = z.email().max(254).parse(email.trim().toLowerCase());
  const { supabase } = await currentUser();
  const { error } = await supabase.rpc("transfer_fridgy_household_owner", { target_email: validEmail });
  if (error) throw new Error(error.message);
}

export async function exportAccountData() {
  const { supabase, user } = await currentUser();
  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("*").eq("user_id", user.id).single();
  if (profileError || !profile) throw new Error("Profile not found");
  const householdId = profile.household_id;
  const [household, products, shopping, recipes, receipts] = await Promise.all([
    supabase.from("households").select("id,name").eq("id", householdId).single(),
    supabase.from("products").select("*").eq("household_id", householdId),
    supabase.from("shopping_items").select("*").eq("household_id", householdId),
    supabase.from("recipe_libraries").select("library").eq("user_id", user.id).single(),
    supabase.from("receipts").select("*").eq("household_id", householdId),
  ]);
  if (household.error || products.error || shopping.error || recipes.error || receipts.error)
    throw new Error("Export failed");
  return {
    email: user.email, profile, household: household.data, products: products.data,
    shoppingItems: shopping.data, recipeLibrary: recipes.data?.library, receipts: receipts.data,
  };
}

export async function signOutEverywhere() {
  const { supabase } = await currentUser();
  const { error } = await supabase.auth.signOut({ scope: "global" });
  if (error) throw new Error(error.message);
  redirect("/");
}

export async function deleteAccount() {
  const { supabase, user } = await currentUser();
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
  const { url } = getSupabaseConfig();
  const admin = createAdminClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("household_id").eq("user_id", user.id).single();
  if (profileError || !profile) throw new Error("Profile not found");
  const { data: household } = await supabase.from("households")
    .select("owner_id").eq("id", profile.household_id).single();
  if (household?.owner_id === user.id) {
    const { count, error } = await admin.from("profiles")
      .select("user_id", { count: "exact", head: true }).eq("household_id", profile.household_id);
    if (error) throw new Error(error.message);
    if ((count ?? 0) > 1) return { error: "has_members" as const };
  }
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw new Error(error.message);
  redirect("/");
}

export async function resetDemoData() {
  const { supabase } = await currentUser();
  const { error } = await supabase.rpc("reset_fridgy_demo");
  if (error) throw new Error(error.message);
}
