"use client";

import { useLocale, useTranslations } from "next-intl";

import { FreshnessLabel } from "@/components/dashboard/freshness-label";
import { productCategoryMessageKeys, type ProductCategory } from "@/components/dashboard/product-category-options";
import { ProductVisual } from "@/components/dashboard/product-visual";
import { storageLocationMessageKeys } from "@/components/dashboard/storage-location-icon";
import { Badge } from "@/components/ui/badge";
import type { DemoProduct } from "@/lib/demo-data";
import { localizeDemoProduct, localizeUnit } from "@/lib/demo-localization";
import type { Locale } from "@/i18n/config";
import type { InventoryView } from "@/lib/inventory-view";

export function ProductRowDetails({ product, view }: { product: DemoProduct; view?: InventoryView }) {
  const t = useTranslations("Inventory");
  const common = useTranslations("Common");
  const locale = useLocale() as Locale;
  const displayProduct = localizeDemoProduct(product, locale);
  const quantity = `${product.quantity.toLocaleString(locale)} ${localizeUnit(product.unit, product.quantity, locale)}`;
  const location = t(`locations.${storageLocationMessageKeys[product.storageLocation]}`);
  const categoryKey = productCategoryMessageKeys[product.category as ProductCategory];
  const category = categoryKey ? t(`categories.${categoryKey}`) : product.category;

  if (view === "compact") return (
    <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
      <span className="min-w-0 flex-1 break-words text-sm font-bold text-foreground">{displayProduct.name}</span>
      {product.isDemo ? <Badge variant="outline">{common("demoData")}</Badge> : null}
      {product.status === "active" ? <>
        <span className="shrink-0 text-xs text-muted-foreground">{quantity}</span>
        <FreshnessLabel date={product.estimatedUseBy} showDate={false} />
      </> : null}
    </span>
  );

  if (view === "readable") return (
    <>
      <ProductVisual category={product.category} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm font-bold text-foreground">
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="break-words">{displayProduct.name}</span>
            {product.isDemo ? <Badge variant="outline">{common("demoData")}</Badge> : null}
          </span>
          {product.status === "active" ? <span className="shrink-0 font-medium text-muted-foreground">{quantity}</span> : null}
        </span>
        {product.status === "active" ? <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs text-muted-foreground">{location}</span>
          <FreshnessLabel date={product.estimatedUseBy} />
        </span> : null}
      </span>
    </>
  );

  return (
    <>
      <ProductVisual category={product.category} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 text-sm font-bold text-foreground">
          <span className="break-words">{displayProduct.name}</span>
          {product.isDemo ? <Badge variant="outline">{common("demoData")}</Badge> : null}
        </span>
        {product.status === "active" ? <>
          <span className="mt-1 block text-xs text-muted-foreground">
            {quantity} · {location}{view === "detailed" ? ` · ${category}` : ""}
          </span>
          <span className="mt-2 block"><FreshnessLabel date={product.estimatedUseBy} /></span>
        </> : view === "detailed" ? <span className="mt-1 block text-xs text-muted-foreground">{category}</span> : null}
      </span>
    </>
  );
}
