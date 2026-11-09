import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardDataProvider } from "@/components/dashboard/dashboard-data-provider";
import { getCurrentDashboard } from "@/lib/dashboard-data";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { initialData, email, householdName, households } = await getCurrentDashboard();

  return <DashboardDataProvider key={initialData.householdId} initialData={initialData}><DashboardShell email={email} username={initialData.username} avatarPath={initialData.avatarPath} householdName={householdName} householdId={initialData.householdId} households={households}>{children}</DashboardShell></DashboardDataProvider>;
}
