export function maintenanceAction(pathname: string, method: string, enabled: boolean) {
  if (pathname === "/maintenance" || pathname === "/offline") return "bypass";
  if (!enabled) return "continue";
  if (pathname.startsWith("/api/") || (method !== "GET" && method !== "HEAD")) return "unavailable";
  return "redirect";
}
