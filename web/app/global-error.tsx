"use client";

import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pl">
      <body className="bg-background text-foreground">
        <main className="grid min-h-dvh place-items-center px-4 py-16">
          <section className="w-full max-w-lg text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangleIcon className="size-7" aria-hidden="true" />
            </span>
            <p className="mt-6 text-sm font-bold uppercase tracking-wider text-destructive">Błąd aplikacji</p>
            <h1 className="mt-2 text-3xl font-extrabold">Fridgy nie może się teraz uruchomić</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Odśwież aplikację. Jeśli problem nie zniknie, spróbuj ponownie za chwilę.
            </p>
            <Button className="mt-7 h-11" onClick={reset}><RefreshCwIcon aria-hidden="true" /> Uruchom ponownie</Button>
          </section>
        </main>
      </body>
    </html>
  );
}
