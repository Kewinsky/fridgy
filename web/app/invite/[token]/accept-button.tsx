"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { acceptInvitation } from "@/app/invite/[token]/actions";
import { Button } from "@/components/ui/button";

export function AcceptInvitationButton({ token }: { token: string }) {
  const t = useTranslations("Invitation");
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  async function accept() {
    setPending(true);
    setError(false);
    try { await acceptInvitation(token); }
    catch { setError(true); setPending(false); }
  }

  return <>
    {error ? <p role="alert" className="mt-4 text-sm text-destructive">{t("error")}</p> : null}
    <Button type="button" className="mt-6 h-11 w-full" disabled={pending} onClick={accept}>{t("accept")}</Button>
  </>;
}
