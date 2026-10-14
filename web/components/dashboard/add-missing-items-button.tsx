"use client";

import { ShoppingCartIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { mergeShoppingItems } from "@/lib/shopping-list";
import { cn } from "@/lib/utils";

export function AddMissingItemsButton({
  names,
  className,
}: {
  names: string[];
  className?: string;
}) {
  const t = useTranslations("AddMissingItems");
  const common = useTranslations("Common");
  const { shoppingItems, updateShoppingItems } = useDashboardData();

  async function addItems() {
    const added = mergeShoppingItems(shoppingItems, names).changedCount;
    if (!added) {
      toast.info(t("alreadyAdded"));
      return;
    }
    try {
      await updateShoppingItems((current) => mergeShoppingItems(current, names).items);
    } catch { toast.error(common("saveFailed")); return; }
    toast.success(t("success", { count: added }));
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={cn("h-11", className)}
      onClick={addItems}
    >
      <ShoppingCartIcon aria-hidden="true" />
      {t("button")}
    </Button>
  );
}
