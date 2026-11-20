"use client";

import {
  CreditCardIcon,
  Settings2Icon,
  SlidersHorizontalIcon,
  UserRoundIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import {
  Tabs,
  TabsContent,
  TabsScrollableList,
  TabsTrigger,
} from "@/components/ui/tabs";

export function SettingsTabs({
  general,
  account,
  preferences,
  billing,
}: {
  general: React.ReactNode;
  account: React.ReactNode;
  preferences: React.ReactNode;
  billing: React.ReactNode;
}) {
  const t = useTranslations("Settings.tabs");
  const billingT = useTranslations("Billing");
  const activeTab = useSearchParams().get("tab");
  let tab = "general";
  if (
    activeTab &&
    ["general", "account", "preferences", "billing"].includes(activeTab)
  )
    tab = activeTab;

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", String(value));
        window.history.replaceState(null, "", url);
      }}
    >
      <TabsScrollableList className="h-auto! min-h-12">
        <TabsTrigger value="general" className="min-h-11 px-3">
          <Settings2Icon aria-hidden="true" /> {t("general")}
        </TabsTrigger>
        <TabsTrigger value="account" className="min-h-11 px-3">
          <UserRoundIcon aria-hidden="true" /> {t("account")}
        </TabsTrigger>
        <TabsTrigger value="preferences" className="min-h-11 px-3">
          <SlidersHorizontalIcon aria-hidden="true" /> {t("preferences")}
        </TabsTrigger>
        <TabsTrigger value="billing" className="min-h-11 px-3">
          <CreditCardIcon aria-hidden="true" /> {billingT("planAndBilling")}
        </TabsTrigger>
      </TabsScrollableList>

      <TabsContent value="general" className="pt-3">
        {general}
      </TabsContent>
      <TabsContent value="account" className="pt-3">
        {account}
      </TabsContent>
      <TabsContent value="preferences" className="pt-3" keepMounted>
        {preferences}
      </TabsContent>
      <TabsContent value="billing" className="pt-3">
        {billing}
      </TabsContent>
    </Tabs>
  );
}
