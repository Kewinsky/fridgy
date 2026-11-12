"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, ShoppingCartPlusIcon, Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { localizeDemoProduct } from "@/lib/demo-localization";
import { mergeShoppingItems } from "@/lib/shopping-list";
import type { Locale } from "@/i18n/config";

export function ConsumedProductsCard() {
  const t = useTranslations("Dashboard");
  const common = useTranslations("Common");
  const locale = useLocale() as Locale;
  const { products, updateInventory, updateShoppingItems } = useDashboardData();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const consumed = products.filter((product) => product.status === "consumed").slice(0, 5);
  const selected = consumed.filter((product) => selectedIds.has(product.id));
  const selectedNames = selected.map((product) => localizeDemoProduct(product, locale).name);

  function selectProduct(id: string, selected: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function removeSelected() {
    if (pending || !selectedNames.length) return;
    const ids = new Set(selected.map((product) => product.id));
    setPending(true);
    try {
      await updateInventory((current) => current.filter((product) => !ids.has(product.id)));
      setSelectedIds(new Set());
      toast.success(t("consumedRemoved"));
    } catch {
      toast.error(common("saveFailed"));
    } finally {
      setPending(false);
    }
  }

  async function addSelected() {
    if (pending || !selectedNames.length) return;
    const ids = new Set(selected.map((product) => product.id));
    setPending(true);
    try {
      await updateShoppingItems((current) => mergeShoppingItems(current, selectedNames).items);
    } catch {
      toast.error(common("saveFailed"));
      setPending(false);
      return;
    }
    try {
      await updateInventory((current) => current.filter((product) => !ids.has(product.id)));
      setSelectedIds(new Set());
      toast.success(t("consumedMoved"));
    } catch {
      toast.error(t("consumedRemovalFailed"));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="app-card min-w-0 overflow-hidden">
      <div className="p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">{t("consumedEyebrow")}</p>
        <h2 className="mt-1 text-xl font-extrabold">{t("consumedTitle")}</h2>
        {consumed.length ? (
          <ul className="mt-4 divide-y divide-border">
            {consumed.map((product) => (
              <li key={product.id}>
                <label htmlFor={`replenish-${product.id}`} className="flex min-h-14 cursor-pointer items-center gap-3 py-2 text-sm font-semibold">
                  <Checkbox
                    id={`replenish-${product.id}`}
                    checked={selectedIds.has(product.id)}
                    disabled={pending}
                    onCheckedChange={(checked) => selectProduct(product.id, checked === true)}
                  />
                  <span className="min-w-0 break-words">{localizeDemoProduct(product, locale).name}</span>
                </label>
              </li>
            ))}
          </ul>
        ) : <p className="mt-4 text-sm text-muted-foreground">{t("consumedEmpty")}</p>}
        {consumed.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" className="min-h-11 flex-1" disabled={pending || !selectedNames.length} onClick={addSelected}>
              <ShoppingCartPlusIcon aria-hidden="true" /> {t("addToShopping")}
            </Button>
            <Button type="button" variant="outline" className="min-h-11 flex-1" disabled={pending || !selectedNames.length} onClick={removeSelected}>
              <Trash2Icon aria-hidden="true" /> {t("removeConsumed")}
            </Button>
          </div>
        ) : null}
      </div>
      {consumed.length ? <Link href="/dashboard/zapasy?tab=consumed" className="flex min-h-12 items-center gap-2 border-t border-border px-5 text-sm font-semibold text-primary transition-colors hover:bg-secondary/60 focus-visible:outline-2 focus-visible:outline-ring sm:px-6">{t("viewAll")} <ArrowRightIcon className="size-4" aria-hidden="true" /></Link> : null}
    </section>
  );
}
