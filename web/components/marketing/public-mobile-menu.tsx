"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PublicMobileMenu() {
  const t = useTranslations("Marketing");
  return (
    <div className="lg:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              className="size-11"
              aria-label={t("mainNav")}
            />
          }
        >
          <MenuIcon className="size-5" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={12}
          className="marketing marketing-mobile-menu min-w-60 p-2"
        >
          <DropdownMenuItem render={<Link href="/#jak-to-dziala" />}>
            {t("howItWorks")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/cennik" />}>
            {t("pricing")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/faq" />}>FAQ</DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/kontakt" />}>
            {t("contact")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/login" />}>
            {t("startFree")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
