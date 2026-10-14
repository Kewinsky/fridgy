import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ShoppingListPage } from "@/components/dashboard/shopping-list-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ShoppingList");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function ShoppingListRoute() {
  return <ShoppingListPage />;
}
