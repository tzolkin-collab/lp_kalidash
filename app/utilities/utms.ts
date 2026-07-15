/**
 * Lê uma UTM dos cookies do Utmify ou dos parâmetros da URL
 */
export function getUtmCookie(name: string): string | null {
  if (typeof window === "undefined") return null;

  // Tenta ler dos cookies injetados pelo Utmify (formato utmify_utm_source, etc)
  const prefix = "utmify_";
  const cookieName = prefix + name;
  const match = document.cookie.match(new RegExp("(^| )" + cookieName + "=([^;]+)"));
  if (match) {
    try {
      return decodeURIComponent(match[2]);
    } catch {
      return match[2];
    }
  }

  // Fallback 1: cookies sem prefixo utmify
  const directMatch = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (directMatch) {
    try {
      return decodeURIComponent(directMatch[2]);
    } catch {
      return directMatch[2];
    }
  }

  // Fallback 2: URL Params
  const urlParams = new URLSearchParams(window.location.search);
  const paramVal = urlParams.get(name);
  if (paramVal) return paramVal;

  return null;
}

export interface Utms {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
}

export function captureUtms(): Utms {
  return {
    utmSource: getUtmCookie("utm_source"),
    utmMedium: getUtmCookie("utm_medium"),
    utmCampaign: getUtmCookie("utm_campaign"),
    utmTerm: getUtmCookie("utm_term"),
    utmContent: getUtmCookie("utm_content"),
  };
}
