"use client";

import { useRef, useState, useTransition } from "react";
import { addDays, format } from "date-fns";
import Link from "next/link";
import {
  CheckIcon,
  ChevronDownIcon,
  FileImageIcon,
  InfoIcon,
  PackagePlusIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/dashboard/page-header";
import { BrandIcon } from "@/components/brand-icon";
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
import { WordRotate } from "@/components/ui/word-rotate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StorageLocation } from "@/lib/demo-data";
import { validateReceiptImage } from "@/lib/receipt-image";

type Step = "choose" | "analyzing" | "review" | "success";
type Method = "receipt" | "manual";
const MAX_SCAN_MB = 4;
const RECEIPT_STAGE_DURATION_MS = 2000;
type ReceiptItem = {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  storageLocation: StorageLocation;
  category: ProductCategory;
  estimatedUseBy: string;
};

function defaultUseBy() {
  return format(addDays(new Date(), 7), "yyyy-MM-dd");
}

function validQuantity(value: string) {
  const quantity = Number(value.replace(",", "."));
  return Number.isFinite(quantity) && quantity > 0;
}

const locations: StorageLocation[] = ["Lodówka", "Zamrażarka", "Spiżarnia"];
const receiptCardClassName = "app-card flex min-h-[30rem] flex-col p-5 sm:p-7";

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
  const [validationAttempted, setValidationAttempted] = useState(false);
  const requestId = useRef(0);
  const scanAbort = useRef<AbortController | null>(null);
  const [isPending, startTransition] = useTransition();
  const { refreshInventory, householdId, dateFormat } = useDashboardData();

  async function handleReceiptFile(file: File | undefined) {
    if (!file) return;
    setFileError("");
    const error = file.size > MAX_SCAN_MB * 1024 * 1024 ? "fileTooLarge" : await validateReceiptImage(file);
    if (error || !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      setFileError(
        error === "fileTooLarge"
          ? t("toasts.fileTooLarge", { maxMb: MAX_SCAN_MB })
          : t(`toasts.${error ?? "invalidFile"}`),
      );
      return;
    }
    setMethod("receipt");
    setValidationAttempted(false);
    setFileName(file.name);
    setStep("analyzing");
    const currentRequest = ++requestId.current;
    const controller = new AbortController();
    scanAbort.current = controller;
    const startedAt = Date.now();
    try {
      const form = new FormData();
      form.set("image", file);
      const response = await fetch("/api/receipts/analyze", { method: "POST", body: form, signal: controller.signal });
      const result = await response.json() as { error?: string; items?: Array<Omit<ReceiptItem, "id" | "estimatedUseBy" | "quantity"> & { quantity: number; estimatedDays: number }> };
      if (currentRequest !== requestId.current) return;
      if (!response.ok || !result.items?.length) {
        const knownErrors = ["emptyFile", "fileTooLarge", "invalidFile", "noProducts", "unavailable"];
        const reason = knownErrors.find((error) => error === result.error) ?? "analysisFailed";
        setFileError(reason === "fileTooLarge" ? t("toasts.fileTooLarge", { maxMb: MAX_SCAN_MB }) : t(`toasts.${reason}`));
        setStep("choose");
        return;
      }
      await new Promise<void>((resolve) => window.setTimeout(resolve, Math.max(0, RECEIPT_STAGE_DURATION_MS * 2 + 800 - (Date.now() - startedAt))));
      if (currentRequest !== requestId.current) return;
      setItems(result.items.map(({ estimatedDays, ...item }) => ({
        ...item,
        id: crypto.randomUUID(),
        quantity: String(item.quantity),
        estimatedUseBy: format(addDays(new Date(), estimatedDays), "yyyy-MM-dd"),
      })));
      setStep("review");
    } catch {
      if (currentRequest !== requestId.current) return;
      setFileError(t("toasts.analysisFailed"));
      setStep("choose");
    } finally {
      if (currentRequest === requestId.current) scanAbort.current = null;
    }
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
        category: "Inne",
        estimatedUseBy: defaultUseBy(),
      },
    ]);
  }

  function confirmItems() {
    if (isPending) return;
    const firstInvalid = items.flatMap((item) => [
      !item.name.trim() && `receipt-name-${item.id}`,
      !validQuantity(item.quantity) && `receipt-quantity-${item.id}`,
      !item.unit.trim() && `receipt-unit-${item.id}`,
      !item.estimatedUseBy && `receipt-date-${item.id}`,
    ]).find(Boolean);
    if (firstInvalid) {
      setValidationAttempted(true);
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    startTransition(async () => {
      try {
        await saveManualReceipt(
          items.map((item) => ({
            name: item.name.trim(),
            quantity: Number(item.quantity.replace(",", ".")),
            unit: item.unit.trim(),
            storageLocation: item.storageLocation,
            category: item.category,
            estimatedUseBy: item.estimatedUseBy,
          })),
          householdId,
        );
        await refreshInventory();
        setStep("success");
      } catch {
        toast.error(common("saveFailed"));
      }
    });
  }

  if (step === "success") {
    return (
      <div className="flex min-h-[calc(100dvh-13rem)] items-center justify-center py-8 lg:min-h-[calc(100dvh-5.25rem)]">
        <section className="app-card w-full max-w-xl px-6 py-10 text-center sm:p-12">
          <div className="mx-auto flex max-w-md flex-col items-center">
            <BrandIcon name="success" className="size-24" />
            <h1 className="mt-8 text-3xl font-extrabold tracking-tight sm:text-4xl">{t("success.title")}</h1>
            <p className="mt-3 text-base leading-6 text-muted-foreground" role="status">{t("success.description", { count: items.length })}</p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
              <Button nativeButton={false} render={<Link href="/dashboard/zapasy" />} className="h-11 sm:flex-1">{t("success.inventory")}</Button>
              <Button
                variant="outline"
                className="h-11 sm:flex-1"
                onClick={() => {
                  setItems([]);
                  setFileName("");
                  setStep("choose");
                }}
              >
                {t("success.another")}
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (step === "analyzing") {
    const analysisStages = [t("analysis.reading"), t("analysis.categorizing"), t("analysis.preparing")];
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow={t("manual.eyebrow")}
          title={t("analysis.title")}
          description={t("analysis.description")}
        />
        <section className={receiptCardClassName} aria-label={t("analysis.title")}>
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
            <span className="relative flex size-24 items-center justify-center rounded-full bg-secondary text-primary">
              <span className="absolute inset-2 rounded-full border-2 border-primary/20 border-t-primary motion-safe:animate-spin" aria-hidden="true" />
              <FileImageIcon className="size-9" aria-hidden="true" />
            </span>
            <p className="mt-6 w-full truncate text-sm font-semibold text-foreground" title={fileName}>{fileName}</p>
            <div className="mt-4 flex min-h-16 w-full items-center justify-center">
              <WordRotate words={analysisStages} duration={RECEIPT_STAGE_DURATION_MS} loop={false} className="text-sm text-muted-foreground" motionProps={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -16 }, transition: { duration: 0.3, ease: "easeOut" } }} />
            </div>
            <Button
              variant="outline"
              className="mt-4 h-11"
              onClick={() => { requestId.current++; scanAbort.current?.abort(); setStep("choose"); }}
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
          <details className="group mb-5 overflow-hidden rounded-xl border border-primary/25 bg-secondary/40">
            <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/70 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
              <InfoIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{t("review.scanInfoTitle")}</span>
                <span className="block text-xs text-muted-foreground">{t("review.scanNotice")}</span>
              </span>
              <ChevronDownIcon className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="space-y-2 border-t border-primary/15 px-4 py-4 text-sm leading-6 text-muted-foreground">
              <p>{t("review.scanInfoRead")}</p>
              <p>{t("review.scanInfoDate")}</p>
            </div>
          </details>
        ) : null}

        <section className="app-card overflow-hidden">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 border-b border-border p-4 last:border-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_44px] lg:px-5"
            >
              <div className="flex items-end gap-2">
                <div className="grid min-w-0 flex-1 gap-2">
                  <Label htmlFor={`receipt-name-${item.id}`} className={validationAttempted && !item.name.trim() ? "text-destructive" : undefined}>{t("fields.product")}</Label>
                  <Input
                    id={`receipt-name-${item.id}`}
                    required
                    value={item.name}
                    onChange={(event) => updateItem(item.id, { name: event.target.value })}
                    placeholder={t("fields.productPlaceholder")}
                    className="h-11"
                    aria-invalid={validationAttempted && !item.name.trim()}
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon-lg"
                  className="size-11 shrink-0 lg:hidden"
                  onClick={() => setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))}
                  aria-label={t("remove", { name: item.name || t("fields.productFallback") })}
                >
                  <Trash2Icon aria-hidden="true" />
                </Button>
              </div>
              <div className="flex items-end gap-2">
                <div className="grid min-w-0 flex-1 gap-2">
                  <Label htmlFor={`receipt-quantity-${item.id}`} className={validationAttempted && !validQuantity(item.quantity) ? "text-destructive" : undefined}>{t("fields.quantity")}</Label>
                  <Input
                    id={`receipt-quantity-${item.id}`}
                    required
                    value={item.quantity}
                    onChange={(event) => updateItem(item.id, { quantity: event.target.value })}
                    inputMode="decimal"
                    className="h-11"
                    aria-invalid={validationAttempted && !validQuantity(item.quantity)}
                  />
                </div>
                <Label htmlFor={`receipt-unit-${item.id}`} className="sr-only">{t("fields.unit")}</Label>
                <ProductUnitSelect
                  id={`receipt-unit-${item.id}`}
                  value={item.unit}
                  onValueChange={(unit) => updateItem(item.id, { unit })}
                  compact
                  invalid={validationAttempted && !item.unit.trim()}
                />
              </div>
              <Button
                variant="destructive"
                size="icon-lg"
                className="hidden size-11 self-end lg:flex"
                onClick={() => setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))}
                aria-label={t("remove", { name: item.name || t("fields.productFallback") })}
              >
                <Trash2Icon aria-hidden="true" />
              </Button>
              <div className="grid gap-3 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
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
                  <Label htmlFor={`receipt-date-${item.id}`} className={validationAttempted && !item.estimatedUseBy ? "text-destructive" : undefined}>
                    {method === "receipt" ? t("review.estimatedDate") : inventoryT("editDialog.date")}
                  </Label>
                  <DatePicker
                    id={`receipt-date-${item.id}`}
                    value={item.estimatedUseBy}
                    dateFormat={dateFormat}
                    invalid={validationAttempted && !item.estimatedUseBy}
                    onValueChange={(estimatedUseBy) =>
                      updateItem(item.id, { estimatedUseBy })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`receipt-location-${item.id}`}>{t("fields.location")}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      id={`receipt-location-${item.id}`}
                      render={
                        <Button type="button" variant="outline" className="h-11 w-full justify-between px-3 font-normal">
                          <span className="flex min-w-0 items-center gap-2">
                            <StorageLocationIcon location={item.storageLocation} />
                            <span className="truncate">{inventoryT(`locations.${storageLocationMessageKeys[item.storageLocation]}`)}</span>
                          </span>
                          <ChevronDownIcon className="text-muted-foreground" aria-hidden="true" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="start" className="min-w-(--anchor-width)">
                      {locations.map((location) => (
                        <DropdownMenuItem key={location} onClick={() => updateItem(item.id, { storageLocation: location })}>
                          <StorageLocationIcon location={location} />
                          <span className="flex-1">{inventoryT(`locations.${storageLocationMessageKeys[location]}`)}</span>
                          {item.storageLocation === location ? <CheckIcon aria-hidden="true" /> : null}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            disabled={!items.length || isPending}
            aria-busy={isPending}
            onClick={confirmItems}
          >
            <CheckIcon aria-hidden="true" /> {isPending ? common("adding") : t("review.confirm")}
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
      <section className={receiptCardClassName}>
        <div
          className="subtle-grid flex min-h-72 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-input bg-muted/30 px-5 py-8 text-center"
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
            accept="image/jpeg,image/png,image/webp"
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
            {t("upload.formats", { maxMb: MAX_SCAN_MB })}
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
          setValidationAttempted(false);
          setItems([
            {
              id: crypto.randomUUID(),
              name: "",
              quantity: "1",
              unit: "szt.",
              storageLocation: "Lodówka",
              category: "Inne",
              estimatedUseBy: defaultUseBy(),
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
