import type { Metadata } from "next";

import { ShoppingListPage } from "@/components/dashboard/shopping-list-page";

export const metadata: Metadata = {
  title: "Lista zakupów",
  description: "Prosta lista zakupów dla domu.",
};

export default function ShoppingListRoute() {
  return <ShoppingListPage />;
}
