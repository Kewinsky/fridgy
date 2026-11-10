import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { DashboardData } from "@/lib/dashboard-data";
import { prepareGeneratedRecipe } from "@/lib/generated-recipes";
import { generationInputSchema, requestDailyRecipe } from "@/lib/recipe-generation";
import type { StoredRecipe } from "@/lib/recipe-library";
import type { Locale } from "@/i18n/config";

type DailyIdea = { status: "ready"; recipe: StoredRecipe } | { status: "pending" | "failed" | "unavailable" | "empty" };

export async function getDailyIdea(dashboard: DashboardData, locale: Locale): Promise<DailyIdea> {
  const supabase = await createClient();
  // shortcut: daily ideas use Warsaw time until user time zones are stored.
  const date = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
  const target = { household_id: dashboard.householdId, idea_date: date };
  const { data: existing, error: readError } = await supabase.from("daily_recipe_ideas")
    .select("status,recipe_slug,reserved_at").match(target).maybeSingle();
  if (readError) return { status: "unavailable" };
  if (existing) {
    if (existing.status === "pending" && Date.now() - new Date(existing.reserved_at).getTime() > 120_000) return { status: "failed" };
    if (existing.status !== "ready") return { status: existing.status === "pending" ? "pending" : "failed" };
    const recipe = dashboard.recipes.find((item) => item.slug === existing.recipe_slug);
    return recipe ? { status: "ready", recipe } : { status: "unavailable" };
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) return { status: "unavailable" };
  if (!dashboard.products.some((product) => product.status === "active" && product.quantity > 0)) return { status: "empty" };

  const { data: reserved, error: reserveError } = await supabase.rpc("reserve_fridgy_daily_idea", {
    target_household: dashboard.householdId, target_date: date,
  });
  if (reserveError) return { status: "unavailable" };
  if (!reserved) return { status: "pending" };

  try {
    const input = generationInputSchema.parse({
      meal: "lunch", servings: 2, time: "any", shopping: "two", cuisines: [],
      savedRecipes: "newOnly", notes: "", locale,
      excludeTitles: dashboard.recipes.slice(0, 100).map((recipe) => recipe.title),
    });
    const generated = await requestDailyRecipe(key, input, dashboard.products, dashboard, dashboard.recipes);
    if (!generated) throw new Error("No suitable daily recipe");
    const recipe = prepareGeneratedRecipe(generated, crypto.randomUUID());
    const { error } = await supabase.rpc("complete_fridgy_daily_idea", {
      target_household: dashboard.householdId, target_date: date, recipe_payload: recipe,
    });
    if (error) throw new Error(error.message);
    return { status: "ready", recipe };
  } catch {
    await supabase.rpc("fail_fridgy_daily_idea", { target_household: dashboard.householdId, target_date: date });
    return { status: "failed" };
  }
}
