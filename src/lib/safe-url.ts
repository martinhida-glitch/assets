const ALLOWED_PROTOCOLS = new Set(["https:", "http:"]);

export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function safeCssImageUrl(value: string | null | undefined): string | null {
  const url = safeExternalUrl(value);
  if (!url) return null;
  return url.replace(/["'()\\\n\r]/g, (character) => encodeURIComponent(character));
}
