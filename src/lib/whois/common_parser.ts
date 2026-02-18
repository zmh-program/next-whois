import {
  DomainStatusProps,
  initialWhoisAnalyzeResult,
  WhoisAnalyzeResult,
} from "@/lib/whois/types";
import { includeArgs } from "@/lib/utils";
import moment from "moment";
import { getMozMetrics } from "@/lib/moz/client";
import { getDomainPricing } from "@/lib/pricing/client";

function analyzeDomainStatus(status: string): DomainStatusProps {
  const segments = status.split(" ");
  let url = segments.slice(1).join(" ");

  url.startsWith("(") && url.endsWith(")") && (url = url.slice(1, -1));
  return {
    status: segments[0],
    url,
  };
}

function analyzeTime(time: string): string {
  if (!time || time.length === 0) return time;

  try {
    const date = new Date(time.replace("<", "").replace(">", "").trim());
    return date.toISOString();
  } catch (e) {
    return time;
  }
}

function calculateDomainAge(creationDate: string): number {
  if (creationDate === "Unknown") return 0;

  const created = moment(creationDate);
  const now = moment();

  return now.diff(created, "years");
}

function calculateRemainingDays(expirationDate: string): number {
  if (expirationDate === "Unknown") return 0;

  const expiry = moment(expirationDate);
  const now = moment();

  return Math.max(0, expiry.diff(now, "days"));
}

export async function applyParams(result: WhoisAnalyzeResult) {
  // Calculate domain age and remaining days
  result.domainAge =
    !result.creationDate || result.creationDate === "Unknown"
      ? null
      : calculateDomainAge(result.creationDate);
  result.remainingDays =
    !result.expirationDate || result.expirationDate === "Unknown"
      ? null
      : calculateRemainingDays(result.expirationDate);

  // Get pricing information
  result.registerPrice = await getDomainPricing(result.domain, "new");
  result.renewPrice = await getDomainPricing(result.domain, "renew");
  result.transferPrice = await getDomainPricing(result.domain, "transfer");

  // Get Moz metrics
  const mozMetrics = await getMozMetrics(result.domain);
  result.mozDomainAuthority = mozMetrics.domainAuthority;
  result.mozPageAuthority = mozMetrics.pageAuthority;
  result.mozSpamScore = mozMetrics.spamScore;

  return result;
}

