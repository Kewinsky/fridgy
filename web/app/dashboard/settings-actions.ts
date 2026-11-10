"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { PROFILE_IMAGE_BUCKET } from "@/lib/profile-image";
import { RECIPE_IMAGE_BUCKET } from "@/lib/recipe-image";
import { recipeAllergens } from "@/lib/demo-recipes";
import { shouldRelocateRecipeImage } from "@/lib/account-deletion";

const profileSettings = z.object({
  notification_days: z.array(z.union([z.literal(0), z.literal(1), z.literal(3)])).max(3),
  diet: z.enum(["none", "vegetarian", "vegan", "pescatarian"]),
  allergies: z.string().max(500).refine((value) => !value || value.split(",").every((allergen) => recipeAllergens.includes(allergen as typeof recipeAllergens[number]))),
  excluded_ingredients: z.string().max(500),
  deduction_mode: z.enum(["always", "never", "ask"]),
  receipt_mode: z.enum(["automatic", "review"]),
  date_format: z.enum(["DD.MM.YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]),
  preferred_cuisines: z.array(z.string().max(50)).max(20),
});

export type ProfileSettings = z.infer<typeof profileSettings>;
const preferenceSettings = profileSettings.pick({
  notification_days: true,
  diet: true,
  allergies: true,
  excluded_ingredients: true,
  deduction_mode: true,
  receipt_mode: true,
});
export type PreferenceSettingsValues = z.infer<typeof preferenceSettings>;

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

export async function savePreferenceSettings(settings: PreferenceSettingsValues) {
  const validSettings = preferenceSettings.parse(settings);
  const { supabase, user } = await currentUser();
  const { error } = await supabase.from("profiles").update(validSettings).eq("user_id", user.id);
  if (error) throw new Error(error.message);
}

export async function saveUsername(value: string) {
  const username = z.string().trim().min(1).max(100).parse(value);
  const { supabase, user } = await currentUser();
  const { error } = await supabase.from("profiles")
    .update({ username }).eq("user_id", user.id).select("username").single();
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

export async function createHousehold(name: string, includeDemoData: boolean) {
  const validName = z.string().trim().min(1).max(100).parse(name);
  const validDemoChoice = z.boolean().parse(includeDemoData);
  const { supabase } = await currentUser();
  const { error } = await supabase.rpc("create_fridgy_household", {
    household_name: validName, include_demo_data: validDemoChoice,
  });
  if (error) throw new Error(error.message);
}

export async function switchHousehold(id: string) {
  const validId = z.uuid().parse(id);
  const { supabase } = await currentUser();
  const { error } = await supabase.rpc("switch_fridgy_household", { target_household: validId });
  if (error) throw new Error(error.message);
}

export async function getHouseholdJoinCode(householdId: string) {
  const { supabase } = await currentUser();
  const { data, error } = await supabase.rpc("get_fridgy_join_code", { target_household: z.uuid().parse(householdId) });
  if (error || typeof data !== "string") throw new Error(error?.message ?? "Join code unavailable");
  return data;
}

export async function rotateHouseholdJoinCode(householdId: string) {
  const { supabase } = await currentUser();
  const { data, error } = await supabase.rpc("rotate_fridgy_join_code", { target_household: z.uuid().parse(householdId) });
  if (error || typeof data !== "string") throw new Error(error?.message ?? "Join code unavailable");
  return data;
}

export async function requestHouseholdJoin(code: string) {
  const validCode = z.string().trim().toUpperCase().regex(/^[A-Z0-9]{6}$/).safeParse(code);
  if (!validCode.success) return "invalid" as const;
  const { supabase } = await currentUser();
  const { data, error } = await supabase.rpc("request_fridgy_household_join", { join_code: validCode.data });
  if (error) throw new Error(error.message);
  return z.enum(["invalid", "requested", "pending", "member"]).parse(data);
}

export async function getMyJoinStatus(code: string) {
  const { supabase } = await currentUser();
  const { data, error } = await supabase.rpc("get_my_fridgy_join_status", { join_code: z.string().regex(/^[A-Z0-9]{6}$/).parse(code) });
  if (error) throw new Error(error.message);
  return z.enum(["none", "pending", "approved", "denied"]).parse(data);
}

export type HouseholdJoinRequest = { id: string; username: string; email: string; requested_at: string };

export async function listHouseholdJoinRequests(householdId: string): Promise<HouseholdJoinRequest[]> {
  const { supabase } = await currentUser();
  const { data, error } = await supabase.rpc("list_fridgy_join_requests", { target_household: z.uuid().parse(householdId) });
  if (error) throw new Error(error.message);
  return (data ?? []) as HouseholdJoinRequest[];
}

export async function decideHouseholdJoin(requestId: string, approve: boolean) {
  const { supabase } = await currentUser();
  const { error } = await supabase.rpc("decide_fridgy_household_join", {
    join_request: z.uuid().parse(requestId), approve: z.boolean().parse(approve),
  });
  if (error) throw new Error(error.message);
}

export type HouseholdMember = { user_id: string; username: string; email: string; is_owner: boolean };

export async function listHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  const { supabase } = await currentUser();
  const { data, error } = await supabase.rpc("list_fridgy_household_members", {
    target_household: z.uuid().parse(householdId),
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as HouseholdMember[];
}

export async function transferHouseholdOwnership(householdId: string, nextOwnerId: string) {
  const { supabase } = await currentUser();
  const { error } = await supabase.rpc("transfer_fridgy_household_owner", {
    target_household: z.uuid().parse(householdId), next_owner: z.uuid().parse(nextOwnerId),
  });
  if (error) throw new Error(error.message);
}

export async function removeHouseholdMember(householdId: string, userId: string) {
  const { supabase } = await currentUser();
  const { error } = await supabase.rpc("remove_fridgy_household_member", {
    target_household: z.uuid().parse(householdId), target_user: z.uuid().parse(userId),
  });
  if (error) throw new Error(error.message);
}

export async function exportAccountData() {
  const { supabase, user } = await currentUser();
  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("*").eq("user_id", user.id).single();
  if (profileError || !profile) throw new Error("Profile not found");
  const householdId = profile.household_id;
  const [household, products, shopping, recipes, cookingHistory] = await Promise.all([
    supabase.from("households").select("id,name").eq("id", householdId).single(),
    supabase.from("products").select("*").eq("household_id", householdId),
    supabase.from("shopping_items").select("*").eq("household_id", householdId),
    supabase.from("recipes").select("*").eq("household_id", householdId),
    supabase.from("cooking_history").select("*").eq("household_id", householdId),
  ]);
  if (household.error || products.error || shopping.error || recipes.error || cookingHistory.error)
    throw new Error("Export failed");
  return {
    email: user.email, profile, household: household.data, products: products.data,
    shoppingItems: shopping.data, recipes: recipes.data, cookingHistory: cookingHistory.data,
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
    .select("household_id,avatar_path").eq("user_id", user.id).single();
  if (profileError || !profile) throw new Error("Profile not found");
  const { data: ownedHouseholds, error: householdError } = await admin.from("households")
    .select("id").eq("owner_id", user.id);
  if (householdError) throw new Error(householdError.message);
  if (ownedHouseholds?.length) {
    const { data: members, error: membersError } = await admin.from("household_memberships")
      .select("household_id,user_id").in("household_id", ownedHouseholds.map((household) => household.id));
    if (membersError) throw new Error(membersError.message);
    if (members?.some((member) => member.user_id !== user.id)) return { error: "has_members" as const };
  }
  const deletedHouseholds = new Set((ownedHouseholds ?? []).map((household) => household.id));
  const recipeStorage = admin.storage.from(RECIPE_IMAGE_BUCKET);
  const imageNames: string[] = [];
  const copiedImages = new Set<string>();
  for (let offset = 0; ; offset += 1000) {
    const { data: files, error: listError } = await recipeStorage.list(user.id, { limit: 1000, offset });
    if (listError) throw new Error(listError.message);
    imageNames.push(...(files ?? []).filter((file) => file.id).map((file) => file.name));
    if (!files || files.length < 1000) break;
  }
  for (const filename of imageNames) {
    const { data: references, error: referenceError } = await admin.from("recipes")
      .select("household_id,slug,user_id,recipe").contains("recipe", { imagePath: filename });
    if (referenceError) throw new Error(referenceError.message);
    for (const reference of references ?? []) {
      if (!shouldRelocateRecipeImage({ ...reference, recipe: reference.recipe as { imageOwnerId?: string } }, user.id, deletedHouseholds)) continue;
      const destination = `${reference.household_id}/${filename}`;
      if (!copiedImages.has(destination)) {
        const { error: copyError } = await recipeStorage.copy(`${user.id}/${filename}`, destination);
        if (copyError) {
          const { error: existingError } = await recipeStorage.info(destination);
          if (existingError) throw new Error(copyError.message);
        }
        copiedImages.add(destination);
      }
      const { error: updateError } = await admin.rpc("relocate_fridgy_recipe_image", {
        target_household: reference.household_id,
        target_slug: reference.slug,
        filename,
        previous_owner: user.id,
      });
      if (updateError) throw new Error(updateError.message);
    }
  }
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    if (error.message.includes("Transfer ownership")) return { error: "has_members" as const };
    throw new Error(error.message);
  }
  for (let offset = 0; offset < imageNames.length; offset += 100) {
    try {
      const { error: cleanupError } = await recipeStorage.remove(
        imageNames.slice(offset, offset + 100).map((name) => `${user.id}/${name}`),
      );
      if (cleanupError) console.error("Recipe image cleanup failed", cleanupError);
    } catch (cleanupError) {
      console.error("Recipe image cleanup failed", cleanupError);
    }
  }
  if (typeof profile.avatar_path === "string") {
    try {
      const { error: avatarCleanupError } = await admin.storage.from(PROFILE_IMAGE_BUCKET)
        .remove([`${user.id}/${profile.avatar_path}`]);
      if (avatarCleanupError) console.error("Profile image cleanup failed", avatarCleanupError);
    } catch (avatarCleanupError) {
      console.error("Profile image cleanup failed", avatarCleanupError);
    }
  }
  return { error: null };
}

export async function resetDemoData(expectedHouseholdId: string) {
  const { supabase } = await currentUser();
  const { error } = await supabase.rpc("remove_fridgy_demo_for_household", { expected_household: z.uuid().parse(expectedHouseholdId) });
  if (error) throw new Error(error.message);
}
