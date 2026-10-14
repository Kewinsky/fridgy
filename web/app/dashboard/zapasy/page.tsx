import type { Metadata } from "next";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";

import { InventoryPage } from "@/components/dashboard/inventory-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Inventory");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export const instant = false;

export default async function InventoryRoute() {
  await connection();
  return <InventoryPage />;
}
