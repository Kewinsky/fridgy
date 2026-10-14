"use client";

import { useState } from "react";
import { addDays, format } from "date-fns";
import Link from "next/link";
import {
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
  ReceiptTextIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/dashboard/page-header";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { productCategories, productCategoryAppearance, productCategoryMessageKeys, type ProductCategory } from "@/components/dashboard/product-category-options";
import { saveManualReceipt } from "@/app/dashboard/data-actions";
import { StorageLocationIcon } from "@/components/dashboard/storage-location-icon";
import { storageLocationMessageKeys } from "@/components/dashboard/storage-location-icon";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StorageLocation } from "@/lib/demo-data";

type Step = "upload" | "review" | "success";
type ReceiptItem = {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  storageLocation: StorageLocation;
  category: ProductCategory;
  estimatedUseBy: string;
  price: string;
};

function defaultUseBy() { return format(addDays(new Date(), 7), "yyyy-MM-dd"); }

function getSampleItems(t: ReturnType<typeof useTranslations<"Receipt">>): ReceiptItem[] {
  return [
  {
    id: "r1",
    name: t("demo.milk"),
    quantity: "1",
    unit: "l",
    storageLocation: "Lodówka",
    category: "Nabiał",
    estimatedUseBy: defaultUseBy(),
    price: "3,49",
  },
  {
    id: "r2",
    name: t("demo.tomatoes"),
    quantity: "0,62",
    unit: "kg",
    storageLocation: "Lodówka",
    category: "Warzywa",
    estimatedUseBy: defaultUseBy(),
    price: "8,67",
  },
  {
    id: "r3",
    name: t("demo.chicken"),
    quantity: "0,54",
    unit: "kg",
    storageLocation: "Lodówka",
    category: "Mięso",
    estimatedUseBy: defaultUseBy(),
    price: "13,49",
  },
  ];
}
const locations: StorageLocation[] = ["Lodówka", "Zamrażarka", "Spiżarnia"];

