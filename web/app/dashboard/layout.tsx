import type { ReactNode } from "react";
// import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  // Tymczasowo wyłączone, aby dashboard był dostępny bez logowania.
  // if (error || !data?.claims) {
  //   redirect("/login");
  // }

  const email =
    !error && typeof data?.claims?.email === "string"
      ? data.claims.email
      : "Twoje konto";

  return <DashboardShell email={email}>{children}</DashboardShell>;
}
