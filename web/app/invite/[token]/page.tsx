import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { AcceptInvitationButton } from "@/app/invite/[token]/accept-button";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!z.uuid().safeParse(token).success) notFound();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/login?next=/invite/${token}`);
  const t = await getTranslations("Invitation");

  return <main className="flex min-h-dvh items-center justify-center p-5">
    <section className="app-card w-full max-w-md p-7 text-center">
      <h1 className="text-2xl font-extrabold">{t("title")}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{t("description")}</p>
      <AcceptInvitationButton token={token} />
    </section>
  </main>;
}
