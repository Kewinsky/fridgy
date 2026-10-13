import type { Metadata } from "next";

import { CookingPage } from "@/components/dashboard/cooking-page";

export const metadata: Metadata = {
  title: "Co ugotować?",
  description: "Znajdź pomysł na danie z tego, co masz w domu.",
};

export default function CookingRoute() {
  return <CookingPage />;
}
