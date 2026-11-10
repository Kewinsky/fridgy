"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  CheckCheckIcon,
  CheckIcon,
  ChefHatIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PackageIcon,
  PencilIcon,
  RotateCcwIcon,
  SearchIcon,
  ShoppingCartPlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import {
  productCategories,
  productCategoryMessageKeys,
  type ProductCategory,
} from "@/components/dashboard/product-category-options";
import { ProductEditDialog } from "@/components/dashboard/product-edit-dialog";
import { ProductRowDetails } from "@/components/dashboard/product-row-details";
import {
  StorageLocationIcon,
  storageLocationMessageKeys,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsScrollableList, TabsTrigger } from "@/components/ui/tabs";
import {
  type DemoProduct,
  type FreshnessStatus,
  type StorageLocation,
} from "@/lib/demo-data";
import { localizeDemoProduct } from "@/lib/demo-localization";
import type { Locale } from "@/i18n/config";
import {
  applyInventoryAction,
  type InventoryAction,
} from "@/lib/inventory-actions";
import { cn } from "@/lib/utils";
import { paginate } from "@/lib/pagination";
import { matchesInventoryFilters } from "@/lib/inventory-filters";
import { mergeShoppingItems } from "@/lib/shopping-list";

const locations = ["Lodówka", "Zamrażarka", "Spiżarnia"] as const;
const freshnessOptions = ["overdue", "today", "soon", "week", "calm"] as const;

