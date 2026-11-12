import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { OfflineBoundary } from "@/components/offline-boundary";
import { Toaster } from "@/components/ui/sonner";
import logo from "../public/brand/logo.png";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    title: {
      default: "Fridgy",
      template: "%s | Fridgy",
    },
    description: t("description"),
    icons: { icon: logo.src, apple: logo.src },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="font-sans" suppressHydrationWarning>
      <body>
        <Script id="fridgy-palette" strategy="beforeInteractive">
          {`try{const palette=localStorage.getItem("fridgy-palette");if(palette==="blue"||palette==="green"||palette==="violet")document.documentElement.dataset.palette=palette}catch{}`}
        </Script>
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <OfflineBoundary>{children}</OfflineBoundary>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
