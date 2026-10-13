"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCheckIcon,
  ChefHatIcon,
  PackageIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { FreshnessLabel } from "@/components/dashboard/freshness-label";
import {
  productCategories,
  productCategoryAppearance,
} from "@/components/dashboard/product-category-options";
import { ProductEditDialog } from "@/components/dashboard/product-edit-dialog";
import { ProductVisual } from "@/components/dashboard/product-visual";
import { StorageLocationIcon } from "@/components/dashboard/storage-location-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  demoProducts,
  getFreshnessStatus,
  type DemoProduct,
  type FreshnessStatus,
  type StorageLocation,
} from "@/lib/demo-data";
import {
  applyInventoryAction,
  type InventoryAction,
} from "@/lib/inventory-actions";
import { cn } from "@/lib/utils";

const locations = ["Wszystkie", "Lodówka", "Zamrażarka", "Spiżarnia"] as const;
const freshnessFilters: Array<{
  value: "all" | FreshnessStatus;
  label: string;
  className: string;
}> = [
  {
    value: "all",
    label: "Wszystkie terminy",
    className: "border-primary/50 bg-secondary text-primary",
  },
  {
    value: "overdue",
    label: "Po terminie",
    className:
      "border-red-300 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200",
  },
  {
    value: "today",
    label: "Dzisiaj",
    className:
      "border-orange-300 bg-orange-100 text-orange-800 dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-200",
  },
  {
    value: "soon",
    label: "Wkrótce",
    className:
      "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
  },
  {
    value: "week",
    label: "Ten tydzień",
    className:
      "border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200",
  },
  {
    value: "calm",
    label: "Na spokojnie",
    className:
      "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
  },
];

