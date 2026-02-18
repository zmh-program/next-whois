import { MAX_WHOIS_FOLLOW } from "@/lib/env";
import { WhoisResult, WhoisAnalyzeResult } from "@/lib/whois/types";
import { getJsonRedisValue, setJsonRedisValue } from "@/lib/server/redis";
import { analyzeWhois } from "@/lib/whois/common_parser";
import { extractDomain } from "@/lib/utils";
import { lookupRdap, convertRdapToWhoisResult } from "@/lib/whois/rdap_client";
import whois from "whois-raw";

const LOOKUP_TIMEOUT = 15_000;

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
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 0 &&
        !l.startsWith("%") &&
        !l.startsWith("#") &&
        !l.startsWith(">>>") &&
        !l.startsWith("NOTICE") &&
        !l.startsWith("TERMS OF USE"),
    );
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

function isEmptyResult(result: {
  domain: string;
  registrar: string;
  creationDate: string;
  expirationDate: string;
  nameServers: string[];
}): boolean {
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
  return { follow: isDomain ? MAX_WHOIS_FOLLOW : 0 };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

function getLookupRawWhois(domain: string, options?: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      whois.lookup(domain, options, (err: Error, data: string) => {
        if (err) reject(err);
        else resolve(data);
      });
    } catch (e) {
      reject(e);
    }
  });
}

function pickStr(a: string, b: string): string {
  return a && a !== "Unknown" && a !== "" ? a : b;
}

function mergeResults(
  rdap: WhoisAnalyzeResult,
  whoisParsed: WhoisAnalyzeResult,
): WhoisAnalyzeResult {
  return {
    domain: pickStr(rdap.domain, whoisParsed.domain),
    registrar: pickStr(rdap.registrar, whoisParsed.registrar),
    registrarURL: pickStr(rdap.registrarURL, whoisParsed.registrarURL),
    ianaId: pickStr(rdap.ianaId, whoisParsed.ianaId),
    whoisServer: pickStr(rdap.whoisServer, whoisParsed.whoisServer),
    updatedDate: pickStr(rdap.updatedDate, whoisParsed.updatedDate),
    creationDate: pickStr(rdap.creationDate, whoisParsed.creationDate),
    expirationDate: pickStr(rdap.expirationDate, whoisParsed.expirationDate),
    status: rdap.status.length > 0 ? rdap.status : whoisParsed.status,
    nameServers:
      rdap.nameServers.length > 0 ? rdap.nameServers : whoisParsed.nameServers,
    registrantOrganization: pickStr(
      rdap.registrantOrganization,
      whoisParsed.registrantOrganization,
    ),
    registrantProvince: pickStr(
      rdap.registrantProvince,
      whoisParsed.registrantProvince,
    ),
    registrantCountry: pickStr(
      rdap.registrantCountry,
      whoisParsed.registrantCountry,
    ),
    registrantPhone: pickStr(
      rdap.registrantPhone,
      whoisParsed.registrantPhone,
    ),
    registrantEmail: pickStr(
      rdap.registrantEmail,
      whoisParsed.registrantEmail,
    ),
    dnssec: pickStr(rdap.dnssec, whoisParsed.dnssec),
    rawWhoisContent: rdap.rawWhoisContent || whoisParsed.rawWhoisContent,
    rawRdapContent: rdap.rawRdapContent || whoisParsed.rawRdapContent,
    domainAge: rdap.domainAge ?? whoisParsed.domainAge,
    remainingDays: rdap.remainingDays ?? whoisParsed.remainingDays,
    registerPrice: rdap.registerPrice ?? whoisParsed.registerPrice,
    renewPrice: rdap.renewPrice ?? whoisParsed.renewPrice,
    transferPrice: rdap.transferPrice ?? whoisParsed.transferPrice,
    mozDomainAuthority:
      rdap.mozDomainAuthority || whoisParsed.mozDomainAuthority,
    mozPageAuthority: rdap.mozPageAuthority || whoisParsed.mozPageAuthority,
    mozSpamScore: rdap.mozSpamScore || whoisParsed.mozSpamScore,
    cidr: pickStr(rdap.cidr, whoisParsed.cidr),
    inetNum: pickStr(rdap.inetNum, whoisParsed.inetNum),
    inet6Num: pickStr(rdap.inet6Num, whoisParsed.inet6Num),
    netRange: pickStr(rdap.netRange, whoisParsed.netRange),
    netName: pickStr(rdap.netName, whoisParsed.netName),
    netType: pickStr(rdap.netType, whoisParsed.netType),
    originAS: pickStr(rdap.originAS, whoisParsed.originAS),
  };
}

