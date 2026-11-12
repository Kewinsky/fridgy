"use client";

import { useState } from "react";
import { CheckIcon, ChevronDownIcon, HomeIcon, LoaderCircleIcon, PlusIcon, Settings2Icon, SparklesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createHousehold, switchHousehold } from "@/app/dashboard/settings-actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SparklesText } from "@/components/ui/sparkles-text";
import { JoinHouseholdForm } from "@/components/dashboard/join-household-form";
import type { HouseholdOption } from "@/lib/dashboard-data";

export function HouseholdSwitcher({ currentId, households }: { currentId: string; households: HouseholdOption[] }) {
  const t = useTranslations("Navigation");
  const common = useTranslations("Common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [creating, setCreating] = useState(false);
  const current = households.find((household) => household.id === currentId);

  async function changeHousehold(id: string) {
    if (id === currentId || pending) return;
    setPending(true);
    try {
      await switchHousehold(id);
      router.replace("/dashboard");
      router.refresh();
    } catch {
      toast.error(common("saveFailed"));
      setPending(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button type="button" variant="outline" className="h-auto min-h-12 w-full justify-between gap-2 px-3 py-2 text-left font-normal" aria-label={t("selectHousehold")} disabled={pending} />}>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{current?.name}</span>
            <span className="block text-xs text-muted-foreground">{t(current?.isOwner ? "owner" : "member")}</span>
          </span>
          <ChevronDownIcon className="shrink-0 text-muted-foreground" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56">
          {households.map((household) => (
            <DropdownMenuItem key={household.id} onClick={() => void changeHousehold(household.id)} disabled={pending}>
              <span className="min-w-0 flex-1 truncate">{household.name}</span>
              {household.id === currentId ? <CheckIcon aria-hidden="true" /> : null}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <PlusIcon aria-hidden="true" /> {t("addHousehold")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setJoinOpen(true)}>
            <HomeIcon aria-hidden="true" /> {t("join.title")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={(nextOpen) => { if (!creating) setOpen(nextOpen); }}>
        <DialogContent showCloseButton={!creating}>
          <DialogHeader>
            <DialogTitle>{t(creating ? "setupTitle" : "addHousehold")}</DialogTitle>
            <DialogDescription>{t(creating ? "setupDescription" : "addHouseholdDescription")}</DialogDescription>
          </DialogHeader>
          <HouseholdCreationForm onLoadingChange={setCreating} onCreated={() => { setCreating(false); setOpen(false); }} />
        </DialogContent>
      </Dialog>
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("join.title")}</DialogTitle>
            <DialogDescription>{t("join.description")}</DialogDescription>
          </DialogHeader>
          <JoinHouseholdForm onJoined={() => setJoinOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function HouseholdCreationForm({ onCreated, onLoadingChange, onboarding = false }: {
  onCreated?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onboarding?: boolean;
}) {
  const t = useTranslations("Navigation");
  const onboardingT = useTranslations("Dashboard.onboarding");
  const common = useTranslations("Common");
  const router = useRouter();
  const [name, setName] = useState("");
  const [includeDemoData, setIncludeDemoData] = useState(false);
  const [pending, setPending] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const steps = [
    { label: t("setupHousehold"), icon: HomeIcon },
    { label: t("setupSpace"), icon: Settings2Icon },
    ...(includeDemoData ? [{ label: t("setupDemo"), icon: SparklesIcon }] : []),
  ];

  async function addHousehold(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || pending) return;
    setPending(true);
    setProgressStep(0);
    onLoadingChange?.(true);
    const timers = steps.slice(1).map((_, index) => window.setTimeout(() => setProgressStep(index + 1), (index + 1) * 700));
    try {
      await Promise.all([
        createHousehold(name.trim(), includeDemoData),
        new Promise<void>((resolve) => window.setTimeout(resolve, steps.length * 700)),
      ]);
      setProgressStep(steps.length);
      await new Promise<void>((resolve) => window.setTimeout(resolve, 350));
      onCreated?.();
      router.replace("/dashboard");
      router.refresh();
    } catch {
      toast.error(common("saveFailed"));
      setPending(false);
      onLoadingChange?.(false);
    } finally {
      timers.forEach((timer) => window.clearTimeout(timer));
    }
  }

  if (pending) {
    return (
      <div className="space-y-6 py-3">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">{t("setupProgress", { current: Math.min(progressStep + 1, steps.length), total: steps.length })}</p>
          <p role="status" className="text-lg font-bold">{progressStep === steps.length ? t("setupReady") : steps[progressStep].label}</p>
        </div>
        <ol className="space-y-3">
          {steps.map(({ label, icon: Icon }, index) => {
            const done = index < progressStep;
            const active = index === progressStep;
            let marker = <Icon className="size-5" aria-hidden="true" />;
            if (done) marker = <CheckIcon className="size-5" aria-hidden="true" />;
            else if (active) marker = <LoaderCircleIcon className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />;
            return (
              <li key={label} className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${active ? "border-primary/50 bg-primary/10 text-foreground" : "border-border text-muted-foreground"}`}>
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${done || active ? "bg-primary/15 text-primary" : "bg-muted"}`}>
                  {marker}
                </span>
                <span className="font-medium">{label}</span>
              </li>
            );
          })}
        </ol>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${((progressStep + 1) / (steps.length + 1)) * 100}%` }} />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void addHousehold(event)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-household-name" className={onboarding ? "sr-only" : undefined}>{t("householdName")}</Label>
        <Input id="new-household-name" className="h-12" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required autoFocus />
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
        <p id="household-demo-label" className="text-sm font-semibold">{t("sampleDataLabel")}</p>
        <button
          type="button"
          role="switch"
          aria-checked={includeDemoData}
          aria-labelledby="household-demo-label"
          disabled={pending}
          onClick={() => setIncludeDemoData((value) => !value)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 ${includeDemoData ? "bg-primary" : "bg-muted-foreground/40"}`}
        >
          <span className={`absolute top-1 left-1 size-5 rounded-full bg-background shadow-sm transition-transform ${includeDemoData ? "translate-x-5" : ""}`} />
        </button>
      </div>
      {onboarding ? (
        <Button type="submit" className="h-12 w-full text-base" disabled={pending || !name.trim()}>
          {pending ? common("saving") : <SparklesText sparklesCount={5} colors={{ first: "#ffffff", second: "#285b3e" }} className="text-base">{onboardingT("startButton")}</SparklesText>}
        </Button>
      ) : (
        <Button type="submit" className="h-11 w-full" disabled={pending || !name.trim()}>{t("createHousehold")}</Button>
      )}
    </form>
  );
}
