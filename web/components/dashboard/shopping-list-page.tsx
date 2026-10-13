"use client";

import { useState, useSyncExternalStore } from "react";
import { CheckIcon, PlusIcon, Share2Icon, ShoppingBasketIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
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
  const items = useSyncExternalStore(
    subscribeToShoppingList,
    getShoppingListSnapshot,
    getServerShoppingListSnapshot,
  );
  const [name, setName] = useState("");

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

  async function shareList() {
    const pendingItems = items.filter((item) => !item.done);
    if (!pendingItems.length) {
      toast.info("Nie ma produktów do udostępnienia.");
      return;
    }

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: "Lista zakupów – Fridgy",
          text: formatShoppingList(items, false),
        });
      } else {
        await navigator.clipboard.writeText(formatShoppingList(items));
        toast.success("Lista została skopiowana.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Nie udało się udostępnić listy.");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Przy następnych zakupach"
        title="Lista zakupów"
        description="Krótka lista rzeczy, których brakuje w domu. Udostępniana lista pomija kupione produkty."
        actions={
          <Button variant="outline" className="h-11" onClick={shareList}>
            <Share2Icon aria-hidden="true" /> Udostępnij
          </Button>
        }
      />
      <section className="app-card mx-auto max-w-2xl p-5 sm:p-6">
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") addItem(); }}
            placeholder="Dodaj do listy..."
            aria-label="Nowy produkt"
            className="h-11"
          />
          <Button className="h-11" onClick={addItem}><PlusIcon aria-hidden="true" /> <span className="hidden sm:inline">Dodaj</span></Button>
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
              <Button type="button" variant="destructive" size="icon-lg" className="size-11" onClick={() => removeItem(item.id)} aria-label={`Usuń ${item.name}`} title={`Usuń ${item.name}`}>
                <Trash2Icon aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
        {!items.length ? (
          <div className="py-12 text-center"><ShoppingBasketIcon className="mx-auto text-muted-foreground" aria-hidden="true" /><p className="mt-3 font-bold">Lista jest pusta</p></div>
        ) : null}
      </section>
    </>
  );
}
