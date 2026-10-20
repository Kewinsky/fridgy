import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { InventoryPage } from "@/components/dashboard/inventory-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Inventory");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function InventoryRoute() {
  return <InventoryPage />;
}
