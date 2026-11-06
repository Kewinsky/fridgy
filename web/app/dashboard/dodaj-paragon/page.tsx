import { permanentRedirect } from "next/navigation";

export default function LegacyReceiptRedirect() {
  permanentRedirect("/dashboard/dodaj-produkty");
}
