"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  useInventory,
} from "@/components/dashboard/use-inventory";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
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
import { localizeUnit } from "@/lib/demo-localization";
import type { Locale } from "@/i18n/config";
import {
  suggestRecipeDeductions,
  type InventoryDeductionSuggestion,
} from "@/lib/inventory-store";

export function FinishCookingDialog({ recipe }: { recipe: Recipe }) {
  const t = useTranslations("FinishCooking");
  const common = useTranslations("Common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const products = useInventory();
  const { finishCooking, deductionMode } = useDashboardData();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deductions, setDeductions] = useState<
    InventoryDeductionSuggestion[]
  >([]);

  function changeOpen(nextOpen: boolean) {
    if (isPending) return;
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

  function complete(deductionsToApply: InventoryDeductionSuggestion[]) {
    if (isPending) return;
    const selectedDeductions = deductionsToApply
      .filter((deduction) => deduction.selected && deduction.amount > 0)
      .map(({ amount, productId }) => ({ amount, productId }));
    startTransition(async () => {
      try {
        await finishCooking(recipe, selectedDeductions);
      } catch {
        toast.error(common("saveFailed"));
        return;
      }
      setOpen(false);
      toast.success(t(selectedDeductions.length ? "success" : "successNoDeduction"));
      router.push("/dashboard/moje-przepisy");
    });
  }

  let confirmLabel = t("saveOnly");
  if (isPending) {
    confirmLabel = common("saving");
  } else if (deductions.some((deduction) => deduction.selected && deduction.amount > 0)) {
    confirmLabel = t("confirm");
  }

  if (deductionMode !== "ask") {
    return <Button className="mt-8 h-12 w-full" disabled={isPending} aria-busy={isPending} onClick={() => complete(
      deductionMode === "always" ? suggestRecipeDeductions(recipe, products) : [],
    )}><CheckCircle2Icon aria-hidden="true" /> {isPending ? common("saving") : t("open")}</Button>;
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
              const amountToDeduct = deduction.selected ? deduction.amount : 0;
              const remaining = Math.max(0, Number((product.quantity - amountToDeduct).toFixed(3)));

              return (
                <div
                  key={product.id}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`${inputId}-selected`}
                      checked={deduction.selected}
                      onCheckedChange={(checked) =>
                        updateDeduction(product.id, { selected: checked === true })
                      }
                      aria-label={t("deductProduct", { name: product.name })}
                      className="mt-1"
                    />
                    <div className="min-w-0">
                      <Label htmlFor={`${inputId}-selected`} className="block break-words text-base font-bold">
                        {product.name}
                      </Label>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {t("recipeAmount", { amount: deduction.ingredientAmount })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2.5 sm:block">
                      <p className="text-xs font-semibold text-muted-foreground">{t("inStock")}</p>
                      <p className="text-base font-bold tabular-nums sm:mt-1.5 sm:flex sm:h-11 sm:items-center">{product.quantity.toLocaleString(locale)} {localizeUnit(product.unit, product.quantity, locale)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 sm:block">
                      <Label htmlFor={inputId} className="text-xs font-semibold text-muted-foreground">
                        {t("deduct")}
                      </Label>
                      <div className="flex min-w-0 items-center gap-1.5 sm:mt-1.5">
                        <Input
                          id={inputId}
                          type="number"
                          min="0"
                          max={product.quantity}
                          step="any"
                          value={amountToDeduct}
                          disabled={!deduction.selected}
                          aria-label={t("productAmount", { name: product.name })}
                          onChange={(event) =>
                            updateDeduction(product.id, {
                              amount: Math.min(
                                product.quantity,
                                Math.max(0, Number(event.target.value) || 0),
                              ),
                            })
                          }
                          className="h-11 min-w-16 flex-1 text-base font-bold tabular-nums md:text-base"
                        />
                        <span className="shrink-0 text-base font-bold text-muted-foreground">{localizeUnit(product.unit, 1, locale)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2.5 sm:block">
                      <p className="text-xs font-semibold text-foreground">{t("remaining")}</p>
                      <p className="text-base font-bold tabular-nums text-foreground sm:mt-1.5 sm:flex sm:h-11 sm:items-center" aria-live="polite">{remaining.toLocaleString(locale)} {localizeUnit(product.unit, remaining, locale)}</p>
                    </div>
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
            disabled={isPending}
            onClick={() => setOpen(false)}
          >
            {t("cancel")}
          </Button>
          <Button type="button" className="h-11" disabled={isPending} aria-busy={isPending} onClick={() => complete(deductions)}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
