import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HomeIcon, LanguagesIcon, PaletteIcon } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { AccountSettings } from "@/components/dashboard/account-settings";
import { AdvancedSettings } from "@/components/dashboard/advanced-settings";
import { PreferenceSettings } from "@/components/dashboard/preference-settings";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";
import { ThemeSettings } from "@/components/dashboard/theme-settings";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import packageJson from "@/package.json";
import { createClient } from "@/lib/supabase/server";
import type { ProfileSettings } from "@/app/dashboard/settings-actions";

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

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />
      <SettingsTabs
        general={
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="app-card p-5">
              <div className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <LanguagesIcon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold">{t("language")}</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {t("languageDescription")}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <LanguageSwitcher />
              </div>
            </section>
            <section className="app-card p-5">
              <div className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <PaletteIcon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-bold">{t("theme")}</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {t("themeDescription")}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <ThemeSettings />
              </div>
            </section>
            <section className="app-card p-5">
              <div className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <HomeIcon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold">{t("householdUi.title")}</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("householdUi.description")}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="font-semibold">{household.name}</span>
                <Badge variant="secondary">{t(household.owner_id === auth.user.id ? "householdUi.owner" : "householdUi.member")}</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {t(household.owner_id === auth.user.id ? "householdUi.ownerRights" : "householdUi.memberRights")}
              </p>
              {household.owner_id !== auth.user.id ? (
                <>
                  <Button type="button" variant="outline" className="mt-5 h-11" disabled>{t("householdUi.leave")}</Button>
                  <p className="mt-2 text-xs text-muted-foreground">{t("householdUi.leaveSoon")}</p>
                </>
              ) : null}
            </section>
            <AdvancedSettings version={packageJson.version} initialSettings={settings} />
          </div>
        }
        account={<AccountSettings key={household.name} email={auth.user.email ?? ""} householdName={household.name} isOwner={household.owner_id === auth.user.id} />}
        preferences={<PreferenceSettings initialSettings={settings} />}
      />
    </>
  );
}
