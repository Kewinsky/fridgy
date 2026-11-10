"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { getMyJoinStatus, requestHouseholdJoin } from "@/app/dashboard/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function JoinHouseholdForm({ onJoined }: { onJoined?: () => void }) {
  const t = useTranslations("Navigation.join");
  const common = useTranslations("Common");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await requestHouseholdJoin(code);
      if (result === "invalid") setError(t("invalid"));
      else if (result === "member") {
        toast.info(t("alreadyMember"));
        onJoined?.();
        router.refresh();
      } else setWaiting(true);
    } catch {
      setError(common("saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  const checkStatus = useCallback(async (silent = false) => {
    if (busy) return;
    if (!silent) setBusy(true);
    try {
      const result = await getMyJoinStatus(code);
      if (result === "approved") {
        toast.success(t("approved"));
        onJoined?.();
        router.replace("/dashboard");
        router.refresh();
      } else if (result === "denied") {
        setWaiting(false);
        setCode("");
        setError(t("denied"));
      } else if (!silent) toast.info(t("stillWaiting"));
    } catch {
      if (!silent) toast.error(common("saveFailed"));
    } finally {
      if (!silent) setBusy(false);
    }
  }, [busy, code, common, onJoined, router, t]);

  useEffect(() => {
    if (!waiting) return;
    const timer = window.setInterval(() => void checkStatus(true), 5000);
    return () => window.clearInterval(timer);
  }, [waiting, checkStatus]);

  if (waiting) return (
    <div className="space-y-4 text-center">
      <p className="rounded-xl bg-secondary p-5 text-sm leading-6">{t("waiting")}</p>
      <Button type="button" className="h-11 w-full" onClick={() => void checkStatus()} disabled={busy}>{t("checkStatus")}</Button>
    </div>
  );

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="join-household-code">{t("codeLabel")}</Label>
        <Input id="join-household-code" value={code} onChange={(event) => setCode(event.target.value.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6))}
          maxLength={6} autoComplete="off" autoCapitalize="characters" spellCheck={false} className="h-12 text-center font-mono text-xl tracking-[0.3em]" required />
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      </div>
      <Button type="submit" className="h-11 w-full" disabled={busy || code.length !== 6}>{t("requestAccess")}</Button>
    </form>
  );
}
