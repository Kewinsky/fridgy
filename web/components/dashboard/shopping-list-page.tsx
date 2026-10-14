"use client";

import { useState, useSyncExternalStore } from "react";
import { CheckIcon, PlusIcon, Share2Icon, ShoppingBasketIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
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
  initialShoppingItems,
  readShoppingList,
  SHOPPING_LIST_STORAGE_KEY,
  writeShoppingList,
  type ShoppingItem,
} from "@/lib/shopping-list";

const SHOPPING_LIST_CHANGE_EVENT = "fridgy-shopping-list-change";
let cachedStorageValue: string | null | undefined;
let cachedItems = initialShoppingItems;

function subscribeToShoppingList(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SHOPPING_LIST_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SHOPPING_LIST_CHANGE_EVENT, onStoreChange);
  };
}

function getShoppingListSnapshot() {
  const storageValue = window.localStorage.getItem(SHOPPING_LIST_STORAGE_KEY);
  if (storageValue !== cachedStorageValue) {
    cachedStorageValue = storageValue;
    cachedItems = readShoppingList(window.localStorage);
  }
  return cachedItems;
}

function getServerShoppingListSnapshot() {
  return initialShoppingItems;
}

export function ShoppingListPage() {
  const t = useTranslations("ShoppingList");
  const items = useSyncExternalStore(
    subscribeToShoppingList,
    getShoppingListSnapshot,
    getServerShoppingListSnapshot,
  );
  const [name, setName] = useState("");
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  function updateItems(update: (current: ShoppingItem[]) => ShoppingItem[]) {
    writeShoppingList(window.localStorage, update(items));
    window.dispatchEvent(new Event(SHOPPING_LIST_CHANGE_EVENT));
  }

  function addItem() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    updateItems((current) => [...current, { id: crypto.randomUUID(), name: trimmedName, done: false }]);
    setName("");
  }

  function toggleItem(id: string) {
    updateItems((current) => current.map((item) => item.id === id ? { ...item, done: !item.done } : item));
  }

  function removeItem(id: string) {
    updateItems((current) => current.filter((item) => item.id !== id));
  }

  function clearList() {
    updateItems(() => []);
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
          text: formatShoppingList(items, false, t("shareTitle")),
        });
      } else {
        await navigator.clipboard.writeText(formatShoppingList(items, true, t("shareTitle")));
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
          {items.map((item) => (
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
