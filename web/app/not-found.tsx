import Link from "next/link";
import { HomeIcon, LeafIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("Errors.notFound");
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-16 text-foreground">
      <section className="w-full max-w-lg text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-secondary text-primary">
          <LeafIcon className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-wider text-primary">{t("label")}</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{t("title")}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {t("description")}
        </p>
        <Button nativeButton={false} render={<Link href="/" />} className="mt-7 h-11 px-4">
          <HomeIcon aria-hidden="true" /> {t("action")}
        </Button>
      </section>
    </main>
  );
}
