import type { IncomingMessage } from "http";
import { strEnv } from "@/lib/env";

export const siteTitle = strEnv(
  "NEXT_PUBLIC_SITE_TITLE",
  "Next Whois - Easily Lookup Whois Information",
);
export const siteDescription = strEnv(
  "NEXT_PUBLIC_SITE_DESCRIPTION",
  "\u{1f9ea} Your Next Generation Of Whois Lookup Tool With Modern UI. Support Domain/IPv4/IPv6/ASN/CIDR Whois Lookup And Powerful Features.",
);
export const siteKeywords = strEnv(
  "NEXT_PUBLIC_SITE_KEYWORDS",
  "Whois, Lookup, Tool, Next Whois",
);

const configuredUrl = strEnv("NEXT_PUBLIC_SITE_URL", "");

export function getOrigin(req?: IncomingMessage): string {
  if (configuredUrl) return configuredUrl;
  if (!req) return "";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  return host ? `${proto}://${host}` : "";
}
