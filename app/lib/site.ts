const PRODUCTION_SITE_URL = "https://www.1-uplabs.com";
const LOCAL_SITE_URL = "http://localhost:3000";

export function getSiteUrl (): string
{
    const envUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.trim()
        || process.env.NEXTAUTH_URL?.trim();
    const raw = envUrl && envUrl.length > 0
        ? envUrl
        : process.env.NODE_ENV === "production"
            ? PRODUCTION_SITE_URL
            : LOCAL_SITE_URL;

    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}








