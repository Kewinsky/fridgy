import type { Locale } from "../i18n/config.ts";
import type { DemoProduct } from "./demo-data.ts";
import { localizeDemoProduct } from "./demo-localization.ts";

export const inventorySorts = ["default", "nameAsc", "nameDesc", "expiryAsc", "expiryDesc"] as const;
export type InventorySort = (typeof inventorySorts)[number];

export function sortInventoryProducts(products: DemoProduct[], sort: InventorySort, locale: Locale) {
  if (sort === "default") return products;

  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: "base" });
  return [...products].sort((a, b) => {
    const nameOrder = collator.compare(localizeDemoProduct(a, locale).name, localizeDemoProduct(b, locale).name);
    if (sort === "nameAsc") return nameOrder;
    if (sort === "nameDesc") return -nameOrder;

    const dateOrder = a.estimatedUseBy.localeCompare(b.estimatedUseBy);
    if (dateOrder !== 0) return sort === "expiryAsc" ? dateOrder : -dateOrder;
    return nameOrder;
  });
}
