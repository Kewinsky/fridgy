import "react-native-url-polyfill/auto";
import "expo-sqlite/localStorage/install";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const serverStorage = {
  getItem: () => null,
  removeItem: () => undefined,
  setItem: () => undefined,
};

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: typeof localStorage === "undefined" ? serverStorage : localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
