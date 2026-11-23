"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { FreshnessLabel } from "@/components/dashboard/freshness-label";
import {
  productCategoryMessageKeys,
  type ProductCategory,
} from "@/components/dashboard/product-category-options";
import { ProductVisual } from "@/components/dashboard/product-visual";
import { storageLocationMessageKeys } from "@/components/dashboard/storage-location-icon";
import { Badge } from "@/components/ui/badge";
import type { DemoProduct } from "@/lib/demo-data";
import { formatUserDate } from "@/lib/date-format";
import { localizeDemoProduct, localizeUnit } from "@/lib/demo-localization";
import type { Locale } from "@/i18n/config";
import type { InventoryView } from "@/lib/inventory-view";

export function ProductRowDetails({
  product,
  view,
}: {
  product: DemoProduct;
  view?: InventoryView;
}) {
  const t = useTranslations("Inventory");
  const common = useTranslations("Common");
  const locale = useLocale() as Locale;
  const displayProduct = localizeDemoProduct(product, locale);
  const quantity = `${product.quantity.toLocaleString(locale)} ${localizeUnit(product.unit, product.quantity, locale)}`;
  const location = t(
    `locations.${storageLocationMessageKeys[product.storageLocation]}`,
  );
  const categoryKey =
    productCategoryMessageKeys[product.category as ProductCategory];
  const category = categoryKey
    ? t(`categories.${categoryKey}`)
    : product.category;

  if (view === "readable")
    return (
      <span className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <span className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-bold text-foreground">
          <span className="break-words">{displayProduct.name}</span>
          {product.status === "active" ? (
            <FreshnessLabel date={product.estimatedUseBy} showDate={false} />
          ) : (
            <Badge variant="secondary">{t("tabs.consumed")}</Badge>
          )}
          {product.isDemo ? (
            <Badge variant="outline">{common("demoData")}</Badge>
          ) : null}
        </span>
        <span className="shrink-0 text-sm font-medium text-muted-foreground">
          {quantity}
        </span>
      </span>
    );

  return (
    <>
      <ProductVisual category={product.category} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 text-sm font-bold text-foreground">
          <span className="break-words">{displayProduct.name}</span>
          {product.isDemo ? (
            <Badge variant="outline">{common("demoData")}</Badge>
          ) : null}
        </span>
        {product.status === "active" ? (
          <>
            <span className="mt-1 block text-xs text-muted-foreground">
              {quantity} · {location}
              {view === "compact" ? ` · ${category}` : ""}
            </span>
            <span className="mt-2 block">
              <FreshnessLabel date={product.estimatedUseBy} />
            </span>
          </>
        ) : view === "compact" ? (
          <span className="mt-1 block text-xs text-muted-foreground">
            {category}
          </span>
        ) : null}
      </span>
    </>
  );
}

export function ProductTableHead() {
  const t = useTranslations("Inventory.columns");
  return (
    <thead className="bg-secondary/40 text-left text-xs font-semibold text-muted-foreground">
      <tr>
        <th scope="col" className="border-b border-r border-border px-4 py-3">
          {t("product")}
        </th>
        <th scope="col" className="border-b border-r border-border px-4 py-3">
          {t("quantity")}
        </th>
        <th scope="col" className="border-b border-r border-border px-4 py-3">
          {t("category")}
        </th>
        <th scope="col" className="border-b border-r border-border px-4 py-3">
          {t("location")}
        </th>
        <th scope="col" className="border-b border-r border-border px-4 py-3">
          {t("status")}
        </th>
        <th scope="col" className="border-b border-border px-4 py-3">
          {t("date")}
        </th>
      </tr>
    </thead>
  );
}

export function ProductTableCells({
  product,
  selection,
}: {
  product: DemoProduct;
  selection?: ReactNode;
}) {
  const t = useTranslations("Inventory");
  const common = useTranslations("Common");
  const locale = useLocale() as Locale;
  const { dateFormat } = useDashboardData();
  const displayProduct = localizeDemoProduct(product, locale);
  const categoryKey =
    productCategoryMessageKeys[product.category as ProductCategory];
  const category = categoryKey
    ? t(`categories.${categoryKey}`)
    : product.category;

  return (
    <>
      <td className="border-r border-border px-4 py-3">
        <span className="flex min-w-0 items-center gap-2 font-semibold text-foreground">
          {selection}
          <span className="min-w-0 break-words">{displayProduct.name}</span>
          {product.isDemo ? (
            <Badge variant="outline">{common("demoData")}</Badge>
          ) : null}
        </span>
      </td>
      <td className="border-r border-border px-4 py-3 whitespace-nowrap tabular-nums">
        {product.quantity.toLocaleString(locale)}{" "}
        {localizeUnit(product.unit, product.quantity, locale)}
      </td>
      <td className="border-r border-border px-4 py-3">{category}</td>
      <td className="border-r border-border px-4 py-3">
        {t(`locations.${storageLocationMessageKeys[product.storageLocation]}`)}
      </td>
      <td className="border-r border-border px-4 py-3">
        {product.status === "active" ? (
          <FreshnessLabel date={product.estimatedUseBy} showDate={false} />
        ) : (
          <Badge variant="secondary">{t("tabs.consumed")}</Badge>
        )}
      </td>
      <td className="border-border px-4 py-3 whitespace-nowrap tabular-nums">
        {formatUserDate(product.estimatedUseBy, dateFormat)}
      </td>
    </>
  );
}