export function ReceiptPage() {
  const t = useTranslations("Receipt");
  const common = useTranslations("Common");
  const inventoryT = useTranslations("Inventory");
  const sampleItems = getSampleItems(t);
  const [step, setStep] = useState<Step>("upload");
  const [items, setItems] = useState<ReceiptItem[]>(sampleItems);
  const { refreshInventory } = useDashboardData();

  function updateItem(id: string, patch: Partial<ReceiptItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "",
        quantity: "1",
        unit: "szt.",
        storageLocation: "Lodówka",
        category: "Przetwory",
        estimatedUseBy: defaultUseBy(),
        price: "",
      },
    ]);
  }

  async function confirmItems() {
    if (
      !items.length ||
      items.some(
        (item) =>
          !item.name.trim() || !item.quantity.trim() || !item.unit.trim() || !item.estimatedUseBy,
      )
    ) {
      toast.error(t("toasts.incomplete"));
      return;
    }
    if (
      items.some(
        (item) =>
          !Number.isFinite(Number(item.quantity.replace(",", "."))) ||
          Number(item.quantity.replace(",", ".")) <= 0,
      )
    ) {
      toast.error(t("toasts.invalidQuantity"));
      return;
    }
    try {
      await saveManualReceipt(items.map((item) => ({
        name: item.name.trim(),
        quantity: Number(item.quantity.replace(",", ".")),
        unit: item.unit.trim(),
        storageLocation: item.storageLocation,
        category: item.category,
        estimatedUseBy: item.estimatedUseBy,
        price: item.price,
      })));
      await refreshInventory();
      setStep("success");
    } catch {
      toast.error(common("saveFailed"));
    }
  }

  if (step === "success") {
    return (
      <section className="app-card mx-auto flex min-h-120 max-w-3xl flex-col items-center justify-center p-8 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-fresh-soft text-fresh">
          <CheckIcon className="size-9" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold">{t("success.title")}</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {t("success.description", { count: items.length })}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/dashboard/zapasy" />}
            className="h-11"
          >
            {t("success.inventory")}
          </Button>
          <Button
            variant="outline"
            className="h-11"
            onClick={() => {
              setItems(sampleItems);
              setStep("upload");
            }}
          >
            {t("success.another")}
          </Button>
        </div>
      </section>
    );
  }

  if (step === "review") {
    return (
      <>
        <PageHeader
          eyebrow={t("review.eyebrow")}
          title={t("review.title")}
          description={t("review.description")}
          actions={
            <Button
              variant="outline"
              className="h-11"
              onClick={() => setStep("upload")}
            >
              {t("review.back")}
            </Button>
          }
        />

        <section className="app-card overflow-hidden">
          <div className="hidden grid-cols-[1fr_92px_92px_150px_92px_44px] gap-3 border-b border-border bg-muted/50 px-5 py-3 text-xs font-bold text-muted-foreground lg:grid">
            <span>{t("fields.product")}</span>
            <span>{t("fields.quantity")}</span>
            <span>{t("fields.unit")}</span>
            <span>{t("fields.location")}</span>
            <span>{t("fields.price")}</span>
            <span />
          </div>
          {items.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 border-b border-border p-4 last:border-0 lg:grid-cols-[1fr_92px_92px_150px_92px_44px] lg:items-end lg:px-5"
            >
              <div className="grid gap-2">
                <Label
                  htmlFor={`receipt-name-${item.id}`}
                  className="lg:sr-only"
                >
                  {t("fields.product")}
                </Label>
                <Input
                  id={`receipt-name-${item.id}`}
                  value={item.name}
                  onChange={(event) =>
                    updateItem(item.id, { name: event.target.value })
                  }
                  placeholder={t("fields.productPlaceholder")}
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor={`receipt-quantity-${item.id}`}
                  className="lg:sr-only"
                >
                  {t("fields.quantity")}
                </Label>
                <Input
                  id={`receipt-quantity-${item.id}`}
                  value={item.quantity}
                  onChange={(event) =>
                    updateItem(item.id, { quantity: event.target.value })
                  }
                  inputMode="decimal"
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor={`receipt-unit-${item.id}`}
                  className="lg:sr-only"
                >
                  {t("fields.unit")}
                </Label>
                <Input
                  id={`receipt-unit-${item.id}`}
                  value={item.unit}
                  onChange={(event) =>
                    updateItem(item.id, { unit: event.target.value })
                  }
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor={`receipt-location-${item.id}`}
                  className="lg:sr-only"
                >
                  {t("fields.location")}
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    id={`receipt-location-${item.id}`}
                    className="h-11! min-h-11 w-full"
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11! min-h-11 w-full justify-between px-3 font-normal"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <StorageLocationIcon location={item.storageLocation} />
                          <span className="truncate">{inventoryT(`locations.${storageLocationMessageKeys[item.storageLocation]}`)}</span>
                        </span>
                        <ChevronDownIcon
                          className="text-muted-foreground"
                          aria-hidden="true"
                        />
                      </Button>
                    }
                  />
                  <DropdownMenuContent
                    align="start"
                    className="min-w-(--anchor-width)"
                  >
                    {locations.map((location) => (
                      <DropdownMenuItem
                        key={location}
                        onClick={() =>
                          updateItem(item.id, { storageLocation: location })
                        }
                      >
                        <StorageLocationIcon location={location} />
                        <span className="flex-1">{inventoryT(`locations.${storageLocationMessageKeys[location]}`)}</span>
                        {item.storageLocation === location ? (
                          <CheckIcon aria-hidden="true" />
                        ) : null}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor={`receipt-price-${item.id}`}
                  className="lg:sr-only"
                >
                  {t("fields.price")}
                </Label>
                <Input
                  id={`receipt-price-${item.id}`}
                  value={item.price}
                  onChange={(event) =>
                    updateItem(item.id, { price: event.target.value })
                  }
                  inputMode="decimal"
                  placeholder="0,00"
                  className="h-11"
                />
              </div>
              <Button
                variant="destructive"
                size="icon-lg"
                className="size-11"
                onClick={() =>
                  setItems((current) =>
                    current.filter((currentItem) => currentItem.id !== item.id),
                  )
                }
                aria-label={t("remove", { name: item.name || t("fields.productFallback") })}
              >
                <Trash2Icon aria-hidden="true" />
              </Button>
              <div className="grid gap-3 sm:grid-cols-2 lg:col-span-6">
                <div className="grid gap-2">
                  <Label htmlFor={`receipt-category-${item.id}`}>{inventoryT("editDialog.category")}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger id={`receipt-category-${item.id}`} render={<Button type="button" variant="outline" className="h-11 w-full justify-between px-3 font-normal">
                      <span>{productCategoryAppearance[item.category].emoji} {inventoryT(`categories.${productCategoryMessageKeys[item.category]}`)}</span>
                      <ChevronDownIcon aria-hidden="true" />
                    </Button>} />
                    <DropdownMenuContent align="start" className="min-w-(--anchor-width)">
                      {productCategories.map((category) => <DropdownMenuItem key={category} onClick={() => updateItem(item.id, { category })}>
                        {productCategoryAppearance[category].emoji} {inventoryT(`categories.${productCategoryMessageKeys[category]}`)}
                      </DropdownMenuItem>)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`receipt-date-${item.id}`}>{inventoryT("editDialog.date")}</Label>
                  <DatePicker id={`receipt-date-${item.id}`} value={item.estimatedUseBy} onValueChange={(estimatedUseBy) => updateItem(item.id, { estimatedUseBy })} />
                </div>
              </div>
            </div>
          ))}
          <div className="p-4">
            <Button variant="ghost" className="h-11" onClick={addItem}>
              <PlusIcon aria-hidden="true" /> {t("review.addProduct")}
            </Button>
          </div>
        </section>

        <div className="sticky bottom-20 mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur lg:bottom-4">
          <div>
            <p className="font-extrabold">{t("productCount", { count: items.length })}</p>
            <p className="text-xs text-muted-foreground">
              {t("review.checkData")}
            </p>
          </div>
          <Button
            className="h-11"
            disabled={!items.length}
            onClick={confirmItems}
          >
            <CheckIcon aria-hidden="true" /> {t("review.confirm")}
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow={t("manual.eyebrow")}
        title={t("manual.title")}
        description={t("manual.description")}
      />
      <section className="app-card p-5 sm:p-7">
        <div className="subtle-grid flex min-h-52 flex-col items-center justify-center rounded-xl border border-input bg-muted/30 px-5 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-card text-primary shadow-sm">
            <ReceiptTextIcon className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-extrabold">{t("manual.cardTitle")}</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{t("manual.cardDescription")}</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button
            className="h-11"
            onClick={() => {
              setItems([{ id: crypto.randomUUID(), name: "", quantity: "1", unit: "szt.", storageLocation: "Lodówka", category: "Przetwory", estimatedUseBy: defaultUseBy(), price: "" }]);
              setStep("review");
            }}
          >
            <ReceiptTextIcon aria-hidden="true" /> {t("manual.start")}
          </Button>
          <Button
            variant="outline"
            className="h-11"
            onClick={() => {
              setItems(sampleItems);
              setStep("review");
            }}
          >
            {t("upload.useSample")}
          </Button>
        </div>
        <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
          {t("manual.notice")}
        </p>
      </section>
    </div>
  );
}
