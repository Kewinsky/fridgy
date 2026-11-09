import { getIngredientQuantity, type Recipe } from "./demo-recipes.ts";
import type { DemoProduct } from "./demo-data.ts";

const tapWaterNames = new Set([
  "woda", "woda kranowa", "woda z kranu", "water", "tap water",
  "wasser", "leitungswasser", "eau", "eau du robinet", "agua", "agua del grifo",
]);

export type InventoryDeduction = {
  productId: string;
  amount: number;
};

export type InventoryDeductionSuggestion = InventoryDeduction & {
  ingredientAmount: string;
  selected: boolean;
};

export function suggestRecipeDeductions(
  recipe: Pick<Recipe, "ingredients">,
  products: DemoProduct[],
): InventoryDeductionSuggestion[] {
  const deductions = new Map<string, InventoryDeductionSuggestion>();
  for (const ingredient of recipe.ingredients) {
    if (isTapWaterIngredient(ingredient.name)) continue;
    const matching = products.filter((product) =>
      product.status === "active" && product.quantity > 0 && productNameMatches(product.name, ingredient.name),
    );
    if (!matching.length) continue;

    const required = getIngredientQuantity(ingredient);
    const requiredUnit = required ? normalizeUnit(required.unit) : "";
    const compatible = required ? matching.filter((product) =>
      inventoryBaseUnit(normalizeUnit(product.unit)) === inventoryBaseUnit(requiredUnit),
    ) : [];
    if (!required || !compatible.length) {
      const product = matching[0];
      if (!deductions.has(product.id)) deductions.set(product.id, {
        productId: product.id, ingredientAmount: ingredient.amount, amount: 0, selected: false,
      });
      continue;
    }

    let remaining = required.quantity * unitMultiplier(requiredUnit);
    for (const product of compatible) {
      const previous = deductions.get(product.id);
      const multiplier = unitMultiplier(normalizeUnit(product.unit));
      const available = product.quantity - (previous?.amount ?? 0);
      const amount = Math.min(available, Math.floor((remaining / multiplier + 1e-9) * 1000) / 1000);
      if (amount <= 0) continue;
      deductions.set(product.id, {
        productId: product.id,
        ingredientAmount: previous ? `${previous.ingredientAmount} + ${ingredient.amount}` : ingredient.amount,
        amount: Number(((previous?.amount ?? 0) + amount).toFixed(3)),
        selected: true,
      });
      remaining -= amount * multiplier;
      if (remaining <= 1e-9) break;
    }
  }
  return [...deductions.values()];
}

export function matchRecipeToInventory(recipe: Recipe, products: DemoProduct[]): Recipe {
  return {
    ...recipe,
    ingredients: recipe.ingredients.map((ingredient) => ({
      ...ingredient,
      available: hasEnoughIngredient(ingredient, products),
    })),
  };
}

export function hasEnoughIngredient(ingredient: Recipe["ingredients"][number], products: DemoProduct[]) {
  if (isTapWaterIngredient(ingredient.name)) return true;
  const required = getIngredientQuantity(ingredient);
  if (!required) return false;
  const unit = normalizeUnit(required.unit);
  const baseUnit = inventoryBaseUnit(unit);
  const needed = required.quantity * unitMultiplier(unit);
  const available = products.reduce((total, product) => {
    if (product.status !== "active" || !productNameMatches(product.name, ingredient.name)) return total;
    const productUnit = normalizeUnit(product.unit);
    if (inventoryBaseUnit(productUnit) !== baseUnit) return total;
    return total + product.quantity * unitMultiplier(productUnit);
  }, 0);
  return available >= needed;
}

export function isTapWaterIngredient(name: string) {
  return tapWaterNames.has(normalize(name));
}

function inventoryBaseUnit(unit: string) {
  if (unit === "kg") return "g";
  if (unit === "l") return "ml";
  return unit;
}

function unitMultiplier(unit: string) {
  return unit === "kg" || unit === "l" ? 1000 : 1;
}

function productNameMatches(productName: string, ingredientName: string) {
  const product = normalize(productName);
  const ingredient = normalize(ingredientName);
  return product === ingredient || product.startsWith(`${ingredient} `) || ingredient.startsWith(`${product} `);
}

export function applyInventoryDeductions(
  products: DemoProduct[],
  deductions: InventoryDeduction[],
) {
  const amounts = new Map(
    deductions
      .filter((deduction) => deduction.amount > 0)
      .map((deduction) => [deduction.productId, deduction.amount]),
  );

  return products.map((product) => {
    const amount = amounts.get(product.id);
    if (!amount || product.status !== "active") return product;
    const quantity = Math.max(0, Number((product.quantity - amount).toFixed(3)));
    return {
      ...product,
      quantity,
      status: quantity === 0 ? ("consumed" as const) : product.status,
    };
  });
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("pl");
}

function normalizeUnit(value: string) {
  return normalize(value).replaceAll(".", "");
}
