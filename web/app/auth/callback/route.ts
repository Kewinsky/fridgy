import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { safeAuthPath } from "@/lib/auth-next";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedPath = url.searchParams.get("next");
  const next = safeAuthPath(requestedPath);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=oauth", url.origin));
}
