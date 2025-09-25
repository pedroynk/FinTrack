
export function normalizeAvatarUrl(url?: string): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("googleusercontent.com")) {
      // downscale to reduce bandwidth / server load
      if (u.search || u.pathname.includes("=")) {
        // patterns like ...=s96-c
        return url.replace(/=s\d+-c$/, "=s48-c");
      }
    }
  } catch {}
  return url;
}
