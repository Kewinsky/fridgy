import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { InventoryPage } from "@/components/dashboard/inventory-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Inventory");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function InventoryRoute({ searchParams }: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const tab = (await searchParams).tab === "consumed" ? "consumed" : "active";
  return <InventoryPage initialTab={tab} />;
}
