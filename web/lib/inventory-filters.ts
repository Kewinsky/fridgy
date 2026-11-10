import { getFreshnessStatus, type DemoProduct, type FreshnessStatus, type StorageLocation } from "./demo-data.ts";

export function matchesInventoryFilters(
  product: DemoProduct,
  locations: readonly StorageLocation[],
  categories: readonly string[],
  freshnesses: readonly FreshnessStatus[],
) {
  return product.status === "active"
    && (!locations.length || locations.includes(product.storageLocation))
    && (!categories.length || categories.includes(product.category))
    && (!freshnesses.length || freshnesses.includes(getFreshnessStatus(product.estimatedUseBy)));
}
