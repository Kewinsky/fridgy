import { billingSettingsPath } from "./subscription.ts";

export function safeAuthPath(requestedPath: string | undefined | null) {
  if (requestedPath === billingSettingsPath) return requestedPath;
  return requestedPath && /^\/invite\/[0-9a-fA-F-]{36}$/.test(requestedPath)
    ? requestedPath
    : "/dashboard";
}
