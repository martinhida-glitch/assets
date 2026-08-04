import { headers } from "next/headers";

export async function getSiteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // Continúa con las cabeceras de la solicitud.
    }
  }

  const requestHeaders = await headers();
  const rawHost = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const host = rawHost?.split(",", 1)[0]?.trim();
  const rawProtocol = requestHeaders.get("x-forwarded-proto")?.split(",", 1)[0]?.trim();
  const protocol = rawProtocol === "http" || rawProtocol === "https"
    ? rawProtocol
    : host?.includes("localhost") ? "http" : "https";
  if (host && /^[a-z0-9.-]+(?::\d{1,5})?$/i.test(host)) return `${protocol}://${host}`;
  return "http://localhost:3000";
}
