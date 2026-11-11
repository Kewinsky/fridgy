"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { BrandIcon } from "@/components/brand-icon";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { localizeStarterShoppingItem } from "@/lib/demo-localization";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  formatShoppingList,
} from "@/lib/shopping-list";

export function ShoppingListPage() {
  const t = useTranslations("ShoppingList");
  const common = useTranslations("Common");
  const { shoppingItems: items, updateShoppingItems } = useDashboardData();
  const locale = useLocale() as Locale;
  const displayItems = items.map((item) => localizeStarterShoppingItem(item, locale));
  const [name, setName] = useState("");
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  async function addItem() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setName("");
    try {
      await updateShoppingItems((current) => [...current, { id: crypto.randomUUID(), name: trimmedName, done: false }]);
    } catch {
      setName((current) => current || trimmedName);
      toast.error(common("saveFailed"));
    }
  }

  async function toggleItem(id: string) {
    try { await updateShoppingItems((current) => current.map((item) => item.id === id ? { ...item, done: !item.done } : item)); }
    catch { toast.error(common("saveFailed")); }
  }

  async function removeItem(id: string) {
    try { await updateShoppingItems((current) => current.filter((item) => item.id !== id)); }
    catch { toast.error(common("saveFailed")); }
  }

  async function clearList() {
    setClearDialogOpen(false);
    try { await updateShoppingItems(() => []); }
    catch { toast.error(common("saveFailed")); return; }
    toast.success(t("toasts.cleared"));
  }

  async function copyList() {
    const pendingItems = items.filter((item) => !item.done);
    if (!pendingItems.length) {
      toast.info(t("toasts.nothingToCopy"));
      return;
    }

    try {
      await navigator.clipboard.writeText(formatShoppingList(displayItems, true, t("listTitle")));
      toast.success(t("toasts.copied"));
    } catch {
      toast.error(t("toasts.copyError"));
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        actions={
          <>
            <Button variant="outline" className="h-11" onClick={copyList}>
              <CopyIcon aria-hidden="true" /> {t("copyList")}
            </Button>
            <Button
              variant="destructive"
              className="h-11"
              disabled={!items.length}
              onClick={() => setClearDialogOpen(true)}
            >
              <Trash2Icon aria-hidden="true" /> {t("clear")}
            </Button>
          </>
        }
      />
      <section className="app-card mx-auto max-w-2xl p-5 sm:p-6">
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") addItem(); }}
            placeholder={t("placeholder")}
            aria-label={t("newItem")}
            className="h-11"
          />
          <Button className="size-11 p-0" onClick={addItem} aria-label={t("add")}><PlusIcon aria-hidden="true" /></Button>
        </div>
        <div className="mt-5">
          {displayItems.map((item) => (
            <div key={item.id} className="flex min-h-16 items-center gap-2 border-b border-border py-2 last:border-0">
              <Button type="button" variant="ghost" onClick={() => toggleItem(item.id)} className="min-h-11 min-w-0 flex-1 justify-start gap-3 px-1 text-left">
                <span className={item.done ? "flex size-6 shrink-0 items-center justify-center rounded-md border border-primary bg-primary text-primary-foreground" : "flex size-6 shrink-0 items-center justify-center rounded-md border border-input"}>
                  {item.done ? <CheckIcon className="size-4" aria-hidden="true" /> : null}
                </span>
                <span className={item.done ? "truncate text-muted-foreground line-through" : "truncate font-semibold"}>{item.name}</span>
                {item.isDemo ? <Badge variant="outline">{common("demoData")}</Badge> : null}
              </Button>
              <Button type="button" variant="destructive" size="icon-lg" className="size-11" onClick={() => removeItem(item.id)} aria-label={t("removeItem", { name: item.name })} title={t("removeItem", { name: item.name })}>
                <Trash2Icon aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
        {!items.length ? (
          <div className="py-12 text-center"><BrandIcon name="shopping" className="mx-auto size-20" /><p className="mt-3 font-bold">{t("empty")}</p></div>
        ) : null}
        {items.length > 0 && items.every((item) => item.done) ? (
          <div className="py-8 text-center" role="status">
            <BrandIcon name="celebrate" className="mx-auto size-20" />
            <p className="mt-3 font-bold">{t("allDone")}</p>
          </div>
        ) : null}
      </section>

      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clearDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("clearDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => setClearDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-11"
              onClick={clearList}
            >
              <Trash2Icon aria-hidden="true" /> {t("clearDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
