"use client";

import { ShoppingCartIcon } from "lucide-react";
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
  function addItems() {
    const added = addShoppingItems(window.localStorage, names);
    if (!added) {
      toast.info("Te produkty są już na liście zakupów.");
      return;
    }

    toast.success(
      added === 1
        ? "Dodano brakujący produkt do listy zakupów."
        : `Dodano ${added} brakujące produkty do listy zakupów.`,
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={cn("h-11", className)}
      onClick={addItems}
    >
      <ShoppingCartIcon aria-hidden="true" />
      Dodaj brakujące
    </Button>
  );
}
