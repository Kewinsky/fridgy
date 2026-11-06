"use client";

import { Settings2Icon, SlidersHorizontalIcon, UserRoundIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsScrollableList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsTabs({
  general,
  account,
  preferences,
}: {
  general: React.ReactNode;
  account: React.ReactNode;
  preferences: React.ReactNode;
}) {
  const t = useTranslations("Settings.tabs");

  return (
    <Tabs defaultValue="general">
      <TabsScrollableList>
        <TabsTrigger value="general" className="h-9 px-3">
          <Settings2Icon aria-hidden="true" /> {t("general")}
        </TabsTrigger>
        <TabsTrigger value="account" className="h-9 px-3">
          <UserRoundIcon aria-hidden="true" /> {t("account")}
        </TabsTrigger>
        <TabsTrigger value="preferences" className="h-9 px-3">
          <SlidersHorizontalIcon aria-hidden="true" /> {t("preferences")}
        </TabsTrigger>
      </TabsScrollableList>

      <TabsContent value="general" className="pt-3">{general}</TabsContent>
      <TabsContent value="account" className="pt-3">{account}</TabsContent>
      <TabsContent value="preferences" className="pt-3">{preferences}</TabsContent>
    </Tabs>
  );
}
