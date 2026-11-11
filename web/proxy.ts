import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { maintenanceAction } from "@/lib/maintenance";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const action = maintenanceAction(request.nextUrl.pathname, request.method, process.env.FRIDGY_MAINTENANCE_MODE === "true");
  if (action === "bypass") return NextResponse.next();
  if (action === "unavailable") return NextResponse.json({ error: "maintenance" }, { status: 503, headers: { "Retry-After": "300", "Cache-Control": "no-store" } });
  if (action === "redirect") return NextResponse.redirect(new URL("/maintenance", request.url), { status: 307, headers: { "Cache-Control": "no-store" } });
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