export function InventoryPage({ initialTab = "active" }: { initialTab?: "active" | "consumed" }) {
  const t = useTranslations("Inventory");
  const dashboardT = useTranslations("Dashboard");
  const common = useTranslations("Common");
  const locale = useLocale() as Locale;
  const { products, updateInventory, updateShoppingItems } = useDashboardData();
  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<StorageLocation[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([]);
  const [selectedFreshness, setSelectedFreshness] = useState<FreshnessStatus[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState(false);
  const [productToEdit, setProductToEdit] = useState<DemoProduct | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [tableLoading, setTableLoading] = useState(process.env.NODE_ENV === "development");
  const listRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!tableLoading) return;
    const timer = window.setTimeout(() => setTableLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, [tableLoading]);
  const locationFilters = locations.map((value) => ({ value, label: t(`locations.${storageLocationMessageKeys[value]}`) }));
  const categoryFilters = productCategories.map((value) => ({ value, label: t(`categories.${productCategoryMessageKeys[value]}`) }));
  const freshnessFilters = freshnessOptions.map((value) => ({ value, label: t(`freshness.${value}`) }));
  const activeProducts = products.filter(
    (product) => product.status === "active",
  );
  const consumedCount = products.length - activeProducts.length;
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(locale);
    return products.filter(
      (product) =>
        matchesInventoryFilters(product, selectedLocations, selectedCategories, selectedFreshness, tab) &&
        localizeDemoProduct(product, locale).name.toLocaleLowerCase(locale).includes(normalizedQuery),
    );
  }, [locale, products, query, selectedCategories, selectedFreshness, selectedLocations, tab]);
  const { items: visibleProducts, page: currentPage, pageCount, start, end } = paginate(filtered, page, pageSize);
  const allVisibleSelected =
    visibleProducts.length > 0 &&
    visibleProducts.every((product) => selectedIds.has(product.id));
  let listTitle = t("title");
  if (tab === "consumed") listTitle = t("tabs.consumed");
  else if (selectedLocations.length === 1) listTitle = t(`locations.${storageLocationMessageKeys[selectedLocations[0]]}`);

  function goToPage(nextPage: number) {
    setPage(nextPage);
    listRef.current?.scrollIntoView({ block: "start" });
  }

  function toggleLocation(value: StorageLocation) {
    setSelectedLocations((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    setPage(1);
  }

  function toggleCategory(value: ProductCategory) {
    setSelectedCategories((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    setPage(1);
  }

  function toggleFreshness(value: FreshnessStatus) {
    setSelectedFreshness((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    setPage(1);
  }

  function clearFilters() {
    setQuery("");
    setSelectedLocations([]);
    setSelectedCategories([]);
    setSelectedFreshness([]);
    setPage(1);
  }

  function changeTab(value: string) {
    if (value !== "active" && value !== "consumed") return;
    setTab(value);
    clearFilters();
    setEditing(false);
    setSelectedIds(new Set());
    const url = new URL(window.location.href);
    if (value === "consumed") url.searchParams.set("tab", value);
    else url.searchParams.delete("tab");
    window.history.replaceState(null, "", url);
  }

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
        visibleProducts.forEach((product) => next.delete(product.id));
      else visibleProducts.forEach((product) => next.add(product.id));
      return next;
    });
  }

  async function runBulkAction(action: InventoryAction) {
    if (!selectedIds.size || pending) return;
    const frozenUntil = new Date(Date.now() + 45 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    setPending(true);
    try {
      await updateInventory((current) =>
        applyInventoryAction(current, selectedIds, action, frozenUntil),
      );
    } catch {
      toast.error(common("saveFailed"));
      return;
    } finally {
      setPending(false);
    }
    toast.success(
      action.type === "consume"
        ? t("toasts.consumed")
        : action.type === "move"
          ? t("toasts.moved", {
              location: t(`locations.${storageLocationMessageKeys[action.location]}`),
            })
          : t("toasts.removed"),
    );
    setSelectedIds(new Set());
    setEditing(false);
  }

  async function addConsumedToShopping() {
    if (!selectedIds.size || pending) return;
    const selected = products.filter((product) => product.status === "consumed" && selectedIds.has(product.id));
    if (!selected.length) return;
    const names = selected.map((product) => localizeDemoProduct(product, locale).name);
    const ids = new Set(selected.map((product) => product.id));
    setPending(true);
    try {
      await updateShoppingItems((current) => mergeShoppingItems(current, names).items);
    } catch {
      toast.error(common("saveFailed"));
      setPending(false);
      return;
    }
    try {
      await updateInventory((current) => current.filter((product) => !ids.has(product.id)));
      setSelectedIds(new Set());
      toast.success(dashboardT("consumedMoved"));
    } catch {
      toast.error(dashboardT("consumedRemovalFailed"));
    } finally {
      setPending(false);
    }
  }

  async function restoreSelected() {
    if (!selectedIds.size || pending) return;
    const selected = products.filter((product) => product.status === "consumed" && selectedIds.has(product.id));
    if (!selected.length) return;
    if (selected.some((product) => product.quantity <= 0)) {
      if (selected.length === 1) setProductToEdit(localizeDemoProduct(selected[0], locale));
      else toast.info(t("bulk.restoreNeedsQuantity"));
      return;
    }
    const ids = new Set(selected.map((product) => product.id));
    setPending(true);
    try {
      await updateInventory((current) => current.map((product) =>
        product.status === "consumed" && ids.has(product.id) ? { ...product, status: "active" as const } : product,
      ));
      setSelectedIds(new Set());
      toast.success(t(selected.length === 1 ? "toasts.restored" : "toasts.restoredMany"));
    } catch {
      toast.error(common("saveFailed"));
    } finally {
      setPending(false);
    }
  }

  async function saveProduct(updatedProduct: DemoProduct) {
    const original = products.find((product) => product.id === updatedProduct.id);
    const unchangedName = original && updatedProduct.name === localizeDemoProduct(original, locale).name;
    const productToSave = unchangedName
      ? { ...updatedProduct, name: original.name, seedKey: original.seedKey }
      : { ...updatedProduct, seedKey: undefined };
    try {
      await updateInventory((current) =>
        current.map((product) =>
          product.id === updatedProduct.id ? productToSave : product,
        ),
      );
    } catch {
      toast.error(common("saveFailed"));
      return;
    }
    setProductToEdit(null);
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(updatedProduct.id);
      return next;
    });
    toast.success(t(original?.status === "consumed" ? "toasts.restored" : "toasts.saved"));
  }

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description", { count: activeProducts.length })}
        actions={
          <Button
            nativeButton={false}
            render={<Link href="/dashboard/co-ugotowac" />}
            variant="outline"
            className="hidden h-11 sm:inline-flex"
          >
            <ChefHatIcon aria-hidden="true" /> {t("cook")}
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={changeTab} className="mb-5">
        <TabsScrollableList aria-label={t("tabs.label")}>
          <TabsTrigger value="active" className="h-9 px-4">{t("tabs.active")} <span className="tabular-nums">{activeProducts.length}</span></TabsTrigger>
          <TabsTrigger value="consumed" className="h-9 px-4">{t("tabs.consumed")} <span className="tabular-nums">{consumedCount}</span></TabsTrigger>
        </TabsScrollableList>
        <TabsContent value={tab} className="pt-3">
      <section className="app-card mb-5 p-3" aria-label={t("filters.label")}>
        <label className="relative block">
          <span className="sr-only">{t("search")}</span>
          <SearchIcon
            className="absolute left-3 top-3 size-5 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(1); }}
            placeholder={t("searchPlaceholder")}
            className="h-11 pl-10"
          />
        </label>
        {tab === "active" ? <>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <InventoryFilter label={t("filters.location")} allLabel={t("all")} options={locationFilters} selected={selectedLocations} onToggle={toggleLocation} />
          <InventoryFilter label={t("filters.category")} allLabel={t("all")} options={categoryFilters} selected={selectedCategories} onToggle={toggleCategory} searchPlaceholder={t("filters.searchCategory")} emptyLabel={t("filters.noCategory")} />
          <InventoryFilter label={t("filters.freshness")} allLabel={t("all")} options={freshnessFilters} selected={selectedFreshness} onToggle={toggleFreshness} />
        </div>
        {query || selectedLocations.length || selectedCategories.length || selectedFreshness.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {selectedLocations.map((value) => <FilterChip key={value} label={`${t("filters.location")}: ${t(`locations.${storageLocationMessageKeys[value]}`)}`} onRemove={() => toggleLocation(value)} />)}
            {selectedCategories.map((value) => <FilterChip key={value} label={`${t("filters.category")}: ${t(`categories.${productCategoryMessageKeys[value]}`)}`} onRemove={() => toggleCategory(value)} />)}
            {selectedFreshness.map((value) => <FilterChip key={value} label={`${t("filters.freshness")}: ${t(`freshness.${value}`)}`} onRemove={() => toggleFreshness(value)} />)}
            <Button variant="ghost" className="h-11 text-sm" onClick={clearFilters}>{t("filters.clear")}</Button>
          </div>
        ) : null}
        </> : null}
      </section>

      {editing || tab === "consumed" ? (
        <section
          className="app-card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
          aria-label={t("bulk.label")}
        >
          <label
            htmlFor="select-visible-products"
            className="flex min-h-11 flex-1 cursor-pointer items-center gap-3"
          >
            <Checkbox
              id="select-visible-products"
              checked={allVisibleSelected}
              disabled={pending}
              onCheckedChange={toggleVisible}
            />
            <span className="text-sm font-semibold">
              {t("bulk.selected", { count: selectedIds.size })}
            </span>
            <span className="sr-only">{t("bulk.selectAll")}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {tab === "active" ? <>
            <Button
              className="h-11"
              disabled={pending || !selectedIds.size}
              onClick={() => runBulkAction({ type: "consume" })}
            >
              <CheckCheckIcon aria-hidden="true" /> {t("bulk.consumed")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={pending || !selectedIds.size}
                render={
                  <Button variant="outline" className="h-11">
                    <PackageIcon aria-hidden="true" /> {t("bulk.moveTo")}
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuItem
                  onClick={() =>
                    runBulkAction({ type: "move", location: "Lodówka" })
                  }
                >
                  <StorageLocationIcon location="Lodówka" /> {t("locations.fridge")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    runBulkAction({ type: "move", location: "Zamrażarka" })
                  }
                >
                  <StorageLocationIcon location="Zamrażarka" /> {t("locations.freezer")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    runBulkAction({ type: "move", location: "Spiżarnia" })
                  }
                >
                  <StorageLocationIcon location="Spiżarnia" /> {t("locations.pantry")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </> : <>
              <Button className="h-11" disabled={pending || !selectedIds.size} onClick={addConsumedToShopping}>
                <ShoppingCartPlusIcon aria-hidden="true" /> {dashboardT("addToShopping")}
              </Button>
              <Button variant="outline" className="h-11" disabled={pending || !selectedIds.size} onClick={restoreSelected}>
                <RotateCcwIcon aria-hidden="true" /> {t("restoreSelected")}
              </Button>
            </>}
            <Button
              variant="destructive"
              className="h-11"
              disabled={pending || !selectedIds.size}
              onClick={() => runBulkAction({ type: "remove" })}
            >
              <Trash2Icon aria-hidden="true" /> {t("delete")}
            </Button>
          </div>
        </section>
      ) : null}

      <section ref={listRef} className="app-card px-5" aria-busy={tableLoading}>
        <div className="flex items-center justify-between border-b border-border py-4">
          <h2 className="flex flex-wrap items-baseline gap-x-2 font-extrabold">
            {listTitle}
            <span className="text-xs font-normal text-muted-foreground">
              ({t("productCount", { count: filtered.length })})
            </span>
          </h2>
          {tab === "active" ? <Button
            variant={editing ? "secondary" : "outline"}
            className="h-11"
            onClick={toggleEditing}
          >
            {editing ? (
              <XIcon aria-hidden="true" />
            ) : (
              <PencilIcon aria-hidden="true" />
            )}
            {editing ? t("cancel") : t("edit")}
          </Button> : null}
        </div>
        {tableLoading ? (
          <InventoryTableSkeleton />
        ) : filtered.length ? (
          visibleProducts.map((product) =>
            editing || tab === "consumed" ? (
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
                    disabled={pending}
                    onCheckedChange={() => toggleProduct(product.id)}
                  />
                  <span className="sr-only">{t("selectProduct", { name: product.name })}</span>
                </span>
                <ProductRowDetails product={product} />
              </label>
            ) : (
              <Button
                key={product.id}
                type="button"
                variant="ghost"
                className="h-auto w-full justify-start gap-3 rounded-none border-x-0 border-t-0 border-b border-border py-3.5 pr-0 pl-2 text-left whitespace-normal last:border-0 hover:bg-muted sm:gap-4"
                onClick={() => setProductToEdit(localizeDemoProduct(product, locale))}
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
            <p className="mt-3 font-bold">{tab === "consumed" ? dashboardT("consumedEmpty") : t("empty.title")}</p>
            {tab === "active" ? <p className="mt-1 text-sm text-muted-foreground">{t("empty.description")}</p> : null}
          </div>
        )}
        {filtered.length > 0 && !tableLoading ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">{t("pagination.rowsPerPage")}</span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={t("pagination.rowsPerPage")}
                  render={<Button variant="outline" className="h-11 min-w-20 justify-between">{pageSize}<ChevronDownIcon aria-hidden="true" /></Button>}
                />
                <DropdownMenuContent align="start" className="min-w-20">
                  {[10, 20, 30].map((size) => (
                    <DropdownMenuItem key={size} onClick={() => { setPageSize(size); goToPage(1); }}>
                      {size} {size === pageSize ? <CheckIcon className="ml-auto size-4" aria-hidden="true" /> : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-muted-foreground">{t("pagination.range", { start, end, count: filtered.length })}</span>
            </div>
            <nav aria-label={t("pagination.navigation")} className="flex items-center gap-2">
              <Button variant="outline" size="icon-lg" aria-label={t("pagination.previous")} disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
                <ChevronLeftIcon aria-hidden="true" />
              </Button>
              <span className="min-w-24 text-center font-semibold tabular-nums">{t("pagination.page", { page: currentPage, pages: pageCount })}</span>
              <Button variant="outline" size="icon-lg" aria-label={t("pagination.next")} disabled={currentPage === pageCount} onClick={() => goToPage(currentPage + 1)}>
                <ChevronRightIcon aria-hidden="true" />
              </Button>
            </nav>
          </div>
        ) : null}
      </section>
        </TabsContent>
      </Tabs>

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

function InventoryFilter<T extends string>({
  label,
  allLabel,
  options,
  selected,
  onToggle,
  searchPlaceholder,
  emptyLabel,
}: {
  label: string;
  allLabel: string;
  options: readonly { value: T; label: string }[];
  selected: readonly T[];
  onToggle: (value: T) => void;
  searchPlaceholder?: string;
  emptyLabel?: string;
}) {
  const [search, setSearch] = useState("");
  const visibleOptions = options.filter((option) => option.label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));

  return (
    <Popover onOpenChange={(open) => { if (!open) setSearch(""); }}>
      <PopoverTrigger render={
        <Button type="button" variant="outline" className="h-11 w-full justify-between px-3 font-normal" aria-label={`${label}: ${selected.length || allLabel}`}>
          <span className="truncate">{label}</span>
          <span className="ml-auto rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-primary">{selected.length || allLabel}</span>
          <ChevronDownIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        </Button>
      } />
      <PopoverContent align="start" className="w-72 max-w-[calc(100vw-2rem)] p-2">
        {searchPlaceholder ? <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="mb-2 h-10" /> : null}
        <div role="group" aria-label={label} className="max-h-64 overflow-y-auto">
          {visibleOptions.length ? visibleOptions.map((option) => {
            const checked = selected.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => onToggle(option.value)}
                className="flex min-h-11 w-full items-center gap-3 rounded-md px-2 text-left text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span className={cn("flex size-5 shrink-0 items-center justify-center rounded border", checked ? "border-primary bg-primary text-primary-foreground" : "border-input")}>
                  {checked ? <CheckIcon className="size-3.5" aria-hidden="true" /> : null}
                </span>
                <span>{option.label}</span>
              </button>
            );
          }) : <p className="px-2 py-3 text-sm text-muted-foreground">{emptyLabel}</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const t = useTranslations("Inventory.filters");
  return (
    <Button type="button" variant="secondary" className="min-h-11 max-w-full rounded-full px-3 text-left text-xs whitespace-normal" aria-label={t("remove", { name: label })} onClick={onRemove}>
      {label} <XIcon className="size-3.5" aria-hidden="true" />
    </Button>
  );
}

function InventoryTableSkeleton() {
  return (
    <div aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 border-b border-border py-3.5 pl-2 last:border-0 sm:gap-4">
          <Skeleton className="size-11 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-36 max-w-full" />
            <Skeleton className="h-3 w-28 max-w-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
