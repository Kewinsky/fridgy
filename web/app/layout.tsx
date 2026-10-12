import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Fridgy",
  description: "Fridgy web application",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className="font-sans">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
