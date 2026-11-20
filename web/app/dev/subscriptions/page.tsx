import { notFound } from "next/navigation";
import { SubscriptionPreview } from "@/components/dashboard/subscription-preview";

export const metadata = { robots: { index: false, follow: false } };

export default function SubscriptionPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <SubscriptionPreview />;
}
