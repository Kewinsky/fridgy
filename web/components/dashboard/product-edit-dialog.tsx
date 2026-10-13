"use client";

import { useState, type FormEvent } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import {
  productCategories,
  productCategoryAppearance,
} from "@/components/dashboard/product-category-options";
import { StorageLocationIcon } from "@/components/dashboard/storage-location-icon";
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

export function ProductEditDialog({
  product,
  onClose,
  onSave,
}: {
  product: DemoProduct;
  onClose: () => void;
  onSave: (product: DemoProduct) => void;
}) {
  const [name, setName] = useState(product.name);
  const [quantity, setQuantity] = useState(String(product.quantity));
  const [unit, setUnit] = useState(product.unit);
  const [category, setCategory] = useState(product.category);
  const [location, setLocation] = useState<StorageLocation>(product.storageLocation);
  const [estimatedUseBy, setEstimatedUseBy] = useState(product.estimatedUseBy);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedQuantity = Number(quantity.replace(",", "."));

    if (!name.trim() || !unit.trim() || !category.trim() || !estimatedUseBy) {
      setError("Uzupełnij wszystkie pola.");
      return;
    }

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError("Ilość musi być liczbą większą od zera.");
      return;
    }

    onSave({
      ...product,
      name: name.trim(),
      quantity: parsedQuantity,
      unit: unit.trim(),
      category: category.trim(),
      storageLocation: location,
      estimatedUseBy,
    });
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edytuj produkt</DialogTitle>
          <DialogDescription>Zmień podstawowe informacje zapisane dla tego produktu.</DialogDescription>
        </DialogHeader>

        <form id="edit-product-form" onSubmit={submit} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="product-name">Nazwa</Label>
            <Input id="product-name" value={name} onChange={(event) => setName(event.target.value)} className="h-11" autoFocus />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="product-quantity">Ilość</Label>
              <Input id="product-quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="decimal" className="h-11" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-unit">Jednostka</Label>
              <Input id="product-unit" value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="np. g, szt., l" className="h-11" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-category">Kategoria</Label>
            <DropdownMenu>
              <DropdownMenuTrigger
                id="product-category"
                render={
                  <Button type="button" variant="outline" className="h-11 w-full justify-between px-3 font-normal">
                    <span className="flex min-w-0 items-center gap-2">
                      <span aria-hidden="true">
                        {(productCategoryAppearance[category] ?? productCategoryAppearance.Wszystkie).emoji}
                      </span>
                      <span className="truncate">{category}</span>
                    </span>
                    <ChevronDownIcon className="text-muted-foreground" aria-hidden="true" />
                  </Button>
                }
              />
              <DropdownMenuContent align="start" className="min-w-(--anchor-width)">
                {productCategories.map((item) => (
                  <DropdownMenuItem key={item} onClick={() => setCategory(item)}>
                    <span aria-hidden="true">{productCategoryAppearance[item].emoji}</span>
                    <span className="flex-1">{item}</span>
                    {category === item ? <CheckIcon aria-hidden="true" /> : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-location">Miejsce przechowywania</Label>
            <DropdownMenu>
              <DropdownMenuTrigger
                id="product-location"
                render={
                  <Button type="button" variant="outline" className="h-11 w-full justify-between px-3 font-normal">
                    <span className="flex min-w-0 items-center gap-2">
                      <StorageLocationIcon location={location} />
                      <span className="truncate">{location}</span>
                    </span>
                    <ChevronDownIcon className="text-muted-foreground" aria-hidden="true" />
                  </Button>
                }
              />
              <DropdownMenuContent align="start" className="min-w-(--anchor-width)">
                {locations.map((item) => (
                  <DropdownMenuItem key={item} onClick={() => setLocation(item)}>
                    <StorageLocationIcon location={item} />
                    <span className="flex-1">{item}</span>
                    {location === item ? <CheckIcon aria-hidden="true" /> : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-date">Szacowany termin</Label>
            <DatePicker id="product-date" value={estimatedUseBy} onValueChange={setEstimatedUseBy} />
          </div>

          {error ? <p role="alert" className="text-sm font-medium text-destructive">{error}</p> : null}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" className="h-11" onClick={onClose}>Anuluj</Button>
          <Button type="submit" form="edit-product-form" className="h-11">Zapisz zmiany</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
