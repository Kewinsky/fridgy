"use client";

import { useState } from "react";
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
  disabled = false,
  onAdded,
}: {
  names: string[];
  className?: string;
  label?: string;
  disabled?: boolean;
  onAdded?: () => void;
}) {
  const t = useTranslations("AddMissingItems");
  const common = useTranslations("Common");
  const { updateShoppingItems } = useDashboardData();
  const [pending, setPending] = useState(false);

  async function addItems() {
    if (pending || disabled) return;
    setPending(true);
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
    } finally {
      setPending(false);
    }
    onAdded?.();
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
      disabled={disabled || pending}
      onClick={addItems}
    >
      <ShoppingCartPlusIcon aria-hidden="true" />
      {label ?? t("button")}
    </Button>
  );
}
