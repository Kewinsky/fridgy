"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DatabaseIcon,
  DownloadIcon,
  LogOutIcon,
  MailIcon,
  Trash2Icon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  createHouseholdInvitation,
  deleteAccount,
  exportAccountData,
  saveHouseholdName,
  signOutEverywhere,
} from "@/app/dashboard/settings-actions";

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

export function AccountSettings({
  email,
  householdName,
  isOwner,
}: {
  email: string;
  householdName: string;
  isOwner: boolean;
}) {
  const t = useTranslations("Settings.account");
  const common = useTranslations("Common");
  const router = useRouter();
  const [name, setName] = useState(householdName);
  const [savedName, setSavedName] = useState(householdName);
  const [isSavingName, setIsSavingName] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const hasNameChanges = name.trim() !== savedName;

  async function saveName() {
    const nextName = name.trim();
    if (!isOwner || !nextName || !hasNameChanges || isSavingName) return;
    setIsSavingName(true);
    try {
      await saveHouseholdName(nextName);
      setSavedName(nextName);
      setName(nextName);
      router.refresh();
      toast.success(common("saved"));
    } catch {
      toast.error(common("saveFailed"));
    } finally {
      setIsSavingName(false);
    }
  }

  async function invite() {
    try {
      const token = await createHouseholdInvitation(inviteEmail);
      setInviteLink(`${window.location.origin}/invite/${token}`);
      toast.success(t("invite.created"));
    } catch {
      toast.error(common("saveFailed"));
    }
  }

  async function exportData() {
    try {
      const data = await exportAccountData();
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "fridgy-data.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(common("saveFailed"));
    }
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="account-settings-heading">
        <h2 id="account-settings-heading" className="text-lg font-bold">
          {t("groups.account")}
        </h2>
        <div className="mt-4 grid items-start gap-5 lg:grid-cols-2">
          <SettingsCard
            icon={MailIcon}
            title={t("login.title")}
            description={t("login.description")}
          >
            <Field id="account-email" label={t("login.emailLabel")}>
              <Input
                id="account-email"
                className="h-11"
                type="email"
                value={email}
                readOnly
              />
            </Field>
          </SettingsCard>

          <SettingsCard
            icon={LogOutIcon}
            title={t("sessions.title")}
            description={t("sessions.description")}
          >
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() =>
                void signOutEverywhere().catch(() =>
                  toast.error(common("saveFailed")),
                )
              }
            >
              <LogOutIcon aria-hidden="true" /> {t("sessions.action")}
            </Button>
          </SettingsCard>

          <SettingsCard
            icon={DatabaseIcon}
            title={t("data.title")}
            description={t("data.description")}
          >
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={exportData}
              >
                <DownloadIcon aria-hidden="true" /> {t("data.export")}
              </Button>
              <DeleteAccountDialog />
            </div>
          </SettingsCard>
        </div>
      </section>

      <section aria-labelledby="household-settings-heading">
        <h2 id="household-settings-heading" className="text-lg font-bold">
          {t("groups.household")}
        </h2>
        <div className="mt-4 grid items-start gap-5 lg:grid-cols-2">
          <SettingsCard
            icon={UsersIcon}
            title={t("household.title")}
            description={t("household.description")}
          >
            <Field id="household-name" label={t("household.nameLabel")}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="household-name"
                  className="h-11 sm:min-w-0 sm:flex-1"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  readOnly={!isOwner}
                  disabled={isSavingName}
                  maxLength={100}
                />
                {isOwner ? (
                  <div className="flex gap-2">
                    {hasNameChanges ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 flex-1 sm:flex-none"
                        onClick={() => setName(savedName)}
                        disabled={isSavingName}
                      >
                        {t("household.cancel")}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      className="h-11 flex-1 sm:flex-none"
                      onClick={saveName}
                      disabled={!hasNameChanges || !name.trim() || isSavingName}
                    >
                      {t("household.save")}
                    </Button>
                  </div>
                ) : null}
              </div>
            </Field>
          </SettingsCard>

          {isOwner ? (
            <SettingsCard
              icon={UserPlusIcon}
              title={t("invite.title")}
              description={t("invite.description")}
            >
            <Field id="invite-email" label={t("invite.emailLabel")}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="invite-email"
                  className="h-11"
                  type="email"
                  placeholder={t("invite.placeholder")}
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                />
                <Button
                  type="button"
                  className="h-11 sm:shrink-0"
                  onClick={invite}
                  disabled={!inviteEmail}
                >
                  <UserPlusIcon aria-hidden="true" /> {t("invite.action")}
                </Button>
              </div>
              {inviteLink ? (
                <div className="mt-3 grid gap-2">
                  <Input
                    aria-label={t("invite.linkLabel")}
                    value={inviteLink}
                    disabled
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      void navigator.clipboard
                        .writeText(inviteLink)
                        .then(() => toast.success(t("invite.copied")))
                        .catch(() => toast.error(common("saveFailed")))
                    }
                  >
                    {t("invite.copy")}
                  </Button>
                </div>
              ) : null}
            </Field>
            </SettingsCard>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function DeleteAccountDialog() {
  const t = useTranslations("Settings.account.deleteDialog");
  const common = useTranslations("Common");

  return (
    <Dialog>
      <DialogTrigger
        render={<Button type="button" variant="destructive" className="h-11" />}
      >
        <Trash2Icon aria-hidden="true" /> {t("open")}
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={<Button type="button" variant="outline" className="h-11" />}
          >
            {t("cancel")}
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            className="h-11"
            onClick={() =>
              void deleteAccount()
                .then((result) => {
                  if (result?.error === "has_members")
                    toast.error(t("ownerHasMembers"));
                })
                .catch(() => toast.error(common("saveFailed")))
            }
          >
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
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
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
