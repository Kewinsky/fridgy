import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HomeIcon, LanguagesIcon, MapPinIcon, PaletteIcon } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { AccountSettings } from "@/components/dashboard/account-settings";
import { AdvancedSettings } from "@/components/dashboard/advanced-settings";
import { PreferenceSettings } from "@/components/dashboard/preference-settings";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";
import { ThemeSettings } from "@/components/dashboard/theme-settings";
import { LanguageSwitcher } from "@/components/language-switcher";
import packageJson from "@/package.json";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Settings");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function SettingsPage() {
  const t = await getTranslations("Settings");

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
            <section className="app-card divide-y divide-border">
              <Setting
                icon={HomeIcon}
                title={t("household")}
                value={t("yourHome")}
              />
              <Setting icon={MapPinIcon} title={t("region")} value={t("regionValue")} />
            </section>
            <div className="grid gap-5">
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
                    <div className="mt-5">
                      <LanguageSwitcher />
                    </div>
                  </div>
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
            </div>
          </div>
        }
        account={<AccountSettings />}
        preferences={<PreferenceSettings />}
        advanced={<AdvancedSettings version={packageJson.version} />}
      />
    </>
  );
}

function Setting({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof HomeIcon;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 p-5">
      <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}
