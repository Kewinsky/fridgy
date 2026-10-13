import Link from "next/link";
import { HomeIcon, LeafIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-16 text-foreground">
      <section className="w-full max-w-lg text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-secondary text-primary">
          <LeafIcon className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-wider text-primary">Błąd 404</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Nie znaleźliśmy tej strony</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Adres mógł się zmienić albo strona już nie istnieje. Wróć na stronę główną i spróbuj ponownie.
        </p>
        <Button nativeButton={false} render={<Link href="/" />} className="mt-7 h-11 px-4">
          <HomeIcon aria-hidden="true" /> Wróć na stronę główną
        </Button>
      </section>
    </main>
  );
}
