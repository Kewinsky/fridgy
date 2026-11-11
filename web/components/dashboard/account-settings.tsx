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
  CrownIcon,
  CopyIcon,
  RefreshCwIcon,
  UsersRoundIcon,
  CircleAlertIcon,
  EllipsisIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  decideHouseholdJoin,
  listHouseholdJoinRequests,
  listHouseholdMembers,
  rotateHouseholdJoinCode,
  deleteAccount,
  exportAccountData,
  saveHouseholdName,
  saveUsername,
  signOutEverywhere,
  transferHouseholdOwnership,
  removeHouseholdMember,
  type HouseholdMember,
  type HouseholdJoinRequest,
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProfileImageSrc, MAX_PROFILE_IMAGE_MB } from "@/lib/profile-image";
import { removeProfileImage, saveProfileImage } from "@/lib/profile-image-storage";
import { createClient } from "@/lib/supabase/client";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { PlanLimitDialog } from "@/components/dashboard/plan-limit-dialog";

export function AccountSettings({
  email,
  username: initialUsername,
  avatarPath: initialAvatarPath,
  householdName,
  householdId,
  isOwner,
  members,
  joinCode: initialJoinCode,
  joinRequests: initialJoinRequests,
  deletionStatus,
}: {
  email: string;
  username: string;
  avatarPath: string | null;
  householdName: string;
  householdId: string;
  isOwner: boolean;
  members: HouseholdMember[];
  joinCode: string;
  joinRequests: HouseholdJoinRequest[];
  deletionStatus: { soloOwnedCount: number; sharedOwnedCount: number };
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
  const [joinCode, setJoinCode] = useState(initialJoinCode);
  const [joinRequests, setJoinRequests] = useState(initialJoinRequests);
  const [memberLimitOpen, setMemberLimitOpen] = useState(false);
  const { subscription, refreshSubscription } = useDashboardData();
  const [joinBusy, setJoinBusy] = useState(false);
  const [rotateOpen, setRotateOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [currentMembers, setCurrentMembers] = useState(members);
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

  async function rotateCode() {
    if (joinBusy) return;
    setJoinBusy(true);
    try {
      setJoinCode(await rotateHouseholdJoinCode(householdId));
      setJoinRequests([]);
      setRotateOpen(false);
      toast.success(t("invite.rotated"));
    } catch {
      toast.error(common("saveFailed"));
    } finally {
      setJoinBusy(false);
    }
  }

  async function decideRequest(requestId: string, approve: boolean) {
    if (joinBusy) return;
    if (approve && subscription.members >= subscription.limits.household_members) {
      setMemberLimitOpen(true);
      return;
    }
    setJoinBusy(true);
    try {
      const result = await decideHouseholdJoin(requestId, approve);
      if (result === "limitReached") { setMemberLimitOpen(true); return; }
      setJoinRequests((current) => current.filter((request) => request.id !== requestId));
      if (approve) setCurrentMembers(await listHouseholdMembers(householdId));
      if (approve) void refreshSubscription().catch(() => {});
      router.refresh();
      toast.success(t(approve ? "invite.approved" : "invite.denied"));
    } catch {
      toast.error(common("saveFailed"));
    } finally {
      setJoinBusy(false);
    }
  }

  async function refreshPeople() {
    if (joinBusy) return;
    setJoinBusy(true);
    try {
      const [requests, members] = await Promise.all([
        listHouseholdJoinRequests(householdId),
        listHouseholdMembers(householdId),
      ]);
      setJoinRequests(requests);
      setCurrentMembers(members);
    } catch {
      toast.error(common("saveFailed"));
    } finally {
      setJoinBusy(false);
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
    <>
    <PlanLimitDialog kind="members" open={memberLimitOpen} onOpenChange={setMemberLimitOpen} />
    <div className="space-y-8">
      <section aria-labelledby="household-settings-heading">
        <h2 id="household-settings-heading" className="text-lg font-bold">
          {t("groups.household")}
        </h2>
        <div className="mt-4 space-y-5">
          <SettingsCard
            title={t("household.title")}
            description={t("household.description")}
          >
            <Field id="household-name" label={t("household.nameLabel")}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="household-name"
                  className="h-11 min-w-0 shrink-0 sm:flex-1"
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
              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  title={t("invite.copy")}
                  aria-label={`${t("invite.copy")}: ${joinCode}`}
                  className="group relative h-11 min-w-32 bg-muted px-3 font-mono text-base font-bold tracking-[0.16em]"
                  onClick={() => void navigator.clipboard.writeText(joinCode).then(() => toast.success(t("invite.copied"))).catch(() => toast.error(common("saveFailed")))}
                >
                  {joinCode}
                  <CopyIcon className="absolute top-1/2 right-2 size-3 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-70 group-focus-visible:opacity-70" aria-hidden="true" />
                </Button>
                <Dialog open={rotateOpen} onOpenChange={setRotateOpen}>
                  <DialogTrigger render={<Button type="button" variant="outline" size="icon" className="size-11" title={t("invite.rotate")} aria-label={t("invite.rotate")} disabled={joinBusy} />}>
                    <RefreshCwIcon aria-hidden="true" />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{t("invite.rotateTitle")}</DialogTitle><DialogDescription>{t("invite.rotateDescription")}</DialogDescription></DialogHeader>
                    <DialogFooter><Button type="button" variant="outline" className="h-11" onClick={() => setRotateOpen(false)}>{t("members.cancel")}</Button><Button type="button" className="h-11" disabled={joinBusy} onClick={() => void rotateCode()}>{t("invite.rotate")}</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </SettingsCard>
          ) : null}
          {isOwner ? (
            <SettingsCard title={t("members.title")} description={t("members.description")}>
              <div className="flex justify-end">
                <Dialog open={peopleOpen} onOpenChange={(open) => {
                  setPeopleOpen(open);
                  if (open) void refreshPeople();
                }}>
                  <DialogTrigger render={<Button type="button" variant="outline" className="h-11" />}>
                    {joinRequests.length ? <CircleAlertIcon className="text-amber-500" aria-hidden="true" /> : <UsersRoundIcon aria-hidden="true" />}
                    {t("members.manage")}
                    {joinRequests.length ? <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-300">{joinRequests.length}<span className="sr-only">{t("invite.pendingTitle")}</span></Badge> : null}
                  </DialogTrigger>
                  <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
                    <DialogHeader className="pr-10">
                      <DialogTitle>{t("members.title")}</DialogTitle>
                      <DialogDescription>{t("members.description")}</DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="members" className="min-h-0">
                      <TabsList className="h-auto! min-h-11 w-full items-stretch">
                        <TabsTrigger value="members" className="h-auto! min-h-10 min-w-0 whitespace-normal px-2 py-2 text-center leading-tight sm:whitespace-nowrap sm:px-3">{t("members.title")} <span className="tabular-nums">{currentMembers.length}</span></TabsTrigger>
                        <TabsTrigger value="requests" className="h-auto! min-h-10 min-w-0 whitespace-normal px-2 py-2 text-center leading-tight sm:whitespace-nowrap sm:px-3">{t("invite.pendingTitle")} <span className="tabular-nums">{joinRequests.length}</span></TabsTrigger>
                      </TabsList>
                      <TabsContent value="members" className="max-h-[60dvh] overflow-y-auto pt-2">
                        <ul className="divide-y divide-border">
                          {currentMembers.map((member) => (
                            <li key={member.user_id} className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0">
                              <div className="min-w-0 flex-1">
                                <p className="flex min-w-0 items-center gap-2 text-sm font-medium">
                                  <span className="min-w-0 break-words sm:truncate">{member.username}</span>
                                  {member.is_owner ? <Badge variant="secondary">{householdT("owner")}</Badge> : null}
                                </p>
                                <p className="break-all text-xs text-muted-foreground sm:truncate">{member.email}</p>
                              </div>
                              {!member.is_owner ? (
                                <MemberActionMenu
                                  member={member}
                                  onTransfer={async () => {
                                    await transferHouseholdOwnership(householdId, member.user_id);
                                    router.refresh();
                                  }}
                                  onRemove={async () => {
                                    await removeHouseholdMember(householdId, member.user_id);
                                    setCurrentMembers((previous) => previous.filter((item) => item.user_id !== member.user_id));
                                    router.refresh();
                                  }}
                                />
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </TabsContent>
                      <TabsContent value="requests" className="max-h-[60dvh] overflow-y-auto pt-2">
                        <div className="mb-3 flex justify-end">
                          <Button type="button" variant="ghost" className="h-11" disabled={joinBusy} onClick={() => void refreshPeople()}>
                            <RefreshCwIcon aria-hidden="true" />{t("invite.refresh")}
                          </Button>
                        </div>
                        {joinRequests.length ? (
                          <ul className="divide-y divide-border">
                            {joinRequests.map((request) => (
                              <li key={request.id} className="flex min-w-0 flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                                <div className="min-w-0 w-full sm:flex-1">
                                  <p className="break-words text-sm font-medium sm:truncate">{request.username}</p>
                                  <p className="break-all text-xs text-muted-foreground sm:truncate">{request.email}</p>
                                </div>
                                <div className="flex w-full gap-2 sm:w-auto">
                                  <Button type="button" className="h-11 flex-1 sm:flex-none" disabled={joinBusy} onClick={() => void decideRequest(request.id, true)}>{t("invite.approve")}</Button>
                                  <Button type="button" variant="outline" className="h-11 flex-1 sm:flex-none" disabled={joinBusy} onClick={() => void decideRequest(request.id, false)}>{t("invite.deny")}</Button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : <p className="py-5 text-center text-sm text-muted-foreground">{t("invite.noRequests")}</p>}
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
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
            <div className="flex flex-wrap items-center justify-end gap-2">
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
                  className="h-11 min-w-0 shrink-0 sm:flex-1"
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
              <DeleteAccountDialog key={`${deletionStatus.soloOwnedCount}-${deletionStatus.sharedOwnedCount}`} deletionStatus={deletionStatus} />
            </div>
          </SettingsCard>
        </div>
      </section>
    </div>
    </>
  );
}

function MemberActionMenu({
  member,
  onTransfer,
  onRemove,
}: {
  member: HouseholdMember;
  onTransfer: () => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const t = useTranslations("Settings.account.members");
  const common = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"transfer" | "remove" | null>(null);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    if (busy || !kind) return;
    setBusy(true);
    try {
      if (kind === "transfer") await onTransfer();
      else await onRemove();
      setOpen(false);
      toast.success(t(`${kind}.success`));
    } catch {
      toast.error(common("saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-lg" className="size-11 shrink-0" aria-label={t("actions", { name: member.username })} />}>
          <EllipsisIcon aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem onClick={() => { setKind("transfer"); setOpen(true); }}><CrownIcon aria-hidden="true" /> {t("transfer.action")}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => { setKind("remove"); setOpen(true); }}><Trash2Icon aria-hidden="true" /> {t("remove.action")}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={(nextOpen) => {
        if (busy) return;
        setOpen(nextOpen);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{kind ? t(`${kind}.title`) : member.username}</DialogTitle>
            <DialogDescription>{kind ? t(`${kind}.description`, { name: member.username }) : null}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" className="h-11" disabled={busy} onClick={() => setOpen(false)}>{t("cancel")}</Button>
            <Button type="button" variant={kind === "remove" ? "destructive" : "default"} className="h-11" disabled={busy || !kind} onClick={() => void confirm()}>{kind ? t(`${kind}.action`) : null}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DeleteAccountDialog({ deletionStatus }: {
  deletionStatus: { soloOwnedCount: number; sharedOwnedCount: number };
}) {
  const t = useTranslations("Settings.account.deleteDialog");
  const common = useTranslations("Common");
  const [isDeleting, setIsDeleting] = useState(false);
  const [blockedByServer, setBlockedByServer] = useState(false);
  const requiresTransfer = deletionStatus.sharedOwnedCount > 0 || blockedByServer;
  let descriptionKey = "memberDescription";
  if (requiresTransfer) descriptionKey = deletionStatus.sharedOwnedCount > 1 ? "transferMultipleDescription" : "transferDescription";
  else if (deletionStatus.soloOwnedCount > 1) descriptionKey = "soloMultipleDescription";
  else if (deletionStatus.soloOwnedCount === 1) descriptionKey = "soloDescription";

  async function confirmDeletion() {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const result = await deleteAccount();
      if (result.error === "has_members") {
        setBlockedByServer(true);
        setIsDeleting(false);
      } else {
        try {
          const { error } = await createClient().auth.signOut({ scope: "local" });
          if (error) console.error("Could not clear deleted account session", error);
        } catch (error) {
          console.error("Could not clear deleted account session", error);
        }
        window.location.replace("/");
      }
    } catch {
      toast.error(common("saveFailed"));
      setIsDeleting(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger
        render={<Button type="button" variant="destructive" className="h-11" />}
      >
        <Trash2Icon aria-hidden="true" /> {t("open")}
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t(requiresTransfer ? "transferTitle" : "title")}</DialogTitle>
          <DialogDescription>{t(descriptionKey)}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={<Button type="button" variant="outline" className="h-11" disabled={isDeleting} />}
          >
            {t(requiresTransfer ? "understood" : "cancel")}
          </DialogClose>
          {!requiresTransfer ? (
            <Button
              type="button"
              variant="destructive"
              className="h-11"
              disabled={isDeleting}
              onClick={() => void confirmDeletion()}
            >
              <Trash2Icon aria-hidden="true" /> {t("confirm")}
            </Button>
          ) : null}
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