export function InventoryPage() {
  const [products, setProducts] = useState(demoProducts);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<"Wszystkie" | StorageLocation>(
    "Wszystkie",
  );
  const [category, setCategory] = useState("Wszystkie");
  const [freshness, setFreshness] = useState<"all" | FreshnessStatus>("all");
  const [editing, setEditing] = useState(false);
  const [productToEdit, setProductToEdit] = useState<DemoProduct | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const activeProducts = products.filter(
    (product) => product.status === "active",
  );
  const categories = ["Wszystkie", ...productCategories];
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pl");
    return products.filter(
      (product) =>
        product.status === "active" &&
        (location === "Wszystkie" || product.storageLocation === location) &&
        (category === "Wszystkie" || product.category === category) &&
        (freshness === "all" ||
          getFreshnessStatus(product.estimatedUseBy) === freshness) &&
        product.name.toLocaleLowerCase("pl").includes(normalizedQuery),
    );
  }, [category, freshness, location, products, query]);
  const allVisibleSelected =
    filtered.length > 0 &&
    filtered.every((product) => selectedIds.has(product.id));

  function toggleEditing() {
    setEditing((current) => !current);
    setSelectedIds(new Set());
  }

  function toggleProduct(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVisible() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected)
        filtered.forEach((product) => next.delete(product.id));
      else filtered.forEach((product) => next.add(product.id));
      return next;
    });
  }

  function runBulkAction(action: InventoryAction) {
    if (!selectedIds.size) return;
    const frozenUntil = new Date(Date.now() + 45 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    setProducts((current) =>
      applyInventoryAction(current, selectedIds, action, frozenUntil),
    );
    toast.success(
      action.type === "consume"
        ? "Oznaczono produkty jako zużyte."
        : action.type === "move"
          ? `Przeniesiono produkty do: ${action.location.toLocaleLowerCase("pl")}.`
          : "Usunięto produkty z zapasów.",
    );
    setSelectedIds(new Set());
    setEditing(false);
  }

  function saveProduct(updatedProduct: DemoProduct) {
    setProducts((current) =>
      current.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product,
      ),
    );
    setProductToEdit(null);
    toast.success("Zapisano zmiany produktu.");
  }

  return (
    <>
      <PageHeader
        eyebrow="Twoja kuchnia"
        title="Moje zapasy"
        description={`${activeProducts.length} produktów wraz z informacją, co warto wykorzystać najpierw.`}
        actions={
          <>
            <Button
              variant={editing ? "secondary" : "outline"}
              className="h-11"
              onClick={toggleEditing}
            >
              {editing ? (
                <XIcon aria-hidden="true" />
              ) : (
                <PencilIcon aria-hidden="true" />
              )}
              {editing ? "Anuluj" : "Edytuj"}
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/co-ugotowac" />}
              variant="outline"
              className="hidden h-11 sm:inline-flex"
            >
              <ChefHatIcon aria-hidden="true" /> Co ugotować?
            </Button>
          </>
        }
      />

      <section className="app-card mb-5 p-4" aria-label="Filtry produktów">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Szukaj produktów</span>
            <SearchIcon
              className="absolute left-3 top-3 size-5 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Szukaj produktu..."
              className="h-11 pl-10"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {locations.map((item) => (
              <Button
                key={item}
                variant={location === item ? "secondary" : "outline"}
                className="h-11 shrink-0"
                onClick={() => setLocation(item)}
              >
                <StorageLocationIcon location={item} />
                {item}
              </Button>
            ))}
          </div>
        </div>
        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto p-1">
          {categories.map((item) => (
            <Badge
              key={item}
              variant="outline"
              render={<button type="button" aria-pressed={category === item} />}
              onClick={() => setCategory(item)}
              className={cn(
                "h-8 cursor-pointer rounded-full px-3 text-xs font-semibold",
                (productCategoryAppearance[item] ??
                  productCategoryAppearance.Wszystkie).className,
                category === item &&
                  "ring-2 ring-current ring-offset-1 ring-offset-background",
              )}
            >
              <span aria-hidden="true">
                {
                  (productCategoryAppearance[item] ??
                    productCategoryAppearance.Wszystkie).emoji
                }
              </span>
              {item}
            </Badge>
          ))}
        </div>
        <div className="-mx-1 mt-3 flex items-center gap-2 overflow-x-auto border-t border-border px-1 pt-3 pb-1">
          {freshnessFilters.map((item) => (
            <Badge
              key={item.value}
              variant="outline"
              render={
                <button type="button" aria-pressed={freshness === item.value} />
              }
              onClick={() => setFreshness(item.value)}
              className={cn(
                "h-8 cursor-pointer rounded-full px-3 text-xs font-semibold",
                item.className,
                freshness === item.value &&
                  "ring-2 ring-current ring-offset-1 ring-offset-background",
              )}
            >
              {item.label}
            </Badge>
          ))}
        </div>
      </section>

      {editing ? (
        <section
          className="app-card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
          aria-label="Działania zbiorcze"
        >
          <label
            htmlFor="select-visible-products"
            className="flex min-h-11 flex-1 cursor-pointer items-center gap-3"
          >
            <Checkbox
              id="select-visible-products"
              checked={allVisibleSelected}
              onCheckedChange={toggleVisible}
            />
            <span className="text-sm font-semibold">
              Zaznaczono: {selectedIds.size}
            </span>
            <span className="sr-only">Zaznacz wszystkie widoczne produkty</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              className="h-11"
              disabled={!selectedIds.size}
              onClick={() => runBulkAction({ type: "consume" })}
            >
              <CheckCheckIcon aria-hidden="true" /> Zużyte
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={!selectedIds.size}
                render={
                  <Button variant="outline" className="h-11">
                    <PackageIcon aria-hidden="true" /> Przenieś do
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuItem
                  onClick={() =>
                    runBulkAction({ type: "move", location: "Lodówka" })
                  }
                >
                  <StorageLocationIcon location="Lodówka" /> Lodówka
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    runBulkAction({ type: "move", location: "Zamrażarka" })
                  }
                >
                  <StorageLocationIcon location="Zamrażarka" /> Zamrażarka
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    runBulkAction({ type: "move", location: "Spiżarnia" })
                  }
                >
                  <StorageLocationIcon location="Spiżarnia" /> Spiżarnia
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="destructive"
              className="h-11"
              disabled={!selectedIds.size}
              onClick={() => runBulkAction({ type: "remove" })}
            >
              <Trash2Icon aria-hidden="true" /> Usuń
            </Button>
          </div>
        </section>
      ) : null}

      <section className="app-card px-5">
        <div className="flex items-center justify-between border-b border-border py-4">
          <h2 className="font-extrabold">{location}</h2>
          <span className="text-xs text-muted-foreground">
            {filtered.length} wyników
          </span>
        </div>
        {filtered.length ? (
          filtered.map((product) => (
            <div
              key={product.id}
              className={cn(
                "flex items-center gap-3 border-b border-border py-3.5 last:border-0 sm:gap-4",
                selectedIds.has(product.id) && "bg-secondary/40",
              )}
            >
              {editing ? (
                <label
                  htmlFor={`select-${product.id}`}
                  className="flex size-11 shrink-0 cursor-pointer items-center justify-center"
                >
                  <Checkbox
                    id={`select-${product.id}`}
                    checked={selectedIds.has(product.id)}
                    onCheckedChange={() => toggleProduct(product.id)}
                  />
                  <span className="sr-only">Zaznacz {product.name}</span>
                </label>
              ) : null}
              <ProductVisual category={product.category} />
              <div className="min-w-0 flex-1">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={editing}
                  className="h-auto max-w-full justify-start p-0 text-left text-sm font-bold text-foreground hover:bg-transparent hover:text-foreground hover:underline"
                  onClick={() => setProductToEdit(product)}
                >
                  <span className="truncate">{product.name}</span>
                </Button>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {product.quantity.toLocaleString("pl-PL")} {product.unit} ·{" "}
                  {product.storageLocation}
                </p>
                <div className="mt-2">
                  <FreshnessLabel date={product.estimatedUseBy} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center">
            <SearchIcon
              className="mx-auto text-muted-foreground"
              aria-hidden="true"
            />
            <p className="mt-3 font-bold">Nie znaleziono produktów</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Zmień wyszukiwanie lub wybrane filtry.
            </p>
          </div>
        )}
      </section>

      {productToEdit ? (
        <ProductEditDialog
          key={productToEdit.id}
          product={productToEdit}
          onClose={() => setProductToEdit(null)}
          onSave={saveProduct}
        />
      ) : null}
    </>
  );
}
