"use client";

import { useState } from "react";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const globalErrorMessages = {
  pl: { label: "Błąd aplikacji", title: "Fridgy nie może się teraz uruchomić", description: "Odśwież aplikację. Jeśli problem nie zniknie, spróbuj ponownie za chwilę.", retry: "Uruchom ponownie" },
  en: { label: "Application error", title: "Fridgy cannot start right now", description: "Refresh the application. If the problem remains, try again in a moment.", retry: "Restart" },
  de: { label: "Anwendungsfehler", title: "Fridgy kann gerade nicht gestartet werden", description: "Aktualisiere die Anwendung. Wenn das Problem bleibt, versuche es gleich noch einmal.", retry: "Neu starten" },
  fr: { label: "Erreur de l'application", title: "Fridgy ne peut pas démarrer pour le moment", description: "Actualisez l'application. Si le problème persiste, réessayez dans un instant.", retry: "Redémarrer" },
  es: { label: "Error de la aplicación", title: "Fridgy no puede iniciarse ahora", description: "Actualiza la aplicación. Si el problema continúa, vuelve a intentarlo en un momento.", retry: "Reiniciar" },
} as const;

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [locale] = useState<keyof typeof globalErrorMessages>(() => {
    if (typeof navigator === "undefined") return "pl";
    const language = navigator.language.slice(0, 2);
    return language in globalErrorMessages ? language as keyof typeof globalErrorMessages : "pl";
  });
  const t = globalErrorMessages[locale];
  return (
    <html lang={locale}>
      <body className="bg-background text-foreground">
        <main className="grid min-h-dvh place-items-center px-4 py-16">
          <section className="w-full max-w-lg text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangleIcon className="size-7" aria-hidden="true" />
            </span>
            <p className="mt-6 text-sm font-bold uppercase tracking-wider text-destructive">{t.label}</p>
            <h1 className="mt-2 text-3xl font-extrabold">{t.title}</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t.description}
            </p>
            <Button className="mt-7 h-11" onClick={reset}><RefreshCwIcon aria-hidden="true" /> {t.retry}</Button>
          </section>
        </main>
      </body>
    </html>
  );
}
