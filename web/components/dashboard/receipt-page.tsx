"use client";

import { useEffect, useRef, useState } from "react";
import { addDays, format } from "date-fns";
import Link from "next/link";
import {
  CheckIcon,
  ChevronDownIcon,
  FileImageIcon,
  LoaderCircleIcon,
  PackagePlusIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/dashboard/page-header";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import {
  productCategories,
  productCategoryAppearance,
  productCategoryMessageKeys,
  type ProductCategory,
} from "@/components/dashboard/product-category-options";
import { ProductUnitSelect } from "@/components/dashboard/product-unit-select";
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
import {
  MAX_RECEIPT_IMAGE_MB,
  validateReceiptImage,
} from "@/lib/receipt-image";

type Step = "choose" | "analyzing" | "review" | "success";
type Method = "receipt" | "manual";
const analysisStages = ["reading", "recognizing", "categorizing"] as const;
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

function defaultUseBy() {
  return format(addDays(new Date(), 7), "yyyy-MM-dd");
}

function getSampleItems(
  t: ReturnType<typeof useTranslations<"Receipt">>,
): ReceiptItem[] {
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("choose");
  const [method, setMethod] = useState<Method>("receipt");
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [analysisStage, setAnalysisStage] = useState(0);
  const { refreshInventory } = useDashboardData();

  useEffect(() => {
    if (step !== "analyzing") return;
    const timer = window.setTimeout(() => {
      if (analysisStage < analysisStages.length - 1) {
        setAnalysisStage((current) => current + 1);
      } else {
        setStep("review");
      }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [analysisStage, step]);

  async function handleReceiptFile(file: File | undefined) {
    if (!file) return;
    setFileError("");
    const error = await validateReceiptImage(file);
    if (error) {
      setFileError(
        error === "fileTooLarge"
          ? t("toasts.fileTooLarge", { maxMb: MAX_RECEIPT_IMAGE_MB })
          : t(`toasts.${error}`),
      );
      return;
    }
    setMethod("receipt");
    setFileName(file.name);
    setItems(getSampleItems(t));
    setAnalysisStage(0);
    setStep("analyzing");
  }

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
          !item.name.trim() ||
          !item.quantity.trim() ||
          !item.unit.trim() ||
          !item.estimatedUseBy,
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
      await saveManualReceipt(
        items.map((item) => ({
          name: item.name.trim(),
          quantity: Number(item.quantity.replace(",", ".")),
          unit: item.unit.trim(),
          storageLocation: item.storageLocation,
          category: item.category,
          estimatedUseBy: item.estimatedUseBy,
          price: item.price,
        })),
      );
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
              setItems([]);
              setFileName("");
              setStep("choose");
            }}
          >
            {t("success.another")}
          </Button>
        </div>
      </section>
    );
  }

  if (step === "analyzing") {
    const progress = [30, 65, 95][analysisStage];
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow={t("manual.eyebrow")}
          title={t("analysis.title")}
          description={t("analysis.description")}
        />
        <section
          className="app-card overflow-hidden p-6 sm:p-10"
          aria-label={t("analysis.title")}
        >
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <span className="relative flex size-24 items-center justify-center rounded-full bg-secondary text-primary">
              <span
                className="absolute inset-2 rounded-full border-2 border-primary/20 border-t-primary motion-safe:animate-spin"
                aria-hidden="true"
              />
              <FileImageIcon className="size-9" aria-hidden="true" />
            </span>
            <p className="mt-6 w-full truncate text-sm font-semibold text-foreground">
              {fileName}
            </p>
            <div
              className="mt-6 h-2 w-full overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-label={t("analysis.progress")}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-700 motion-reduce:transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
            <ol className="mt-7 w-full space-y-3 text-left">
              {analysisStages.map((stage, index) => (
                <li key={stage} className="flex items-center gap-3 text-sm">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    {index < analysisStage ? (
                      <CheckIcon className="size-4" aria-hidden="true" />
                    ) : null}
                    {index === analysisStage ? (
                      <LoaderCircleIcon
                        className="size-4 motion-safe:animate-spin"
                        aria-hidden="true"
                      />
                    ) : null}
                    {index > analysisStage ? index + 1 : null}
                  </span>
                  <span
                    className={
                      index === analysisStage
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {t(`analysis.stages.${stage}`)}
                  </span>
                </li>
              ))}
            </ol>
            <Button
              variant="ghost"
              className="mt-7 h-11"
              onClick={() => setStep("choose")}
            >
              {t("analysis.cancel")}
            </Button>
          </div>
        </section>
      </div>
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
              onClick={() => setStep("choose")}
            >
              {t("review.back")}
            </Button>
          }
        />

        {method === "receipt" ? (
          <p className="mb-5 rounded-lg border border-primary/20 bg-secondary/60 px-4 py-3 text-sm text-foreground">
            {t("review.demoNotice")}
          </p>
        ) : null}

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
                <ProductUnitSelect
                  id={`receipt-unit-${item.id}`}
                  value={item.unit}
                  onValueChange={(unit) => updateItem(item.id, { unit })}
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
                          <StorageLocationIcon
                            location={item.storageLocation}
                          />
                          <span className="truncate">
                            {inventoryT(
                              `locations.${storageLocationMessageKeys[item.storageLocation]}`,
                            )}
                          </span>
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
                        <span className="flex-1">
                          {inventoryT(
                            `locations.${storageLocationMessageKeys[location]}`,
                          )}
                        </span>
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
                aria-label={t("remove", {
                  name: item.name || t("fields.productFallback"),
                })}
              >
                <Trash2Icon aria-hidden="true" />
              </Button>
              <div className="grid gap-3 sm:grid-cols-2 lg:col-span-6">
                <div className="grid gap-2">
                  <Label htmlFor={`receipt-category-${item.id}`}>
                    {inventoryT("editDialog.category")}
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      id={`receipt-category-${item.id}`}
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 w-full justify-between px-3 font-normal"
                        >
                          <span>
                            {productCategoryAppearance[item.category].emoji}{" "}
                            {inventoryT(
                              `categories.${productCategoryMessageKeys[item.category]}`,
                            )}
                          </span>
                          <ChevronDownIcon aria-hidden="true" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent
                      align="start"
                      className="min-w-(--anchor-width)"
                    >
                      {productCategories.map((category) => (
                        <DropdownMenuItem
                          key={category}
                          onClick={() => updateItem(item.id, { category })}
                        >
                          {productCategoryAppearance[category].emoji}{" "}
                          {inventoryT(
                            `categories.${productCategoryMessageKeys[category]}`,
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`receipt-date-${item.id}`}>
                    {inventoryT("editDialog.date")}
                  </Label>
                  <DatePicker
                    id={`receipt-date-${item.id}`}
                    value={item.estimatedUseBy}
                    onValueChange={(estimatedUseBy) =>
                      updateItem(item.id, { estimatedUseBy })
                    }
                  />
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
            <p className="font-extrabold">
              {t("productCount", { count: items.length })}
            </p>
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
        <div
          className="subtle-grid flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-input bg-muted/30 px-5 py-8 text-center"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void handleReceiptFile(event.dataTransfer.files[0]);
          }}
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-card text-primary shadow-sm">
            <FileImageIcon className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-extrabold">
            {t("upload.fileTitle")}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {t("upload.description")}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            className="hidden"
            aria-label={t("upload.selectFile")}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              void handleReceiptFile(file);
            }}
          />
          <Button
            type="button"
            className="mt-5 h-11"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon aria-hidden="true" /> {t("upload.selectFile")}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            {t("upload.formats", { maxMb: MAX_RECEIPT_IMAGE_MB })}
          </p>
        </div>
        {fileError ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {fileError}
          </p>
        ) : null}
        <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
          {t("upload.notice")}
        </p>
      </section>
      <Button
        variant="outline"
        className="mt-4 h-11 w-full"
        onClick={() => {
          setMethod("manual");
          setItems([
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
          setStep("review");
        }}
      >
        <PackagePlusIcon aria-hidden="true" /> {t("manual.start")}
      </Button>
    </div>
  );
}
