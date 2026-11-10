export const inventoryViews = ["readable", "compact", "detailed"] as const;
export type InventoryView = (typeof inventoryViews)[number];
