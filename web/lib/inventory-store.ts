import type { Recipe } from "./demo-recipes.ts";
import { demoProducts, type DemoProduct } from "./demo-data.ts";

export const INVENTORY_STORAGE_KEY = "fridgy-inventory";

export type InventoryDeduction = {
  productId: string;
  amount: number;
};

export type InventoryDeductionSuggestion = InventoryDeduction & {
  ingredientAmount: string;
  selected: boolean;
};

type InventoryStorage = Pick<Storage, "getItem" | "setItem">;

function isProduct(value: unknown): value is DemoProduct {
  if (!value || typeof value !== "object") return false;
  const product = value as DemoProduct;
  return (
    typeof product.id === "string" &&
    typeof product.name === "string" &&
    typeof product.quantity === "number" &&
    Number.isFinite(product.quantity) &&
    product.quantity >= 0 &&
    typeof product.unit === "string" &&
    typeof product.category === "string" &&
    ["Lodówka", "Zamrażarka", "Spiżarnia"].includes(product.storageLocation) &&
    typeof product.estimatedUseBy === "string" &&
    ["active", "consumed"].includes(product.status)
  );
}

export function readInventory(storage: InventoryStorage): DemoProduct[] {
  const saved = storage.getItem(INVENTORY_STORAGE_KEY);
  if (!saved) return demoProducts;

  try {
    const data: unknown = JSON.parse(saved);
    if (!data || typeof data !== "object") return demoProducts;
    const inventory = data as { version?: unknown; products?: unknown };
    return inventory.version === 1 &&
      Array.isArray(inventory.products) &&
      inventory.products.every(isProduct)
      ? inventory.products
      : demoProducts;
  } catch {
    return demoProducts;
  }
}

export function writeInventory(
  storage: InventoryStorage,
  products: DemoProduct[],
) {
  storage.setItem(
    INVENTORY_STORAGE_KEY,
    JSON.stringify({ version: 1, products }),
  );
}

export function suggestRecipeDeductions(
  recipe: Pick<Recipe, "ingredients">,
  products: DemoProduct[],
): InventoryDeductionSuggestion[] {
  return recipe.ingredients.flatMap((ingredient) => {
    const product = products.find(
      (item) =>
        item.status === "active" &&
        normalize(item.name) === normalize(ingredient.name),
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
