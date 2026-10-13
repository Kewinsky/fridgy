export type ShoppingItem = {
  id: string;
  name: string;
  done: boolean;
};

export const initialShoppingItems: ShoppingItem[] = [
  { id: "s1", name: "Banany", done: false },
  { id: "s2", name: "Kawa ziarnista", done: false },
  { id: "s3", name: "Woda gazowana", done: true },
];

export const SHOPPING_LIST_STORAGE_KEY = "fridgy-shopping-list";
type ShoppingListStorage = Pick<Storage, "getItem" | "setItem">;

export function readShoppingList(storage: ShoppingListStorage) {
  const saved = storage.getItem(SHOPPING_LIST_STORAGE_KEY);
  if (!saved) return initialShoppingItems;

  try {
    const items: unknown = JSON.parse(saved);
    if (!Array.isArray(items)) return initialShoppingItems;
    return items.filter(
      (item): item is ShoppingItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as ShoppingItem).id === "string" &&
        typeof (item as ShoppingItem).name === "string" &&
        typeof (item as ShoppingItem).done === "boolean",
    );
  } catch {
    return initialShoppingItems;
  }
}

export function writeShoppingList(storage: ShoppingListStorage, items: ShoppingItem[]) {
  storage.setItem(SHOPPING_LIST_STORAGE_KEY, JSON.stringify(items));
}

export function addShoppingItems(storage: ShoppingListStorage, names: string[]) {
  const requestedNames = new Set(
    names.map((name) => name.trim().toLocaleLowerCase("pl")).filter(Boolean),
  );
  let changedCount = 0;
  const items = readShoppingList(storage).map((item) => {
    if (item.done && requestedNames.has(item.name.toLocaleLowerCase("pl"))) {
      changedCount += 1;
      return { ...item, done: false };
    }
    return item;
  });
  const existingNames = new Set(
    items.map((item) => item.name.toLocaleLowerCase("pl")),
  );
  const newItems = names
    .map((name) => name.trim())
    .filter(
      (name, index, allNames) =>
        name &&
        !existingNames.has(name.toLocaleLowerCase("pl")) &&
        allNames.findIndex(
          (candidate) =>
            candidate.toLocaleLowerCase("pl") === name.toLocaleLowerCase("pl"),
        ) === index,
    )
    .map((name) => ({ id: crypto.randomUUID(), name, done: false }));

  changedCount += newItems.length;
  if (changedCount) writeShoppingList(storage, [...items, ...newItems]);
  return changedCount;
}

export function formatShoppingList(items: Pick<ShoppingItem, "name" | "done">[], includeTitle = true) {
  const pendingItems = items.filter((item) => !item.done);
  const products = pendingItems.map((item) => `- ${item.name}`).join("\n");
  return includeTitle ? `Lista zakupów – Fridgy\n\n${products}` : products;
}
