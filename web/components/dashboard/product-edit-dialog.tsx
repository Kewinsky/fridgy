"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import {
  productCategories,
  productCategoryAppearance,
  productCategoryMessageKeys,
  type ProductCategory,
} from "@/components/dashboard/product-category-options";
import { ProductUnitSelect } from "@/components/dashboard/product-unit-select";
import {
  StorageLocationIcon,
  storageLocationMessageKeys,
} from "@/components/dashboard/storage-location-icon";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DemoProduct, StorageLocation } from "@/lib/demo-data";

const locations: StorageLocation[] = ["Lodówka", "Zamrażarka", "Spiżarnia"];

function validQuantity(value: string) {
  const quantity = Number(value.replace(",", "."));
  return Number.isFinite(quantity) && quantity > 0;
}

export function ProductEditDialog({
  product,
  onClose,
  onSave,
}: {
  product: DemoProduct;
  onClose: () => void;
  onSave: (product: DemoProduct) => Promise<void>;
}) {
  const t = useTranslations("Inventory.editDialog");
  const common = useTranslations("Common");
  const inventoryT = useTranslations("Inventory");
  const [name, setName] = useState(product.name);
  const [quantity, setQuantity] = useState(String(product.quantity));
  const [unit, setUnit] = useState(product.unit);
  const [category, setCategory] = useState<ProductCategory>(
    product.category as ProductCategory,
  );
  const [location, setLocation] = useState<StorageLocation>(product.storageLocation);
  const [estimatedUseBy, setEstimatedUseBy] = useState(product.estimatedUseBy);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const invalidName = validationAttempted && !name.trim();
  const invalidQuantity = validationAttempted && !validQuantity(quantity);
  const invalidUnit = validationAttempted && !unit.trim();
  const invalidCategory = validationAttempted && !category.trim();
  const invalidDate = validationAttempted && !estimatedUseBy;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedQuantity = Number(quantity.replace(",", "."));

    const firstInvalid = [
      !name.trim() && "product-name",
      !validQuantity(quantity) && "product-quantity",
      !unit.trim() && "product-unit",
      !category.trim() && "product-category",
      !estimatedUseBy && "product-date",
    ].find(Boolean);
    if (firstInvalid) {
      setValidationAttempted(true);
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    startTransition(async () => {
      await onSave({
        ...product,
        name: name.trim(),
        quantity: parsedQuantity,
        unit: unit.trim(),
        category: category.trim(),
        storageLocation: location,
        estimatedUseBy,
      });
    });
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !isPending) onClose(); }}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form id="edit-product-form" onSubmit={submit} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="product-name" className={invalidName ? "text-destructive" : undefined}>{t("name")}</Label>
            <Input id="product-name" value={name} onChange={(event) => setName(event.target.value)} className="h-11" required aria-invalid={invalidName} autoFocus />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="product-quantity" className={invalidQuantity ? "text-destructive" : undefined}>{t("quantity")}</Label>
              <Input id="product-quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="decimal" className="h-11" required aria-invalid={invalidQuantity} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-unit" className={invalidUnit ? "text-destructive" : undefined}>{t("unit")}</Label>
              <ProductUnitSelect id="product-unit" value={unit} onValueChange={setUnit} invalid={invalidUnit} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-category" className={invalidCategory ? "text-destructive" : undefined}>{t("category")}</Label>
            <DropdownMenu>
              <DropdownMenuTrigger
                id="product-category"
                render={
                  <Button type="button" variant="outline" aria-invalid={invalidCategory} className="h-11 w-full justify-between px-3 font-normal aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20">
                    <span className="flex min-w-0 items-center gap-2">
                      <span aria-hidden="true">
                        {(productCategoryAppearance[category] ?? productCategoryAppearance.Wszystkie).emoji}
                      </span>
                      <span className="truncate">{inventoryT(`categories.${productCategoryMessageKeys[category]}`)}</span>
                    </span>
                    <ChevronDownIcon className="text-muted-foreground" aria-hidden="true" />
                  </Button>
                }
              />
              <DropdownMenuContent align="start" className="min-w-(--anchor-width)">
                {productCategories.map((item) => (
                  <DropdownMenuItem key={item} onClick={() => setCategory(item)}>
                    <span aria-hidden="true">{productCategoryAppearance[item].emoji}</span>
                    <span className="flex-1">{inventoryT(`categories.${productCategoryMessageKeys[item]}`)}</span>
                    {category === item ? <CheckIcon aria-hidden="true" /> : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-location">{t("location")}</Label>
            <DropdownMenu>
              <DropdownMenuTrigger
                id="product-location"
                render={
                  <Button type="button" variant="outline" className="h-11 w-full justify-between px-3 font-normal">
                    <span className="flex min-w-0 items-center gap-2">
                      <StorageLocationIcon location={location} />
                      <span className="truncate">{inventoryT(`locations.${storageLocationMessageKeys[location]}`)}</span>
                    </span>
                    <ChevronDownIcon className="text-muted-foreground" aria-hidden="true" />
                  </Button>
                }
              />
              <DropdownMenuContent align="start" className="min-w-(--anchor-width)">
                {locations.map((item) => (
                  <DropdownMenuItem key={item} onClick={() => setLocation(item)}>
                    <StorageLocationIcon location={item} />
                    <span className="flex-1">{inventoryT(`locations.${storageLocationMessageKeys[item]}`)}</span>
                    {location === item ? <CheckIcon aria-hidden="true" /> : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-date" className={invalidDate ? "text-destructive" : undefined}>{t("date")}</Label>
            <DatePicker id="product-date" value={estimatedUseBy} onValueChange={setEstimatedUseBy} invalid={invalidDate} />
          </div>

        </form>

        <DialogFooter>
          <Button type="button" variant="outline" className="h-11" disabled={isPending} onClick={onClose}>{t("cancel")}</Button>
          <Button type="submit" form="edit-product-form" className="h-11" disabled={isPending} aria-busy={isPending}>{isPending ? common("saving") : t("save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
