"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export async function acceptInvitation(token: string) {
  const validToken = z.uuid().parse(token);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect(`/login?next=/invite/${validToken}`);
  const { error: inviteError } = await supabase.rpc("accept_household_invitation", { invite_token: validToken });
  if (inviteError) throw new Error(inviteError.message);
  redirect("/dashboard");
}
