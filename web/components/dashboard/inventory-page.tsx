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
import {
  FilterBadgeGroup,
  type FilterBadgeOption,
} from "@/components/dashboard/filter-badge-group";
import { FreshnessLabel } from "@/components/dashboard/freshness-label";
import {
  productCategories,
  productCategoryAppearance,
} from "@/components/dashboard/product-category-options";
import { ProductEditDialog } from "@/components/dashboard/product-edit-dialog";
import { ProductVisual } from "@/components/dashboard/product-visual";
import {
  StorageLocationIcon,
  storageLocationEmojis,
} from "@/components/dashboard/storage-location-icon";
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

type LocationFilter = "Wszystkie" | StorageLocation;
type CategoryFilter = "Wszystkie" | (typeof productCategories)[number];
type FreshnessFilter = "all" | FreshnessStatus;

const locationFilters: FilterBadgeOption<LocationFilter>[] = [
  { value: "Wszystkie", label: "Wszystkie" },
  { value: "Lodówka", label: "Lodówka", emoji: storageLocationEmojis.Lodówka },
  { value: "Zamrażarka", label: "Zamrażarka", emoji: storageLocationEmojis.Zamrażarka },
  { value: "Spiżarnia", label: "Spiżarnia", emoji: storageLocationEmojis.Spiżarnia },
];
const categoryFilters: FilterBadgeOption<CategoryFilter>[] = [
  {
    value: "Wszystkie",
    label: "Wszystkie",
  },
  ...productCategories.map((category) => ({
    value: category,
    label: category,
    emoji: productCategoryAppearance[category].emoji,
    className: productCategoryAppearance[category].className,
  })),
];
const freshnessFilters: FilterBadgeOption<FreshnessFilter>[] = [
  {
    value: "all",
    label: "Wszystkie",
  },
  {
    value: "overdue",
    label: "Po terminie",
    emoji: "⛔",
  },
  {
    value: "today",
    label: "Dzisiaj",
    emoji: "🔥",
  },
  {
    value: "soon",
    label: "Wkrótce",
    emoji: "⏳",
  },
  {
    value: "week",
    label: "Ten tydzień",
    emoji: "🗓️",
  },
  {
    value: "calm",
    label: "Na spokojnie",
    emoji: "🌿",
  },
];

export function InventoryPage() {
  const [products, setProducts] = useState(demoProducts);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<LocationFilter>("Wszystkie");
  const [category, setCategory] = useState<CategoryFilter>("Wszystkie");
  const [freshness, setFreshness] = useState<FreshnessFilter>("all");
  const [editing, setEditing] = useState(false);
  const [productToEdit, setProductToEdit] = useState<DemoProduct | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const activeProducts = products.filter(
    (product) => product.status === "active",
  );
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
          <Button
            nativeButton={false}
            render={<Link href="/dashboard/co-ugotowac" />}
            variant="outline"
            className="hidden h-11 sm:inline-flex"
          >
            <ChefHatIcon aria-hidden="true" /> Co ugotować?
          </Button>
        }
      />

      <section className="app-card mb-5 p-3" aria-label="Filtry produktów">
        <label className="relative block">
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
        <div className="mt-2 grid divide-y divide-border xl:grid-cols-3 xl:divide-x xl:divide-y-0">
          <FilterBadgeGroup
            label="Miejsce przechowywania"
            options={locationFilters}
            value={location}
            onChange={setLocation}
          />
          <FilterBadgeGroup
            label="Kategoria produktu"
            options={categoryFilters}
            value={category}
            onChange={setCategory}
          />
          <FilterBadgeGroup
            label="Termin przydatności"
            options={freshnessFilters}
            value={freshness}
            onChange={setFreshness}
          />
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
          <h2 className="flex flex-wrap items-baseline gap-x-2 font-extrabold">
            {location}
            <span className="text-xs font-normal text-muted-foreground">
              ({filtered.length} produktów)
            </span>
          </h2>
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
        </div>
        {filtered.length ? (
          filtered.map((product) =>
            editing ? (
              <label
                key={product.id}
                htmlFor={`select-${product.id}`}
                className={cn(
                  "flex cursor-pointer items-center gap-3 border-b border-border py-3.5 pl-2 transition-colors last:border-0 hover:bg-muted sm:gap-4",
                  selectedIds.has(product.id) && "bg-secondary/40",
                )}
              >
                <span className="flex size-11 shrink-0 items-center justify-center">
                  <Checkbox
                    id={`select-${product.id}`}
                    checked={selectedIds.has(product.id)}
                    onCheckedChange={() => toggleProduct(product.id)}
                  />
                  <span className="sr-only">Zaznacz {product.name}</span>
                </span>
                <ProductRowDetails product={product} />
              </label>
            ) : (
              <Button
                key={product.id}
                type="button"
                variant="ghost"
                className="h-auto w-full justify-start gap-3 rounded-none border-x-0 border-t-0 border-b border-border py-3.5 pr-0 pl-2 text-left whitespace-normal last:border-0 hover:bg-muted sm:gap-4"
                onClick={() => setProductToEdit(product)}
              >
                <ProductRowDetails product={product} />
              </Button>
            ),
          )
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

function ProductRowDetails({ product }: { product: DemoProduct }) {
  return (
    <>
      <ProductVisual category={product.category} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-foreground">
          {product.name}
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {product.quantity.toLocaleString("pl-PL")} {product.unit} ·{" "}
          {product.storageLocation}
        </span>
        <span className="mt-2 block">
          <FreshnessLabel date={product.estimatedUseBy} />
        </span>
      </span>
    </>
  );
}
