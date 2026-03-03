import { DomainPricing } from "../pricing/client";

/**
 * Result of a WHOIS/RDAP lookup
 */
export type WhoisResult = {
  /** Whether the lookup was successful */
  status: boolean;
  /** Time taken for lookup in milliseconds */
  time: number;
  /** Whether the result was served from cache */
  cached?: boolean;
  /** Source of the data: rdap or whois */
  source?: "rdap" | "whois";
  /** Parsed result data */
  result?: WhoisAnalyzeResult;
  /** Error message if lookup failed */
  error?: string;
};

/**
 * Detailed analysis result of a domain lookup
 */
export type WhoisAnalyzeResult = {
  status: boolean;
  time: number;
  cached?: boolean;
  source?: "rdap" | "whois";
  result?: WhoisAnalyzeResult;
  error?: string;
};

export type WhoisAnalyzeResult = {
  domain: string;
  registrar: string;
  registrarURL: string;
  ianaId: string;
  whoisServer: string;
  updatedDate: string;
  creationDate: string;
  expirationDate: string;
  status: DomainStatusProps[];
  nameServers: string[];
  registrantOrganization: string;
  registrantProvince: string;
  registrantCountry: string;
  registrantPhone: string;
  registrantEmail: string;
  dnssec: string;
  rawWhoisContent: string;
  rawRdapContent?: string;

  // Domain age and expiration
  domainAge: number | null;
  remainingDays: number | null;

  // Domain pricing
  registerPrice: DomainPricing | null;
  renewPrice: DomainPricing | null;
  transferPrice: DomainPricing | null;

  // Moz statistics
  mozDomainAuthority: number;
  mozPageAuthority: number;
  mozSpamScore: number;

  cidr: string;
  inetNum: string;
  inet6Num: string;
  netRange: string;
  netName: string;
  netType: string;
  originAS: string;
};

export type DomainStatusProps = {
  status: string;
  url: string;
};

export const initialWhoisAnalyzeResult: WhoisAnalyzeResult = {
  domain: "",
  registrar: "Unknown",
  registrarURL: "Unknown",
  ianaId: "N/A",
  whoisServer: "Unknown",
  updatedDate: "Unknown",
  creationDate: "Unknown",
  expirationDate: "Unknown",
  status: [],
  nameServers: [],
  registrantOrganization: "Unknown",
  registrantProvince: "Unknown",
  registrantCountry: "Unknown",
  registrantPhone: "Unknown",
  registrantEmail: "Unknown",
  dnssec: "",
  rawWhoisContent: "",

  // Domain age and expiration
  domainAge: null,
  remainingDays: null,

  // Domain pricing
  registerPrice: null,
  renewPrice: null,
  transferPrice: null,

  // Moz statistics
  mozDomainAuthority: 0,
  mozPageAuthority: 0,
  mozSpamScore: 0,

  cidr: "Unknown",
  inetNum: "Unknown",
  inet6Num: "Unknown",
  netRange: "Unknown",
  netName: "Unknown",
  netType: "Unknown",
  originAS: "Unknown",
};
