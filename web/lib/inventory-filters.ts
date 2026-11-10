import { getFreshnessStatus, type DemoProduct, type FreshnessStatus, type ProductStatus, type StorageLocation } from "./demo-data.ts";

export function matchesInventoryFilters(
  product: DemoProduct,
  locations: readonly StorageLocation[],
  categories: readonly string[],
  freshnesses: readonly FreshnessStatus[],
  status: ProductStatus = "active",
) {
  return product.status === status
    && (!locations.length || locations.includes(product.storageLocation))
    && (!categories.length || categories.includes(product.category))
    && (status === "consumed" || !freshnesses.length || freshnesses.includes(getFreshnessStatus(product.estimatedUseBy)));
}
