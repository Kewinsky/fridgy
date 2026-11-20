import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardDataProvider } from "@/components/dashboard/dashboard-data-provider";
import { HouseholdOnboarding } from "@/components/dashboard/household-onboarding";
import { SubscriptionProvider } from "@/components/dashboard/subscription-provider";
import { getCurrentDashboard } from "@/lib/dashboard-data";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const dashboard = await getCurrentDashboard();
  if (!dashboard) return <HouseholdOnboarding />;
  const { initialData, email, householdName, households, isHouseholdOwner } =
    dashboard;

  return (
    <DashboardDataProvider
      key={initialData.householdId}
      initialData={initialData}
      isHouseholdOwner={isHouseholdOwner}
    >
      <SubscriptionProvider
        isOwner={isHouseholdOwner}
        householdName={householdName}
      >
        <DashboardShell
          email={email}
          username={initialData.username}
          avatarPath={initialData.avatarPath}
          householdName={householdName}
          householdId={initialData.householdId}
          households={households}
        >
          {children}
        </DashboardShell>
      </SubscriptionProvider>
    </DashboardDataProvider>
  );
}
