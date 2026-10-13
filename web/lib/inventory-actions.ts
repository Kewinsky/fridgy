import type { DemoProduct, StorageLocation } from "./demo-data.ts";

export type InventoryAction =
  | { type: "consume" }
  | { type: "move"; location: StorageLocation }
  | { type: "remove" };

export function applyInventoryAction(
  products: DemoProduct[],
  selectedIds: Set<string>,
  action: InventoryAction,
  frozenUntil: string,
) {
  if (action.type === "remove") {
    return products.filter((product) => !selectedIds.has(product.id));
  }

  return products.map((product) => {
    if (!selectedIds.has(product.id)) return product;
    if (action.type === "consume") return { ...product, status: "consumed" as const };
    return {
      ...product,
      storageLocation: action.location,
      estimatedUseBy: action.location === "Zamrażarka" ? frozenUntil : product.estimatedUseBy,
    };
  });
}
