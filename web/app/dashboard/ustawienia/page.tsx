import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/dashboard/page-header";
import { AccountSettings } from "@/components/dashboard/account-settings";
import { AdvancedSettings } from "@/components/dashboard/advanced-settings";
import { PreferenceSettings } from "@/components/dashboard/preference-settings";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";
import { ThemeSettings } from "@/components/dashboard/theme-settings";
import { LanguageSwitcher } from "@/components/language-switcher";
import packageJson from "@/package.json";
import { createClient } from "@/lib/supabase/server";
import type { ProfileSettings } from "@/app/dashboard/settings-actions";
import { getHouseholdJoinCode, listHouseholdJoinRequests, listHouseholdMembers } from "@/app/dashboard/settings-actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Settings");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function SettingsPage() {
  const t = await getTranslations("Settings");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: profile, error } = await supabase.from("profiles")
    .select("*").eq("user_id", auth.user.id).single();
  if (error || !profile) throw new Error("Could not load settings");
  const { data: household, error: householdError } = await supabase.from("households")
    .select("name,owner_id").eq("id", profile.household_id).single();
  if (householdError || !household) throw new Error("Could not load household");
  const settings = profile as ProfileSettings;
  const isOwner = household.owner_id === auth.user.id;
  const [members, joinCode, joinRequests, ownedResult] = await Promise.all([
    isOwner ? listHouseholdMembers(profile.household_id) : Promise.resolve([]),
    isOwner ? getHouseholdJoinCode(profile.household_id) : Promise.resolve(""),
    isOwner ? listHouseholdJoinRequests(profile.household_id) : Promise.resolve([]),
    supabase.from("households").select("id").eq("owner_id", auth.user.id),
  ]);
  if (ownedResult.error) throw new Error("Could not load owned households");
  const memberCounts = await Promise.all((ownedResult.data ?? []).map(async (owned) => {
    if (owned.id === profile.household_id) return members.length;
    return (await listHouseholdMembers(owned.id)).length;
  }));
  const deletionStatus = {
    soloOwnedCount: memberCounts.filter((count) => count <= 1).length,
    sharedOwnedCount: memberCounts.filter((count) => count > 1).length,
  };

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />
      <SettingsTabs
        general={
          <div className="space-y-5">
            <section className="app-card grid items-center gap-5 p-5 md:grid-cols-2">
              <div className="min-w-0">
                <h2 className="text-sm font-medium">{t("language")}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("languageDescription")}</p>
              </div>
              <div className="flex min-w-0 justify-end">
                <LanguageSwitcher />
              </div>
            </section>
            <section className="app-card grid items-center gap-5 p-5 md:grid-cols-2">
              <div className="min-w-0">
                <h2 className="text-sm font-medium">{t("theme")}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("themeDescription")}</p>
              </div>
              <div className="min-w-0">
                <ThemeSettings />
              </div>
            </section>
            <AdvancedSettings version={packageJson.version} initialSettings={settings} isHouseholdOwner={household.owner_id === auth.user.id} />
          </div>
        }
        account={<AccountSettings key={profile.household_id} email={auth.user.email ?? ""} username={String(profile.username)} avatarPath={typeof profile.avatar_path === "string" ? profile.avatar_path : null} householdId={profile.household_id} householdName={household.name} isOwner={isOwner} members={members} joinCode={joinCode} joinRequests={joinRequests} deletionStatus={deletionStatus} />}
        preferences={<PreferenceSettings initialSettings={settings} />}
      />
    </>
  );
}
