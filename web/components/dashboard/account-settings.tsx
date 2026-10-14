"use client";

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

export function AccountSettings() {
  const t = useTranslations("Settings.account");

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-2">
        <SettingsCard icon={MailIcon} title={t("login.title")} description={t("login.description")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="account-email" label={t("login.emailLabel")}>
              <Input id="account-email" className="h-11" type="email" value="kewin@example.com" readOnly />
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
              <p className="truncate text-sm font-semibold">kewin@example.com</p>
              <p className="text-xs text-muted-foreground">Google</p>
            </div>
            <Badge variant="secondary">{t("google.connected")}</Badge>
          </div>
        </SettingsCard>

        <SettingsCard icon={UsersIcon} title={t("household.title")} description={t("household.description")}>
          <Field id="household-name" label={t("household.nameLabel")}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input id="household-name" className="h-11" defaultValue={t("household.defaultName")} />
              <Button type="button" className="h-11 sm:shrink-0">{t("household.save")}</Button>
            </div>
          </Field>
        </SettingsCard>

        <SettingsCard icon={UserPlusIcon} title={t("invite.title")} description={t("invite.description")}>
          <Field id="invite-email" label={t("invite.emailLabel")}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input id="invite-email" className="h-11" type="email" placeholder={t("invite.placeholder")} />
              <Button type="button" className="h-11 sm:shrink-0">
                <UserPlusIcon aria-hidden="true" /> {t("invite.action")}
              </Button>
            </div>
          </Field>
        </SettingsCard>

        <SettingsCard icon={LogOutIcon} title={t("sessions.title")} description={t("sessions.description")}>
          <Button type="button" variant="outline" className="h-11">
            <LogOutIcon aria-hidden="true" /> {t("sessions.action")}
          </Button>
        </SettingsCard>

        <SettingsCard icon={DatabaseIcon} title={t("data.title")} description={t("data.description")}>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="h-11">
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
          <DialogClose render={<Button type="button" variant="destructive" className="h-11" />}>
            <Trash2Icon aria-hidden="true" /> {t("confirm")}
          </DialogClose>
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
