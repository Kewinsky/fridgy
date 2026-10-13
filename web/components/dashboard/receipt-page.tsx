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

import { PageHeader } from "@/components/dashboard/page-header";
import { StorageLocationIcon } from "@/components/dashboard/storage-location-icon";
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

const sampleItems: ReceiptItem[] = [
  {
    id: "r1",
    name: "Mleko 2%",
    quantity: "1",
    unit: "l",
    storageLocation: "Lodówka",
    price: "3,49",
  },
  {
    id: "r2",
    name: "Pomidory malinowe",
    quantity: "0,62",
    unit: "kg",
    storageLocation: "Lodówka",
    price: "8,67",
  },
  {
    id: "r3",
    name: "Pierś z kurczaka",
    quantity: "0,54",
    unit: "kg",
    storageLocation: "Lodówka",
    price: "13,49",
  },
];
const allowedFileTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/heic",
  "application/pdf",
]);
const maxFileSize = 20 * 1024 * 1024;
const locations: StorageLocation[] = ["Lodówka", "Zamrażarka", "Spiżarnia"];

export function ReceiptPage() {
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
      toast.error("Uzupełnij nazwę, ilość i jednostkę każdego produktu.");
      return;
    }
    if (
      items.some(
        (item) =>
          !Number.isFinite(Number(item.quantity.replace(",", "."))) ||
          Number(item.quantity.replace(",", ".")) <= 0,
      )
    ) {
      toast.error("Każda ilość musi być liczbą większą od zera.");
      return;
    }
    setStep("success");
  }

  function selectFile(file: File | undefined) {
    if (!file) return;
    if (!allowedFileTypes.has(file.type)) {
      toast.error("Wybierz plik JPG, PNG, HEIC lub PDF.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > maxFileSize) {
      toast.error("Plik może mieć maksymalnie 20 MB.");
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
        <h1 className="mt-6 text-3xl font-extrabold">Paragon jest gotowy</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Zweryfikowano {items.length} produktów. Zapis do wspólnych zapasów
          zostanie podłączony razem ze schematem Supabase.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/dashboard/zapasy" />}
            className="h-11"
          >
            Zobacz zapasy
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
            Dodaj kolejny paragon
          </Button>
        </div>
      </section>
    );
  }

  if (step === "review") {
    return (
      <>
        <PageHeader
          eyebrow="Krok 2 z 2"
          title="Sprawdź produkty"
          description="OCR nie jest jeszcze podłączony – poniżej widzisz dane demonstracyjne, które możesz poprawić."
          actions={
            <Button
              variant="outline"
              className="h-11"
              onClick={() => setStep("upload")}
            >
              Wróć do pliku
            </Button>
          }
        />

        <section className="app-card overflow-hidden">
          <div className="hidden grid-cols-[1fr_92px_92px_150px_92px_44px] gap-3 border-b border-border bg-muted/50 px-5 py-3 text-xs font-bold text-muted-foreground lg:grid">
            <span>Produkt</span>
            <span>Ilość</span>
            <span>Jednostka</span>
            <span>Miejsce</span>
            <span>Cena</span>
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
                  Produkt
                </Label>
                <Input
                  id={`receipt-name-${item.id}`}
                  value={item.name}
                  onChange={(event) =>
                    updateItem(item.id, { name: event.target.value })
                  }
                  placeholder="Nazwa produktu"
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor={`receipt-quantity-${item.id}`}
                  className="lg:sr-only"
                >
                  Ilość
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
                  Jednostka
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
                  Miejsce
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
                          <span className="truncate">{item.storageLocation}</span>
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
                        <span className="flex-1">{location}</span>
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
                  Cena
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
                aria-label={`Usuń ${item.name || "produkt"}`}
              >
                <Trash2Icon aria-hidden="true" />
              </Button>
            </div>
          ))}
          <div className="p-4">
            <Button variant="ghost" className="h-11" onClick={addItem}>
              <PlusIcon aria-hidden="true" /> Dodaj produkt
            </Button>
          </div>
        </section>

        <div className="sticky bottom-20 mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur lg:bottom-4">
          <div>
            <p className="font-extrabold">{items.length} produktów</p>
            <p className="text-xs text-muted-foreground">
              Sprawdź dane przed zatwierdzeniem.
            </p>
          </div>
          <Button
            className="h-11"
            disabled={!items.length}
            onClick={confirmItems}
          >
            <CheckIcon aria-hidden="true" /> Zatwierdź produkty
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Krok 1 z 2"
        title="Dodaj paragon"
        description="Wybierz zdjęcie lub PDF paragonu, aby przygotować produkty do sprawdzenia."
      />
      <section className="app-card p-5 sm:p-7">
        <div className="subtle-grid flex min-h-72 flex-col items-center justify-center rounded-xl border-2 border-dashed border-input bg-muted/30 px-5 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-card text-primary shadow-sm">
            <UploadIcon className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-extrabold">Wybierz plik paragonu</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            JPG, PNG, HEIC lub PDF · maks. 20 MB
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
            <FileImageIcon aria-hidden="true" /> Wybierz zdjęcie lub PDF
          </Button>
          {fileName ? (
            <p className="mt-3 text-sm font-semibold text-primary">
              Wybrano: {fileName}
            </p>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button
            className="h-11"
            disabled={!fileName}
            onClick={() => setStep("review")}
          >
            <ReceiptTextIcon aria-hidden="true" /> Przejdź do weryfikacji
          </Button>
          <Button
            variant="outline"
            className="h-11"
            onClick={() => {
              setItems(sampleItems);
              setStep("review");
            }}
          >
            Użyj przykładowego paragonu
          </Button>
        </div>
        <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
          Na tym etapie plik nie jest wysyłany ani analizowany. Integrację OCR
          dodamy osobno.
        </p>
      </section>
    </div>
  );
}
