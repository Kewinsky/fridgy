import type { Metadata } from "next";
import { connection } from "next/server";

import { InventoryPage } from "@/components/dashboard/inventory-page";

export const metadata: Metadata = {
  title: "Moje zapasy",
  description: "Przeszukuj i porządkuj swoje domowe zapasy.",
};

export const instant = false;

export default async function InventoryRoute() {
  await connection();
  return <InventoryPage />;
}
