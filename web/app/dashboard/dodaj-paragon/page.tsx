import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ReceiptPage } from "@/components/dashboard/receipt-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Receipt");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function AddReceiptPage() {
  return <ReceiptPage />;
}
