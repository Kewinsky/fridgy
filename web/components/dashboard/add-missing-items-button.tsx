"use client";

import { ShoppingCartIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { addShoppingItems } from "@/lib/shopping-list";
import { cn } from "@/lib/utils";

export function AddMissingItemsButton({
  names,
  className,
}: {
  names: string[];
  className?: string;
}) {
  const t = useTranslations("AddMissingItems");

  function addItems() {
    const added = addShoppingItems(window.localStorage, names);
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
      <ShoppingCartIcon aria-hidden="true" />
      {t("button")}
    </Button>
  );
}
