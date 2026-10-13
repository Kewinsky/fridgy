import type { Metadata } from "next";

import { ReceiptPage } from "@/components/dashboard/receipt-page";

export const metadata: Metadata = {
  title: "Dodaj paragon",
  description: "Dodaj produkty do zapasów na podstawie paragonu.",
};

export default function AddReceiptPage() {
  return <ReceiptPage />;
}
