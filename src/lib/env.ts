export const VERSION = "1.5";

export const HISTORY_LIMIT: number = intEnv("NEXT_PUBLIC_HISTORY_LIMIT", -1);

export const MAX_WHOIS_FOLLOW = intEnv("NEXT_PUBLIC_MAX_WHOIS_FOLLOW", 0);

// Moz API Configuration
export const MOZ_ACCESS_ID = strEnv("MOZ_ACCESS_ID");
export const MOZ_SECRET_KEY = strEnv("MOZ_SECRET_KEY");

// The maximum number of history items to keep in the local storage

// The maximum number of detailed results to follow
// Set 0: Where possible don't follow the detailed results to improve efficiency
// And follow 0 can solve the problem of `whois.dnspod.com connection refused`

function intEnv(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (!value) return defaultValue;

  const parsed = parseInt(value);
  if (isNaN(parsed)) return defaultValue;

  return parsed;
}

export function strEnv(name: string, defaultValue?: string): string {
  return process.env[name] || defaultValue || "";
}
