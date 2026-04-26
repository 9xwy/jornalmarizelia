export const MAX_URL_LENGTH = 2048;

function removeControlCharacters(value: string) {
  return Array.from(value)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return !(code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31) || code === 127);
    })
    .join("");
}

function getUrlBase() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "https://example.com";
}

export function sanitizeSingleLineText(value: string, maxLength: number) {
  return removeControlCharacters(value).replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function sanitizeMultilineText(value: string, maxLength: number) {
  return removeControlCharacters(value.replace(/\r\n?/g, "\n"))
    .replace(/[^\S\n]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeExternalUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) {
    return null;
  }

  const isRelativeUrl = trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../");
  if (isRelativeUrl) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed, getUrlBase());
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    if (parsed.username || parsed.password) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

export function coerceAllowedValue(value: string | null | undefined, allowedValues: readonly string[], fallback: string) {
  return typeof value === "string" && allowedValues.includes(value) ? value : fallback;
}
