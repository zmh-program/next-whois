import { MAX_WHOIS_FOLLOW } from "@/lib/env";
import { WhoisResult } from "@/lib/whois/types";
import { getJsonRedisValue, setJsonRedisValue } from "@/lib/server/redis";
import { analyzeWhois } from "@/lib/whois/common_parser";
import { extractDomain } from "@/lib/utils";
import { lookupRdap, convertRdapToWhoisResult } from "@/lib/whois/rdap_client";
import whois from "whois-raw";

const WHOIS_ERROR_PATTERNS = [
  /no match/i,
  /not found/i,
  /no data found/i,
  /no entries found/i,
  /no object found/i,
  /nothing found/i,
  /invalid query/i,
  /error:/i,
  /malformed/i,
  /object does not exist/i,
  /domain not found/i,
  /status:\s*free/i,
  /status:\s*available/i,
  /is available for/i,
  /no whois information/i,
];

function detectWhoisError(raw: string): string | null {
  const lines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith("%") && !l.startsWith("#") && !l.startsWith(">>>") && !l.startsWith("NOTICE") && !l.startsWith("TERMS OF USE"));
  if (lines.length === 0) return "Empty WHOIS response";

  for (const pattern of WHOIS_ERROR_PATTERNS) {
    const match = raw.match(pattern);
    if (match) {
      const matchLine = raw.split("\n").find((l) => pattern.test(l));
      return matchLine?.trim() || match[0];
    }
  }
  return null;
}

function isEmptyResult(result: { domain: string; registrar: string; creationDate: string; expirationDate: string; nameServers: string[] }): boolean {
  return (
    (!result.domain || result.domain === "") &&
    result.registrar === "Unknown" &&
    result.creationDate === "Unknown" &&
    result.expirationDate === "Unknown" &&
    result.nameServers.length === 0
  );
}

function getLookupOptions(domain: string) {
  const isDomain = !!extractDomain(domain);
  return {
    follow: isDomain ? MAX_WHOIS_FOLLOW : 0,
  };
}

function getLookupRawWhois(domain: string, options?: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      whois.lookup(domain, options, (err: Error, data: string) => {
        if (err) {
          // reject err like tld error
          reject(err);
        } else {
          resolve(data);
        }
      });
    } catch (e) {
      // reject err like connection error
      reject(e);
    }
  });
}

export async function lookupWhoisWithCache(
  domain: string,
): Promise<WhoisResult> {
  const key = `whois:${domain}`;
  const cached = await getJsonRedisValue<WhoisResult>(key);
  if (cached) {
    return {
      ...cached,
      time: 0,
      cached: true,
    };
  }

  const result = await lookupWhois(domain);
  if (result.status) {
    await setJsonRedisValue<WhoisResult>(key, result);
  }

  return {
    ...result,
    cached: false,
  };
}

export async function lookupWhois(domain: string): Promise<WhoisResult> {
  const startTime = performance.now();

  try {
    const rdapData = await lookupRdap(domain);
    const result = await convertRdapToWhoisResult(rdapData, domain);

    try {
      result.rawWhoisContent = await getLookupRawWhois(
        domain,
        getLookupOptions(domain),
      );
    } catch {}

    return {
      time: (performance.now() - startTime) / 1000,
      status: true,
      cached: false,
      source: "rdap",
      result,
    };
  } catch (rdapError: unknown) {
    console.log("RDAP lookup failed, fallback to WHOIS:", rdapError);

    let whoisRawData: string | undefined;
    try {
      whoisRawData = await getLookupRawWhois(
        domain,
        getLookupOptions(domain),
      );
    } catch {}

    if (whoisRawData) {
      try {
        const result = await analyzeWhois(whoisRawData);

        if (isEmptyResult(result)) {
          const whoisError = detectWhoisError(whoisRawData);
          if (whoisError) {
            return {
              time: (performance.now() - startTime) / 1000,
              status: false,
              cached: false,
              source: "whois",
              error: whoisError,
              rawWhoisContent: whoisRawData,
            };
          }
        }

        try {
          const rdapData = await lookupRdap(domain);
          result.rawRdapContent = JSON.stringify(rdapData, null, 2);
        } catch {}

        return {
          time: (performance.now() - startTime) / 1000,
          status: true,
          cached: false,
          source: "whois",
          result,
        };
      } catch (parseError: unknown) {
        const errorMessage =
          parseError instanceof Error
            ? parseError.message
            : "Failed to parse WHOIS response";
        return {
          time: (performance.now() - startTime) / 1000,
          status: false,
          cached: false,
          source: "whois",
          error: errorMessage,
          rawWhoisContent: whoisRawData,
        };
      }
    } else {
      const errorMessage =
        rdapError instanceof Error
          ? rdapError.message
          : "Unknown error occurred";
      return {
        time: (performance.now() - startTime) / 1000,
        status: false,
        cached: false,
        source: "whois",
        error: errorMessage,
      };
    }
  }
}
