export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const raw = envUrl && envUrl.length > 0 ? envUrl : "http://localhost:3000";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}


