"use client";

import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { applyInventoryDeductions, type InventoryDeduction } from "@/lib/inventory-store";

export function useInventory() {
  return useDashboardData().products;
}

export function useInventoryActions() {
  const { updateInventory } = useDashboardData();
  return {
    updateInventory,
    consumeInventory: (deductions: InventoryDeduction[]) =>
      updateInventory((products) => applyInventoryDeductions(products, deductions)),
  };
}
