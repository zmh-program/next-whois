import { MAX_WHOIS_FOLLOW } from "@/lib/env";
import { WhoisResult } from "@/lib/whois/types";
import { getJsonRedisValue, setJsonRedisValue } from "@/lib/server/redis";
import { analyzeWhois } from "@/lib/whois/common_parser";
import { extractDomain } from "@/lib/utils";
import { lookupRdap, convertRdapToWhoisResult } from "@/lib/whois/rdap_client";
import whois from "whois-raw";

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

    try {
      const whoisData = await getLookupRawWhois(
        domain,
        getLookupOptions(domain),
      );
      const result = await analyzeWhois(whoisData);

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
    } catch (whoisError: unknown) {
      const errorMessage =
        whoisError instanceof Error
          ? whoisError.message
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
