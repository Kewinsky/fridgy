import type { Metadata } from "next";

import { CustomRecipePage } from "@/components/dashboard/custom-recipe-page";

export const metadata: Metadata = {
  title: "Twój przepis",
};

export default async function CustomRecipeRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CustomRecipePage slug={slug} />;
}
