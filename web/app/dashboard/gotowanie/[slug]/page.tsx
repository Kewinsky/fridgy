import type { Metadata } from "next";

import { CookingModePage } from "@/components/dashboard/cooking-mode-page";

export const metadata: Metadata = {
  title: "Tryb gotowania",
  description: "Skupiony widok przepisu krok po kroku.",
};

export default async function CookingModeRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CookingModePage slug={slug} />;
}
