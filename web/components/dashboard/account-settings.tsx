"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DatabaseIcon,
  DownloadIcon,
  KeyRoundIcon,
  LogOutIcon,
  MailIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { createHouseholdInvitation, deleteAccount, exportAccountData, saveHouseholdName, signOutEverywhere, transferHouseholdOwnership } from "@/app/dashboard/settings-actions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountSettings({ email, googleConnected, householdName, isOwner }: {
  email: string; googleConnected: boolean; householdName: string; isOwner: boolean;
}) {
  const t = useTranslations("Settings.account");
  const common = useTranslations("Common");
  const [name, setName] = useState(householdName);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");

  async function saveName() {
    try { await saveHouseholdName(name); toast.success(common("saved")); }
    catch { toast.error(common("saveFailed")); }
  }

  async function invite() {
    try {
      const token = await createHouseholdInvitation(inviteEmail);
      setInviteLink(`${window.location.origin}/invite/${token}`);
      toast.success(t("invite.created"));
    } catch { toast.error(common("saveFailed")); }
  }

  async function exportData() {
    try {
      const data = await exportAccountData();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "fridgy-data.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch { toast.error(common("saveFailed")); }
  }

  async function transferOwner() {
    try { await transferHouseholdOwnership(newOwnerEmail); window.location.reload(); }
    catch { toast.error(common("saveFailed")); }
  }

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-2">
        <SettingsCard icon={MailIcon} title={t("login.title")} description={t("login.description")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="account-email" label={t("login.emailLabel")}>
              <Input id="account-email" className="h-11" type="email" value={email} readOnly />
            </Field>
            <Field id="login-method" label={t("login.methodLabel")}>
              <div id="login-method" className="flex min-h-11 items-center rounded-lg border border-input px-3">
                <KeyRoundIcon className="mr-2 size-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm font-medium">{t("login.emailCode")}</span>
              </div>
            </Field>
          </div>
        </SettingsCard>

        <SettingsCard icon={ShieldCheckIcon} title={t("google.title")} description={t("google.description")}>
          <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 rounded-lg border border-input px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{googleConnected ? email : t("google.notConnected")}</p>
              <p className="text-xs text-muted-foreground">Google</p>
            </div>
            <Badge variant="secondary">{googleConnected ? t("google.connected") : t("google.notConnected")}</Badge>
          </div>
        </SettingsCard>

        <SettingsCard icon={UsersIcon} title={t("household.title")} description={t("household.description")}>
          <Field id="household-name" label={t("household.nameLabel")}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input id="household-name" className="h-11" value={name} onChange={(event) => setName(event.target.value)} disabled={!isOwner} />
              <Button type="button" className="h-11 sm:shrink-0" onClick={saveName} disabled={!isOwner}>{t("household.save")}</Button>
            </div>
          </Field>
        </SettingsCard>

        <SettingsCard icon={UserPlusIcon} title={t("invite.title")} description={t("invite.description")}>
          <Field id="invite-email" label={t("invite.emailLabel")}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input id="invite-email" className="h-11" type="email" placeholder={t("invite.placeholder")} value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} disabled={!isOwner} />
              <Button type="button" className="h-11 sm:shrink-0" onClick={invite} disabled={!isOwner || !inviteEmail}>
                <UserPlusIcon aria-hidden="true" /> {t("invite.action")}
              </Button>
            </div>
            {inviteLink ? <div className="mt-3 grid gap-2"><Input aria-label={t("invite.linkLabel")} value={inviteLink} readOnly />
              <Button type="button" variant="outline" onClick={() => void navigator.clipboard.writeText(inviteLink)
                .then(() => toast.success(t("invite.copied")))
                .catch(() => toast.error(common("saveFailed")))}>{t("invite.copy")}</Button></div> : null}
          </Field>
        </SettingsCard>

        {isOwner ? <SettingsCard icon={UsersIcon} title={t("transfer.title")} description={t("transfer.description")}>
          <Field id="transfer-email" label={t("transfer.emailLabel")}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input id="transfer-email" className="h-11" type="email" value={newOwnerEmail} onChange={(event) => setNewOwnerEmail(event.target.value)} placeholder={t("transfer.placeholder")} />
              <Button type="button" variant="outline" className="h-11 sm:shrink-0" onClick={transferOwner} disabled={!newOwnerEmail}>{t("transfer.action")}</Button>
            </div>
          </Field>
        </SettingsCard> : null}

        <SettingsCard icon={LogOutIcon} title={t("sessions.title")} description={t("sessions.description")}>
          <Button type="button" variant="outline" className="h-11" onClick={() => void signOutEverywhere().catch(() => toast.error(common("saveFailed")))}>
            <LogOutIcon aria-hidden="true" /> {t("sessions.action")}
          </Button>
        </SettingsCard>

        <SettingsCard icon={DatabaseIcon} title={t("data.title")} description={t("data.description")}>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="h-11" onClick={exportData}>
              <DownloadIcon aria-hidden="true" /> {t("data.export")}
            </Button>
            <DeleteAccountDialog />
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}

function DeleteAccountDialog() {
  const t = useTranslations("Settings.account.deleteDialog");
  const common = useTranslations("Common");

  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="destructive" className="h-11" />}>
        <Trash2Icon aria-hidden="true" /> {t("open")}
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" className="h-11" />}>
            {t("cancel")}
          </DialogClose>
          <Button type="button" variant="destructive" className="h-11" onClick={() => void deleteAccount()
            .then((result) => { if (result?.error === "has_members") toast.error(t("ownerHasMembers")); })
            .catch(() => toast.error(common("saveFailed")))}>
            <Trash2Icon aria-hidden="true" /> {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof MailIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="app-card p-5">
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
