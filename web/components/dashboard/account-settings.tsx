"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DownloadIcon,
  LogOutIcon,
  Trash2Icon,
  UploadIcon,
  UserRoundIcon,
  UserPlusIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  createHouseholdInvitation,
  deleteAccount,
  exportAccountData,
  saveHouseholdName,
  saveUsername,
  signOutEverywhere,
} from "@/app/dashboard/settings-actions";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { getProfileImageSrc, MAX_PROFILE_IMAGE_MB } from "@/lib/profile-image";
import { removeProfileImage, saveProfileImage } from "@/lib/profile-image-storage";

export function AccountSettings({
  email,
  username: initialUsername,
  avatarPath: initialAvatarPath,
  householdName,
  isOwner,
}: {
  email: string;
  username: string;
  avatarPath: string | null;
  householdName: string;
  isOwner: boolean;
}) {
  const t = useTranslations("Settings.account");
  const householdT = useTranslations("Settings.householdUi");
  const common = useTranslations("Common");
  const router = useRouter();
  const [name, setName] = useState(householdName);
  const [savedName, setSavedName] = useState(householdName);
  const [isSavingName, setIsSavingName] = useState(false);
  const [username, setUsername] = useState(initialUsername);
  const [savedUsername, setSavedUsername] = useState(initialUsername);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [avatarPath, setAvatarPath] = useState(initialAvatarPath);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const hasNameChanges = name.trim() !== savedName;
  const hasUsernameChanges = username.trim() !== savedUsername;
  const avatarSrc = getProfileImageSrc(avatarPath);

  async function updateUsername() {
    const nextUsername = username.trim();
    if (!nextUsername || !hasUsernameChanges || isSavingUsername) return;
    setIsSavingUsername(true);
    try {
      await saveUsername(nextUsername);
      setSavedUsername(nextUsername);
      setUsername(nextUsername);
      router.refresh();
      toast.success(common("saved"));
    } catch {
      toast.error(common("saveFailed"));
    } finally {
      setIsSavingUsername(false);
    }
  }

  async function uploadAvatar(file: File) {
    if (isSavingAvatar) return;
    setAvatarError("");
    setIsSavingAvatar(true);
    try {
      const filename = await saveProfileImage(file, avatarPath);
      setAvatarPath(filename);
      router.refresh();
      toast.success(t("avatar.saved"));
    } catch (error) {
      if (error instanceof Error && (error.message === "invalid" || error.message === "tooLarge")) {
        setAvatarError(t(`avatar.errors.${error.message}`, { maxMb: MAX_PROFILE_IMAGE_MB }));
      } else {
        toast.error(common("saveFailed"));
      }
    } finally {
      setIsSavingAvatar(false);
    }
  }

  async function deleteAvatar() {
    if (!avatarPath || isSavingAvatar) return;
    setIsSavingAvatar(true);
    try {
      await removeProfileImage(avatarPath);
      setAvatarPath(null);
      setAvatarError("");
      router.refresh();
      toast.success(t("avatar.removed"));
    } catch {
      toast.error(common("saveFailed"));
    } finally {
      setIsSavingAvatar(false);
    }
  }

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
      <section aria-labelledby="household-settings-heading">
        <h2 id="household-settings-heading" className="text-lg font-bold">
          {t("groups.household")}
        </h2>
        <div className="mt-4 space-y-5">
          <SettingsCard
            title={
              <span className="flex flex-wrap items-center gap-2">
                {t("household.title")}
                {isOwner ? <Badge variant="secondary">{householdT("owner")}</Badge> : null}
              </span>
            }
            description={t("household.description")}
          >
            <Field id="household-name" label={t("household.nameLabel")}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="household-name"
                  className="h-11 min-w-0 flex-1"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  readOnly={!isOwner}
                  disabled={isSavingName}
                  maxLength={100}
                />
                {isOwner ? (
                  <div className="flex shrink-0 justify-end gap-2">
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
              title={t("invite.title")}
              description={t("invite.description")}
            >
              <Field id="invite-email" label={t("invite.emailLabel")}>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="invite-email"
                    className="h-11 min-w-0 flex-1"
                    type="email"
                    placeholder={t("invite.placeholder")}
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                  />
                  <Button
                    type="button"
                    className="h-11 shrink-0"
                    onClick={invite}
                    disabled={!inviteEmail}
                  >
                    <UserPlusIcon aria-hidden="true" /> {t("invite.action")}
                  </Button>
                </div>
                {inviteLink ? (
                  <div className="mt-3 grid gap-2">
                    <Input aria-label={t("invite.linkLabel")} value={inviteLink} disabled />
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
      <section aria-labelledby="account-settings-heading">
        <h2 id="account-settings-heading" className="text-lg font-bold">
          {t("groups.account")}
        </h2>
        <div className="mt-4 space-y-5">
          <SettingsCard
            title={t("avatar.title")}
            description={t("avatar.description")}
          >
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="sr-only"
              aria-label={t("avatar.choose")}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (file) void uploadAvatar(file);
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-primary">
                {avatarSrc ? <Image src={avatarSrc} alt={t("avatar.alt")} fill sizes="48px" className="object-cover" unoptimized /> : <UserRoundIcon className="size-6" aria-hidden="true" />}
              </span>
              <div className="flex shrink-0 gap-2">
                <Button type="button" variant="outline" className="h-11" disabled={isSavingAvatar} onClick={() => avatarInputRef.current?.click()}>
                  <UploadIcon aria-hidden="true" /> {isSavingAvatar ? common("saving") : t(avatarSrc ? "avatar.change" : "avatar.choose")}
                </Button>
                {avatarSrc ? (
                  <Button type="button" variant="outline" className="h-11" disabled={isSavingAvatar} onClick={deleteAvatar}>
                    <Trash2Icon aria-hidden="true" /> {t("avatar.remove")}
                  </Button>
                ) : null}
              </div>
              <span className="text-xs text-muted-foreground">{t("avatar.formats", { maxMb: MAX_PROFILE_IMAGE_MB })}</span>
            </div>
            {avatarError ? <p role="alert" className="mt-2 text-sm text-destructive">{avatarError}</p> : null}
          </SettingsCard>

          <SettingsCard title={t("username.title")} description={t("username.description")}>
            <Field id="account-username" label={t("username.label")}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="account-username"
                  className="h-11 min-w-0 flex-1"
                  autoComplete="nickname"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  disabled={isSavingUsername}
                  maxLength={100}
                />
                <div className="flex shrink-0 justify-end gap-2">
                  {hasUsernameChanges ? (
                    <Button type="button" variant="outline" className="h-11 flex-1 sm:flex-none" disabled={isSavingUsername} onClick={() => setUsername(savedUsername)}>
                      {t("username.cancel")}
                    </Button>
                  ) : null}
                  <Button type="button" className="h-11 flex-1 sm:flex-none" disabled={!hasUsernameChanges || !username.trim() || isSavingUsername} onClick={updateUsername}>
                    {isSavingUsername ? common("saving") : t("username.save")}
                  </Button>
                </div>
              </div>
            </Field>
          </SettingsCard>

          <SettingsCard
            title={t("login.emailLabel")}
            description={t("login.description")}
          >
            <Field id="account-email" label={t("login.emailLabel")}>
              <Input
                id="account-email"
                className="h-11"
                type="email"
                value={email}
                disabled
              />
            </Field>
          </SettingsCard>

          <SettingsCard
            title={t("sessions.title")}
            description={t("sessions.description")}
          >
            <div className="flex justify-end">
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
            </div>
          </SettingsCard>

          <SettingsCard
            title={t("data.title")}
            description={t("data.description")}
          >
            <div className="flex flex-wrap justify-end gap-2">
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
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="app-card grid items-center gap-5 p-5 md:grid-cols-2">
      <div className="min-w-0">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
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
      <Label htmlFor={id} className="sr-only">{label}</Label>
      {children}
    </div>
  );
}
