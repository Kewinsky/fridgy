import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type PropsWithChildren, useEffect, useState } from "react";
import { AppState, Platform } from "react-native";

import { supabase } from "@/lib/supabase";

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    if (AppState.currentState === "active") {
      supabase.auth.startAutoRefresh();
    }

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => {
      subscription.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
