"use client";

import { useSyncExternalStore } from "react";

import type { DemoProduct } from "@/lib/demo-data";
import {
  applyInventoryDeductions,
  type InventoryDeduction,
  INVENTORY_STORAGE_KEY,
  readInventory,
  writeInventory,
} from "@/lib/inventory-store";

const INVENTORY_CHANGE_EVENT = "fridgy-inventory-change";
let cachedStorageValue: string | null | undefined;
let cachedProducts: DemoProduct[] = [];

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(INVENTORY_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(INVENTORY_CHANGE_EVENT, onStoreChange);
  };
}

function getSnapshot() {
  const storageValue = window.localStorage.getItem(INVENTORY_STORAGE_KEY);
  if (storageValue !== cachedStorageValue) {
    cachedStorageValue = storageValue;
    cachedProducts = readInventory(window.localStorage);
  }
  return cachedProducts;
}

function getServerSnapshot() {
  return [];
}

export function useInventory() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function updateInventory(
  update: (products: DemoProduct[]) => DemoProduct[],
) {
  writeInventory(window.localStorage, update(readInventory(window.localStorage)));
  cachedStorageValue = undefined;
  window.dispatchEvent(new Event(INVENTORY_CHANGE_EVENT));
}

export function consumeInventory(deductions: InventoryDeduction[]) {
  updateInventory((products) => applyInventoryDeductions(products, deductions));
}
