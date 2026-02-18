import { MAX_WHOIS_FOLLOW } from "@/lib/env";
import { WhoisResult, WhoisAnalyzeResult } from "@/lib/whois/types";
import { getJsonRedisValue, setJsonRedisValue } from "@/lib/server/redis";
import { analyzeWhois } from "@/lib/whois/common_parser";
import { extractDomain } from "@/lib/utils";
import { lookupRdap, convertRdapToWhoisResult } from "@/lib/whois/rdap_client";
import { whoisDomain, whoisIp, whoisAsn } from "whoiser";

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
  /tld is not supported/i,
];

function isIanaFallback(raw: string): boolean {
  return raw.includes("% IANA WHOIS server");
}

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

interface WhoisRawResult {
  raw: string;
  structured: Record<string, any>;
  server: string;
}

function isIPAddress(query: string): boolean {
  return (
    /^(\d{1,3}\.){3}\d{1,3}$/.test(query) ||
    /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/.test(query)
  );
}

function isASNumber(query: string): boolean {
  return /^AS\d+$/i.test(query);
}

async function getLookupWhois(domain: string): Promise<WhoisRawResult> {
  if (isIPAddress(domain)) {
    const data = await whoisIp(domain, { timeout: LOOKUP_TIMEOUT });
    return { raw: (data as any).__raw || "", structured: data as any, server: "ip-whois" };
  }

  if (isASNumber(domain)) {
    const asNum = parseInt(domain.replace(/^AS/i, ""));
    const data = await whoisAsn(asNum, { timeout: LOOKUP_TIMEOUT });
    return { raw: (data as any).__raw || "", structured: data as any, server: "asn-whois" };
  }

  const domainToQuery = extractDomain(domain) || domain;
  const follow = Math.min(Math.max(MAX_WHOIS_FOLLOW, 1), 2) as 1 | 2;
  const data = await whoisDomain(domainToQuery, {
    raw: true,
    follow,
    timeout: LOOKUP_TIMEOUT,
  });

  const servers = Object.keys(data);
  if (servers.length === 0) throw new Error("No WHOIS server responded");

  const lastServer = servers[servers.length - 1];
  const structured = (data as any)[lastServer] || {};
  const rawParts: string[] = [];
  for (const s of servers) {
    const entry = (data as any)[s];
    if (entry?.__raw) rawParts.push(entry.__raw);
  }
  const raw = rawParts.join("\n\n") || "";

  return { raw, structured, server: lastServer };
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
    registrantPhone: pickStr(rdap.registrantPhone, whoisParsed.registrantPhone),
    registrantEmail: pickStr(rdap.registrantEmail, whoisParsed.registrantEmail),
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
    withTimeout(getLookupWhois(domain), LOOKUP_TIMEOUT),
  ]);

  const rdapData =
    rdapSettled.status === "fulfilled" ? rdapSettled.value : null;
  const whoisData =
    whoisSettled.status === "fulfilled" ? whoisSettled.value : null;
  const rdapRaw = rdapData ? JSON.stringify(rdapData, null, 2) : undefined;
  const whoisRawData = whoisData?.raw || null;

  if (rdapData) {
    try {
      let result = await convertRdapToWhoisResult(rdapData, domain);

      if (whoisRawData) {
        if (!isIanaFallback(whoisRawData)) {
          try {
            const whoisParsed = await analyzeWhois(whoisRawData);
            result = mergeResults(result, whoisParsed);
          } catch {}
        }
        result.rawWhoisContent = whoisRawData;
      }
      if (whoisData?.server) {
        result.whoisServer = pickStr(result.whoisServer, whoisData.server);
      }
      result.rawRdapContent = rdapRaw!;

      return {
        time: elapsed(),
        status: true,
        cached: false,
        source: "rdap",
        result,
      };
    } catch {}
  }

  if (whoisRawData) {
    if (isIanaFallback(whoisRawData)) {
      return {
        time: elapsed(),
        status: false,
        cached: false,
        source: "whois",
        error: "No WHOIS/RDAP server available for this TLD",
      };
    }

    try {
      const result = await analyzeWhois(whoisRawData);

      const whoisError = detectWhoisError(whoisRawData);
      if (whoisError || isEmptyResult(result)) {
        return {
          time: elapsed(),
          status: false,
          cached: false,
          source: "whois",
          error: whoisError || "Empty WHOIS response",
        };
      }

      if (whoisData?.server) {
        result.whoisServer = pickStr(result.whoisServer, whoisData.server);
      }
      if (rdapRaw) result.rawRdapContent = rdapRaw;

      return {
        time: elapsed(),
        status: true,
        cached: false,
        source: "whois",
        result,
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
