"use client";

import { useLocale, useTranslations } from "next-intl";

import { FreshnessLabel } from "@/components/dashboard/freshness-label";
import { ProductVisual } from "@/components/dashboard/product-visual";
import { storageLocationMessageKeys } from "@/components/dashboard/storage-location-icon";
import { Badge } from "@/components/ui/badge";
import type { DemoProduct } from "@/lib/demo-data";
import { localizeDemoProduct, localizeUnit } from "@/lib/demo-localization";
import type { Locale } from "@/i18n/config";

export function ProductRowDetails({ product }: { product: DemoProduct }) {
  const t = useTranslations("Inventory");
  const common = useTranslations("Common");
  const locale = useLocale() as Locale;
  const displayProduct = localizeDemoProduct(product, locale);

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
            {product.quantity.toLocaleString(locale)} {localizeUnit(product.unit, product.quantity, locale)} ·{" "}
            {t(`locations.${storageLocationMessageKeys[product.storageLocation]}`)}
          </span>
          <span className="mt-2 block"><FreshnessLabel date={product.estimatedUseBy} /></span>
        </> : null}
      </span>
    </>
  );
}
