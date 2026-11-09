"use client";

import { ShoppingCartPlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { mergeShoppingItems } from "@/lib/shopping-list";
import { cn } from "@/lib/utils";

export function AddMissingItemsButton({
  names,
  className,
  label,
}: {
  names: string[];
  className?: string;
  label?: string;
}) {
  const t = useTranslations("AddMissingItems");
  const common = useTranslations("Common");
  const { updateShoppingItems } = useDashboardData();

  async function addItems() {
    let added = 0;
    try {
      await updateShoppingItems((current) => {
        const result = mergeShoppingItems(current, names);
        added = result.changedCount;
        return result.items;
      });
    } catch {
      toast.error(common("saveFailed"));
      return;
    }
    if (!added) {
      toast.info(t("alreadyAdded"));
      return;
    }
    toast.success(t("success", { count: added }));
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={cn("h-11", className)}
      onClick={addItems}
    >
      <ShoppingCartPlusIcon aria-hidden="true" />
      {label ?? t("button")}
    </Button>
  );
}
