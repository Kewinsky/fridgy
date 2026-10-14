"use client";

import { useState } from "react";
import { CheckIcon, PlusIcon, Share2Icon, ShoppingBasketIcon, Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { localizeStarterShoppingItem } from "@/lib/demo-localization";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
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
    try {
      await updateShoppingItems((current) => [...current, { id: crypto.randomUUID(), name: trimmedName, done: false }]);
    } catch { toast.error(common("saveFailed")); return; }
    setName("");
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
    try { await updateShoppingItems(() => []); }
    catch { toast.error(common("saveFailed")); return; }
    setClearDialogOpen(false);
    toast.success(t("toasts.cleared"));
  }

  async function shareList() {
    const pendingItems = items.filter((item) => !item.done);
    if (!pendingItems.length) {
      toast.info(t("toasts.nothingToShare"));
      return;
    }

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: t("shareTitle"),
          text: formatShoppingList(displayItems, false, t("shareTitle")),
        });
      } else {
        await navigator.clipboard.writeText(formatShoppingList(displayItems, true, t("shareTitle")));
        toast.success(t("toasts.copied"));
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(t("toasts.shareError"));
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
            <Button variant="outline" className="h-11" onClick={shareList}>
              <Share2Icon aria-hidden="true" /> {t("share")}
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
          <Button className="h-11" onClick={addItem}><PlusIcon aria-hidden="true" /> <span className="hidden sm:inline">{t("add")}</span></Button>
        </div>
        <div className="mt-5">
          {displayItems.map((item) => (
            <div key={item.id} className="flex min-h-16 items-center gap-2 border-b border-border py-2 last:border-0">
              <Button type="button" variant="ghost" onClick={() => toggleItem(item.id)} className="min-h-11 min-w-0 flex-1 justify-start gap-3 px-1 text-left">
                <span className={item.done ? "flex size-6 shrink-0 items-center justify-center rounded-md border border-primary bg-primary text-primary-foreground" : "flex size-6 shrink-0 items-center justify-center rounded-md border border-input"}>
                  {item.done ? <CheckIcon className="size-4" aria-hidden="true" /> : null}
                </span>
                <span className={item.done ? "truncate text-muted-foreground line-through" : "truncate font-semibold"}>{item.name}</span>
              </Button>
              <Button type="button" variant="destructive" size="icon-lg" className="size-11" onClick={() => removeItem(item.id)} aria-label={t("removeItem", { name: item.name })} title={t("removeItem", { name: item.name })}>
                <Trash2Icon aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
        {!items.length ? (
          <div className="py-12 text-center"><ShoppingBasketIcon className="mx-auto text-muted-foreground" aria-hidden="true" /><p className="mt-3 font-bold">{t("empty")}</p></div>
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
