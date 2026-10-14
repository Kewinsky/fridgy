"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  CheckIcon,
  ChevronDownIcon,
  FileImageIcon,
  PlusIcon,
  ReceiptTextIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/dashboard/page-header";
import { StorageLocationIcon } from "@/components/dashboard/storage-location-icon";
import { storageLocationMessageKeys } from "@/components/dashboard/storage-location-icon";
import { Button } from "@/components/ui/button";
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
  price: string;
};

function getSampleItems(t: ReturnType<typeof useTranslations<"Receipt">>): ReceiptItem[] {
  return [
  {
    id: "r1",
    name: t("demo.milk"),
    quantity: "1",
    unit: "l",
    storageLocation: "Lodówka",
    price: "3,49",
  },
  {
    id: "r2",
    name: t("demo.tomatoes"),
    quantity: "0,62",
    unit: "kg",
    storageLocation: "Lodówka",
    price: "8,67",
  },
  {
    id: "r3",
    name: t("demo.chicken"),
    quantity: "0,54",
    unit: "kg",
    storageLocation: "Lodówka",
    price: "13,49",
  },
  ];
}
const allowedFileTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/heic",
  "application/pdf",
]);
const maxFileSize = 20 * 1024 * 1024;
const locations: StorageLocation[] = ["Lodówka", "Zamrażarka", "Spiżarnia"];

export function ReceiptPage() {
  const t = useTranslations("Receipt");
  const inventoryT = useTranslations("Inventory");
  const sampleItems = getSampleItems(t);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [items, setItems] = useState<ReceiptItem[]>(sampleItems);

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
        price: "",
      },
    ]);
  }

  function confirmItems() {
    if (
      !items.length ||
      items.some(
        (item) =>
          !item.name.trim() || !item.quantity.trim() || !item.unit.trim(),
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
    setStep("success");
  }

  function selectFile(file: File | undefined) {
    if (!file) return;
    if (!allowedFileTypes.has(file.type)) {
      toast.error(t("toasts.invalidFile"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > maxFileSize) {
      toast.error(t("toasts.fileTooLarge"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFileName(file.name);
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
              setFileName("");
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
        eyebrow={t("upload.eyebrow")}
        title={t("upload.title")}
        description={t("upload.description")}
      />
      <section className="app-card p-5 sm:p-7">
        <div className="subtle-grid flex min-h-72 flex-col items-center justify-center rounded-xl border-2 border-dashed border-input bg-muted/30 px-5 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-card text-primary shadow-sm">
            <UploadIcon className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-extrabold">{t("upload.fileTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("upload.formats")}
          </p>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/heic,application/pdf"
            className="sr-only"
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
          <Button
            className="mt-5 h-11"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileImageIcon aria-hidden="true" /> {t("upload.selectFile")}
          </Button>
          {fileName ? (
            <p className="mt-3 text-sm font-semibold text-primary">
              {t("upload.selected", { fileName })}
            </p>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button
            className="h-11"
            disabled={!fileName}
            onClick={() => setStep("review")}
          >
            <ReceiptTextIcon aria-hidden="true" /> {t("upload.review")}
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
          {t("upload.notice")}
        </p>
      </section>
    </div>
  );
}
