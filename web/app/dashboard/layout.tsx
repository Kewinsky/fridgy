import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardDataProvider } from "@/components/dashboard/dashboard-data-provider";
import { loadDashboardData } from "@/lib/dashboard-data";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) redirect("/login");

  const initialData = await loadDashboardData(supabase, data.claims.sub);

  const email =
    !error && typeof data?.claims?.email === "string"
      ? data.claims.email
      : "Twoje konto";

  return <DashboardDataProvider initialData={initialData}><DashboardShell email={email}>{children}</DashboardShell></DashboardDataProvider>;
}