export async function lookupWhoisWithCache(
  domain: string,
): Promise<WhoisResult> {
  const key = `whois:${domain}`;
  const cached = await getJsonRedisValue<WhoisResult>(key);
  if (cached) {
    return { ...cached, time: 0, cached: true };
  }

  const result = await lookupWhois(domain);
  if (result.status) {
    await setJsonRedisValue<WhoisResult>(key, result);
  }

  return { ...result, cached: false };
}

export async function lookupWhois(domain: string): Promise<WhoisResult> {
  const startTime = performance.now();
  const elapsed = () => (performance.now() - startTime) / 1000;

  const [rdapSettled, whoisSettled] = await Promise.allSettled([
    withTimeout(lookupRdap(domain), LOOKUP_TIMEOUT),
    withTimeout(
      getLookupRawWhois(domain, getLookupOptions(domain)),
      LOOKUP_TIMEOUT,
    ),
  ]);

  const rdapData =
    rdapSettled.status === "fulfilled" ? rdapSettled.value : null;
  const whoisRawData =
    whoisSettled.status === "fulfilled" ? whoisSettled.value : null;
  const rdapRaw = rdapData ? JSON.stringify(rdapData, null, 2) : undefined;

  if (rdapData) {
    try {
      let result = await convertRdapToWhoisResult(rdapData, domain);

      if (whoisRawData) {
        try {
          const whoisParsed = await analyzeWhois(whoisRawData);
          result = mergeResults(result, whoisParsed);
        } catch {}
        result.rawWhoisContent = whoisRawData;
      }
      result.rawRdapContent = rdapRaw!;

      return {
        time: elapsed(),
        status: true,
        cached: false,
        source: "rdap",
        result,
        rawWhoisContent: whoisRawData || undefined,
        rawRdapContent: rdapRaw,
      };
    } catch {}
  }

  if (whoisRawData) {
    try {
      const result = await analyzeWhois(whoisRawData);

      if (isEmptyResult(result)) {
        const whoisError = detectWhoisError(whoisRawData);
        if (whoisError) {
          return {
            time: elapsed(),
            status: false,
            cached: false,
            source: "whois",
            error: whoisError,
            rawWhoisContent: whoisRawData,
            rawRdapContent: rdapRaw,
          };
        }
      }

      if (rdapRaw) result.rawRdapContent = rdapRaw;

      return {
        time: elapsed(),
        status: true,
        cached: false,
        source: "whois",
        result,
        rawWhoisContent: whoisRawData,
        rawRdapContent: rdapRaw,
      };
    } catch (parseError: unknown) {
      return {
        time: elapsed(),
        status: false,
        cached: false,
        source: "whois",
        error:
          parseError instanceof Error
            ? parseError.message
            : "Failed to parse WHOIS response",
        rawWhoisContent: whoisRawData,
        rawRdapContent: rdapRaw,
      };
    }
  }

  const rdapError =
    rdapSettled.status === "rejected" ? rdapSettled.reason : null;
  const whoisError =
    whoisSettled.status === "rejected" ? whoisSettled.reason : null;
  return {
    time: elapsed(),
    status: false,
    cached: false,
    error:
      rdapError?.message || whoisError?.message || "Unknown error occurred",
  };
}
