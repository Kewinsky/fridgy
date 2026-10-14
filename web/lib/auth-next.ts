export function safeAuthPath(requestedPath: string | undefined | null) {
  return requestedPath && /^\/invite\/[0-9a-fA-F-]{36}$/.test(requestedPath)
    ? requestedPath
    : "/dashboard";
}
