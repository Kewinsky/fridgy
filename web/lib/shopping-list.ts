export type ShoppingItem = {
  id: string;
  name: string;
  done: boolean;
  seedKey?: string;
};

export function mergeShoppingItems(current: ShoppingItem[], names: string[]) {
  const requestedNames = new Set(
    names.map((name) => name.trim().toLocaleLowerCase("pl")).filter(Boolean),
  );
  let changedCount = 0;
  const items = current.map((item) => {
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
  return { items: [...items, ...newItems], changedCount };
}

export function formatShoppingList(
  items: Pick<ShoppingItem, "name" | "done">[],
  includeTitle = true,
  title = "Lista zakupów – Fridgy",
) {
  const pendingItems = items.filter((item) => !item.done);
  const products = pendingItems.map((item) => `- ${item.name}`).join("\n");
  return includeTitle ? `${title}\n\n${products}` : products;
}
