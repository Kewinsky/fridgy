"use client";

import { useState } from "react";
import { CheckIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createHousehold, switchHousehold } from "@/app/dashboard/settings-actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HouseholdOption } from "@/lib/dashboard-data";

export function HouseholdSwitcher({ currentId, households }: { currentId: string; households: HouseholdOption[] }) {
  const t = useTranslations("Navigation");
  const common = useTranslations("Common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [includeDemoData, setIncludeDemoData] = useState(false);
  const [pending, setPending] = useState(false);
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

  async function addHousehold(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || pending) return;
    setPending(true);
    try {
      await createHousehold(name.trim(), includeDemoData);
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
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addHousehold")}</DialogTitle>
            <DialogDescription>{t("addHouseholdDescription")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void addHousehold(event)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-household-name">{t("householdName")}</Label>
              <Input id="new-household-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required autoFocus />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <p id="household-demo-label" className="text-sm font-semibold">{t("sampleDataLabel")}</p>
                <p id="household-demo-description" className="mt-1 text-xs text-muted-foreground">{t("sampleDataDescription")}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={includeDemoData}
                aria-labelledby="household-demo-label"
                aria-describedby="household-demo-description"
                disabled={pending}
                onClick={() => setIncludeDemoData((value) => !value)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 ${includeDemoData ? "bg-primary" : "bg-muted-foreground/40"}`}
              >
                <span className={`absolute top-1 left-1 size-5 rounded-full bg-background shadow-sm transition-transform ${includeDemoData ? "translate-x-5" : ""}`} />
              </button>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={pending || !name.trim()}>{t("createHousehold")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
