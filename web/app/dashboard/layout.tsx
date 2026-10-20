import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardDataProvider } from "@/components/dashboard/dashboard-data-provider";
import { getCurrentDashboard } from "@/lib/dashboard-data";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { initialData, email } = await getCurrentDashboard();

  return <DashboardDataProvider initialData={initialData}><DashboardShell email={email}>{children}</DashboardShell></DashboardDataProvider>;
}