export async function analyzeWhois(data: string): Promise<WhoisAnalyzeResult> {
  const lines = data
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const result: WhoisAnalyzeResult = {
    ...initialWhoisAnalyzeResult,
    status: [],
    nameServers: [],
    rawWhoisContent: data,
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    let key: string;
    let value: string;

    const bracketMatch = line.match(/^(?:[a-z]\.\s*)?\[(.+?)\]\s+(.+)/);
    if (bracketMatch) {
      key = bracketMatch[1].trim().toLowerCase();
      value = bracketMatch[2].trim();
    } else {
      let segments = line.split(":");
      if (segments.length < 2) continue;
      if (segments.length >= 3 && segments[0].toLowerCase() === "network") {
        segments = segments.slice(1);
      }
      key = segments[0].trim().toLowerCase();
      value = segments.slice(1).join(":").trim();
    }

    switch (key) {
      case "domain name":
      case "domain":
        result.domain = value;
        break;
      case "registrar":
      case "authorized agency":
      case "sponsoring registrar":
        result.registrar = value;
        break;
      case "registrar url":
        result.registrarURL = value;
        break;
      case "iana id":
        result.ianaId = value;
        break;
      case "registrar iana id":
        result.ianaId = value;
        break;
      case "whois server":
        result.whoisServer = value;
        break;
      case "whois":
        result.whoisServer = value;
        break;
      case "registrar whois server":
        result.whoisServer = value;
        break;
      case "updated date":
      case "last updated date":
        result.updatedDate = analyzeTime(value);
        break;
      case "changed":
        result.updatedDate = analyzeTime(value);
        break;
      case "creation date":
      case "registered date":
        result.creationDate = analyzeTime(value);
        break;
      case "domain name commencement date":
        result.creationDate = analyzeTime(value);
        break;
      case "expiration date":
        result.expirationDate = analyzeTime(value);
        break;
      case "registrar registration expiration date":
        result.expirationDate = analyzeTime(value);
        break;
      case "registry expiry date":
        result.expirationDate = analyzeTime(value);
        break;
      case "state": {
        const expiryMatch = value.match(/\((\d{4}\/\d{2}\/\d{2})\)/);
        if (expiryMatch && result.expirationDate === "Unknown") {
          result.expirationDate = analyzeTime(expiryMatch[1]);
        }
        result.status.push(analyzeDomainStatus(value));
        break;
      }
      case "status":
      case "registration status":
        result.status.push(analyzeDomainStatus(value));
        break;
      case "domain status":
        result.status.push(analyzeDomainStatus(value));
        break;
      case "name server":
      case "host name":
        result.nameServers.push(value);
        break;
      case "nameservers":
        result.nameServers.push(value);
        break;
      case "nserver":
        result.nameServers.push(value.split(/\s+/)[0]);
        break;
      case "registrant name":
        result.registrantOrganization = value;
        break;
      case "registrant organization":
        result.registrantOrganization = value;
        break;
      case "organization":
        result.registrantOrganization = value;
        break;
      case "organisation":
        result.registrantOrganization = value;
        break;
      case "org-name":
        result.registrantOrganization = value;
        break;
      case "registrant":
        result.registrantOrganization = value;
        break;
      case "descr":
        result.registrantOrganization === "Unknown" &&
          (result.registrantOrganization = value);
        break;
      case "registrant state/province":
        result.registrantProvince = value;
        break;
      case "city":
        result.registrantProvince = value;
        break;
      case "registrant country":
        result.registrantCountry = value;
        break;
      case "country":
        result.registrantCountry = value;
        break;
      case "registrant phone":
        result.registrantPhone = value.replace("tel:", "").replace(".", " ");
        break;
      case "registrar abuse contact phone":
      case "ac phone number":
        result.registrantPhone = value.replace("tel:", "").replace(".", " ");
        break;
      case "orgtechphone":
        result.registrantPhone = value;
        break;
      case "registrant email":
        result.registrantEmail = value.replace(
          "Select Request Email Form at ",
          "",
        );
        break;
      case "dnssec":
        result.dnssec = value;
        break;
      case "email":
      case "ac e-mail":
        result.registrantEmail = value;
        break;
      case "e-mail":
        result.registrantEmail === "Unknown" &&
          (result.registrantEmail = value);
        break;
      case "cidr":
        result.cidr = value;
        break;
      case "inetnum":
        result.inetNum = value;
        break;
      case "inet6num":
        result.inet6Num = value;
        break;
      case "netrange":
        result.netRange = value;
        break;
      case "netname":
        result.netName = value;
        break;
      case "network-name":
        result.netName = value;
        break;
      case "nettype":
        result.netType = value;
        break;
      case "originas":
        result.originAS = value;
        break;
      case "origin":
        result.originAS = value;
        break;
    }

    if (includeArgs(key, "domain name") && !result.domain) {
      result.domain = value;
    } else if (
      includeArgs(key, "registrar") &&
      result.registrar === "Unknown"
    ) {
      result.registrar = value;
    } else if (
      includeArgs(key, "contact email") &&
      result.registrantEmail === "Unknown"
    ) {
      result.registrantEmail = value;
    } else if (
      includeArgs(key, "contact phone") &&
      result.registrantPhone === "Unknown"
    ) {
      result.registrantPhone = value;
    } else if (
      includeArgs(
        key,
        "creation",
        "created",
        "created date",
        "registration time",
        "registered",
        "commencement",
      ) &&
      result.creationDate === "Unknown"
    ) {
      result.creationDate = analyzeTime(value);
    } else if (
      includeArgs(key, "expiration", "expiry", "expire", "expire date") &&
      result.expirationDate === "Unknown"
    ) {
      result.expirationDate = analyzeTime(value);
    } else if (
      includeArgs(
        key,
        "updated",
        "update",
        "last update",
        "last updated",
        "last-modified",
      ) &&
      result.updatedDate === "Unknown"
    ) {
      result.updatedDate = analyzeTime(value);
    } else if (
      includeArgs(key, "account name", "registrant org") &&
      result.registrantOrganization === "Unknown"
    ) {
      result.registrantOrganization = value;
    }
  }

  let newStatus: DomainStatusProps[] = [];
  for (let i = 0; i < result.status.length; i++) {
    const status = result.status[i];
    if (newStatus.find((item) => item.status === status.status)) continue;
    newStatus.push(status);
  }
  result.status = newStatus;

  return await applyParams(result);
}
