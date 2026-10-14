"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  consumeInventory,
  useInventory,
} from "@/components/dashboard/use-inventory";
import { recordCooking } from "@/components/dashboard/use-recipe-library";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Recipe } from "@/lib/demo-recipes";
import {
  suggestRecipeDeductions,
  type InventoryDeductionSuggestion,
} from "@/lib/inventory-store";

export function FinishCookingDialog({ recipe }: { recipe: Recipe }) {
  const t = useTranslations("FinishCooking");
  const locale = useLocale();
  const router = useRouter();
  const products = useInventory();
  const [open, setOpen] = useState(false);
  const [deductions, setDeductions] = useState<
    InventoryDeductionSuggestion[]
  >([]);

  function changeOpen(nextOpen: boolean) {
    if (nextOpen) {
      setDeductions(suggestRecipeDeductions(recipe, products));
    }
    setOpen(nextOpen);
  }

  function updateDeduction(
    productId: string,
    update: Partial<Pick<InventoryDeductionSuggestion, "amount" | "selected">>,
  ) {
    setDeductions((current) =>
      current.map((deduction) =>
        deduction.productId === productId
          ? { ...deduction, ...update }
          : deduction,
      ),
    );
  }

  function finishCooking() {
    consumeInventory(
      deductions
        .filter((deduction) => deduction.selected && deduction.amount > 0)
        .map(({ amount, productId }) => ({ amount, productId })),
    );
    recordCooking(recipe);
    setOpen(false);
    toast.success(t("success"));
    router.push("/dashboard/moje-przepisy");
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger
        render={
          <Button className="mt-8 h-12 w-full">
            <CheckCircle2Icon aria-hidden="true" /> {t("open")}
          </Button>
        }
      />
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        {deductions.length ? (
          <div className="grid gap-3">
            {deductions.map((deduction) => {
              const product = products.find(
                (item) => item.id === deduction.productId,
              );
              if (!product) return null;
              const inputId = `deduction-${product.id}`;

              return (
                <div
                  key={product.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)_7rem] items-center gap-3 rounded-lg border border-border p-3"
                >
                  <Checkbox
                    id={`${inputId}-selected`}
                    checked={deduction.selected}
                    onCheckedChange={(checked) =>
                      updateDeduction(product.id, { selected: checked === true })
                    }
                    aria-label={t("deductProduct", { name: product.name })}
                  />
                  <Label htmlFor={`${inputId}-selected`} className="min-w-0">
                    <span className="block truncate font-bold">
                      {product.name}
                    </span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {t("productSummary", {
                        recipeAmount: deduction.ingredientAmount,
                        quantity: product.quantity.toLocaleString(locale),
                        unit: product.unit,
                      })}
                    </span>
                  </Label>
                  <div className="relative">
                    <Label htmlFor={inputId} className="sr-only">
                      {t("productAmount", { name: product.name })}
                    </Label>
                    <Input
                      id={inputId}
                      type="number"
                      min="0"
                      max={product.quantity}
                      step="any"
                      value={deduction.amount}
                      disabled={!deduction.selected}
                      onChange={(event) =>
                        updateDeduction(product.id, {
                          amount: Math.min(
                            product.quantity,
                            Math.max(0, Number(event.target.value) || 0),
                          ),
                        })
                      }
                      className="h-11 pr-10"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                      {product.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            {t("noMatches")}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => setOpen(false)}
          >
            {t("cancel")}
          </Button>
          <Button type="button" className="h-11" onClick={finishCooking}>
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
