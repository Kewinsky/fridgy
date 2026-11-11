"use client";

import { useSyncExternalStore, type ReactNode } from "react";

import { TechnicalStatusPage } from "@/components/technical-status-page";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function OfflineBoundary({ children }: { children: ReactNode }) {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  return online ? children : <TechnicalStatusPage status="offline" />;
}
