import type { Recipe } from "./demo-recipes.ts";
import type { DemoProduct } from "./demo-data.ts";

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
  return recipe.ingredients.flatMap((ingredient) => {
    const product = products.find(
      (item) =>
        item.status === "active" &&
        productNameMatches(item.name, ingredient.name),
    );
    if (!product) return [];

    const parsedAmount = parseAmount(ingredient.amount);
    const compatible =
      parsedAmount !== null &&
      normalizeUnit(parsedAmount.unit) === normalizeUnit(product.unit);

    return [
      {
        productId: product.id,
        ingredientAmount: ingredient.amount,
        amount: compatible
          ? Math.min(parsedAmount.quantity, product.quantity)
          : 0,
        selected: compatible,
      },
    ];
  });
}

export function matchRecipeToInventory(recipe: Recipe, products: DemoProduct[]): Recipe {
  return {
    ...recipe,
    ingredients: recipe.ingredients.map((ingredient) => ({
      ...ingredient,
      available: products.some((product) =>
        product.status === "active" && product.quantity > 0 &&
        productNameMatches(product.name, ingredient.name)),
    })),
  };
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

function parseAmount(value: string) {
  const match = value.trim().match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/);
  if (!match) return null;
  return {
    quantity: Number(match[1].replace(",", ".")),
    unit: match[2],
  };
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("pl");
}

function normalizeUnit(value: string) {
  return normalize(value).replaceAll(".", "");
}
