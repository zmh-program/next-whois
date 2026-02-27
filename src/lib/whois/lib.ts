// the whois parser is based on regexp
// thanks to https://github.com/benfiratkaya/whois-parsed-v2/blob/main/parse-raw-data.js

export type DomainRegex = {
  domainName: string;
  registrar?: string;
  updatedDate?: string;
  creationDate?: string;
  expirationDate?: string;
  status?: string;
  nameServers?: string;
  dateFormat?: string;

  notFound: string;
  rateLimited?: string;

  unknownTLD?: boolean;
};

const specialDomains: Record<string, string> = {
  "gov.cn": "www.gov.cn",
  "com.cn": "www.com.cn",
  "org.cn": "www.org.cn",
  "net.cn": "www.net.cn",
  "edu.cn": "www.edu.cn",
  "mil.cn": "www.mil.cn",
};

const defaultRegex: DomainRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  registrar: "Registrar: *(.+)",
  updatedDate: "Updated Date: *(.+)",
  creationDate: "Creat(ed|ion) Date: *(.+)",
  expirationDate: "Expir\\w+ Date: *(.+)",
  status: "Status:\\s*(.+)\\s*\\n",
  nameServers: "Name Server: *(.+)",
  dateFormat: "YYYY-MM-DDThh:mm:ssZ",
  notFound: "(No match for |Domain not found|NOT FOUND\\s)",
  unknownTLD: true,
};

const comRegex: DomainRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  registrar: "Registrar: *(.+)",
  updatedDate: "Updated Date: *(.+)",
  creationDate: "Creation Date: *(.+)",
  expirationDate: "Expir\\w+ Date: *(.+)",
  status: "Status:\\s*(.+)\\s*\\n",
  nameServers: "Name Server: *(.+)",
  notFound: "No match for ",
};

const orgRegex: DomainRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  registrar: "Registrar: *(.+)",
  updatedDate: "Updated Date: *(.+)",
  creationDate: "Creation Date: *(.+)",
  expirationDate: "Expir\\w+ Date: *(.+)",
  status: "Status: *(.+)",
  nameServers: "Name Server: *(.+)",
  notFound: "^NOT FOUND",
};

const auRegex: DomainRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  updatedDate: "Last Modified: *(.+)",
  registrar: "Registrar Name: *(.+)",
  status: "Status: *(.+)",
  nameServers: "Name Server: *(.+)",
  rateLimited: "WHOIS LIMIT EXCEEDED",
  notFound: "^NOT FOUND",
};

const usRegex: DomainRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  registrar: "Registrar: *(.+)",
  status: "Domain Status: *(.+)",
  creationDate: "Creation Date: *(.+)",
  expirationDate: "Registry Expiry Date: *(.+)",
  updatedDate: "Updated Date: *(.+)",
  nameServers: "Name Server: *(.+)",
  notFound: "^No Data Found",
  dateFormat: "YYYY-MM-DDThh:mm:ssZ",
};

const ruRegex: DomainRegex = {
  // and .рф .su
  domainName: "domain: *([^\\s]+)",
  registrar: "registrar: *(.+)",
  creationDate: "created: *(.+)",
  expirationDate: "paid-till: *(.+)",
  status: "state: *(.+)",
  notFound: "No entries found",
};

const ukRegex: DomainRegex = {
  domainName: "Domain name:\\s*([^\\s]+)",
  registrar: "Registrar:\\s*(.+)",
  status: "Registration status:\\s*(.+)",
  creationDate: "Registered on:\\s*(.+)",
  expirationDate: "Expiry date:\\s*(.+)",
  updatedDate: "Last updated:\\s*(.+)",
  notFound: "No match for ",
  dateFormat: "DD-MMM-YYYY",
};

const frRegex: DomainRegex = {
  domainName: "domain: *([^\\s]+)",
  registrar: "registrar: *(.+)",
  creationDate: "created: *(.+)",
  expirationDate: "Expir\\w+ Date:\\s?(.+)",
  status: "status: *(.+)",
  updatedDate: "last-update: *(.+)",
  notFound: "No entries found in ",
  dateFormat: "YYYY-MM-DDThh:mm:ssZ",
};

const nlRegex: DomainRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  registrar: "Registrar: *\\s*(.+)",
  status: "Status: *(.+)",
  notFound: "\\.nl is free",
  rateLimited: "maximum number of requests per second exceeded",
};

const fiRegex: DomainRegex = {
  domainName: "domain\\.*: *([\\S]+)",
  registrar: "registrar\\.*: *(.*)",
  status: "status\\.*: *([\\S]+)",
  creationDate: "created\\.*: *([\\S]+)",
  updatedDate: "modified\\.*: *([\\S]+)",
  expirationDate: "expires\\.*: *([\\S]+)",
  notFound: "Domain not found",
  dateFormat: "DD.MM.YYYY hh:mm:ss",
};

const jpRegex: DomainRegex = {
  domainName: "\\[Domain Name\\]\\s*([^\\s]+)",
  creationDate: "\\[Created on\\]\\s*(.+)",
  updatedDate: "\\[Last Updated\\]\\s?(.+)",
  expirationDate: "\\[Expires on\\]\\s?(.+)",
  status: "\\[Status\\]\\s*(.+)",
  notFound: "No match!!",
  dateFormat: "YYYY/MM/DD",
};

const plRegex: DomainRegex = {
  domainName: "DOMAIN NAME: *([^\\s]+)[s]+$",
  registrar: "REGISTRAR: *\\s*(.+)",
  status: "Registration status:\\n\\s*(.+)",
  creationDate: "created: *(.+)",
  expirationDate: "renewal date: *(.+)",
  updatedDate: "last modified: *(.+)",
  notFound: "No information available about domain name",
  dateFormat: "YYYY.MM.DD hh:mm:ss",
};

const brRegex: DomainRegex = {
  domainName: "domain: *([^\\s]+)\n",
  status: "status: *(.+)",
  creationDate: "created: *(.+)",
  expirationDate: "expires: *(.+)",
  updatedDate: "changed: *(.+)",
  dateFormat: "YYYYMMDD",
  notFound: "No match for ",
};

const euRegex: DomainRegex = {
  domainName: "Domain: *([^\\n\\r]+)",
  registrar: "Registrar: *\\n *Name: *([^\\n\\r]+)",
  notFound: "Status: AVAILABLE",
};

const eeRegex: DomainRegex = {
  domainName: "Domain: *[\\n\\r]+s*name: *([^\\n\\r]+)",
  status: "Domain: *[\\n\\r]+\\s*name: *[^\\n\\r]+\\sstatus: *([^\\n\\r]+)",
  creationDate:
    "Domain: *[\\n\\r]+\\s*name: *[^\\n\\r]+\\sstatus: *[^\\n\\r]+\\sregistered: *([^\\n\\r]+)",
  updatedDate:
    "Domain: *[\\n\\r]+\\s*name: *[^\\n\\r]+\\sstatus: *[^\\n\\r]+\\sregistered: *[^\\n\\r]+\\schanged: *([^\\n\\r]+)",
  expirationDate:
    "Domain: *[\\n\\r]+\\s*name: *[^\\n\\r]+\\sstatus: *[^\\n\\r]+\\sregistered: *[^\\n\\r]+\\schanged: *[^\\n\\r]+\\sexpire: *([^\\n\\r]+)",
  registrar: "Registrar: *[\\n\\r]+\\s*name: *([^\\n\\r]+)",
  notFound: "Domain not found",
  dateFormat: "YYYY-MM-DD",
};

const krRegex: DomainRegex = {
  domainName: "Domain Name\\s*: *([^\\s]+)",
  creationDate: "Registered Date\\s*: *(.+)",
  updatedDate: "Last Updated Date\\s*: *(.+)",
  expirationDate: "Expiration Date\\s*: *(.+)",
  registrar: "Authorized Agency\\s*: *(.+)",
  dateFormat: "YYYY. MM. DD.",
  notFound: "The requested domain was not found ",
};

const bgRegex: DomainRegex = {
  domainName: "DOMAIN NAME: *([^\\s]+)",
  status: "registration status:\\s*(.+)",
  notFound: "registration status: available",
  rateLimited: "Query limit exceeded",
};

const deRegex: DomainRegex = {
  domainName: "Domain: *([^\\s]+)",
  status: "Status: *(.+)",
  updatedDate: "Changed: *(.+)",
  notFound: "Status: *free",
};

const atRegex: DomainRegex = {
  domainName: "domain: *([^\\s]+)",
  updatedDate: "changed: *(.+)",
  registrar: "registrar: *(.+)",
  notFound: " nothing found",
  dateFormat: "YYYYMMDD hh:mm:ss",
  rateLimited: "Quota exceeded",
};

const caRegex: DomainRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  status: "Domain Status: *(.+)",
  updatedDate: "Updated Date: *(.+)",
  creationDate: "Creation Date: *(.+)",
  expirationDate: "Expiry Date: *(.+)",
  registrar: "Registrar: *(.+)",
  notFound: "Not found: ",
};

const beRegex: DomainRegex = {
  domainName: "Domain:\\s*([^\\s]+)",
  registrar: "Registrar: *[\\n\\r]+\\s*Name:\\s*(.+)",
  status: "Status:\\s*(.+)",
  creationDate: "Registered: *(.+)",
  dateFormat: "ddd MMM DD YYYY",
  notFound: "Status:\\s*AVAILABLE",
};

const infoRegex: DomainRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  registrar: "Registrar: *(.+)",
  updatedDate: "Updated Date: *(.+)",
  creationDate: "Creation Date: *(.+)",
  expirationDate: "Registrar Registration Expiration Date: *(.+)",
  status: "Status: *(.+)",
  nameServers: "Name Server: *(.+)",
  notFound: "NOT FOUND",
  //'dateFormat':       'YYYY-MM-DDTHH:mm:ssZ'
};

const kgRegex: DomainRegex = {
  domainName: "^Domain\\s*([^\\s]+)",
  registrar: "Domain support: \\s*(.+)",
  creationDate: "Record created:\\s*(.+)",
  expirationDate: "Record expires on:\\s*(.+)",
  updatedDate: "Record last updated on:\\s*(.+)",
  dateFormat: "ddd MMM DD HH:mm:ss YYYY",
  notFound: "domain is available for registration",
};

// const chRegex: DomainRegex = {
//     'domainName':                      '\\nDomain name:\\n*([^\s]+)',
//     'registrar':                        'Registrar:\n*(.+)',
//     'creationDate':                    'First registration date:\\n*(.+)',
//     'rateLimited':                      'Please wait a moment and try again.',
//     'notFound':                         'We do not have an entry in our database matching your query',
//     'dateFormat':                       'YYYY-MM-DD'
// };

const idRegex: DomainRegex = {
  domainName: "Domain Name:([^\\s]+)",
  creationDate: "Created On:(.+)",
  expirationDate: "Expiration Date(.+)",
  updatedDate: "Last Updated On(.+)",
  registrar: "Sponsoring Registrar Organization:(.+)",
  status: "Status:(.+)",
  notFound: "DOMAIN NOT FOUND",
  dateFormat: "DD-MMM-YYYY HH:mm:ss UTC",
};

const skRegex: DomainRegex = {
  domainName: "Domain:\\s*([^\\s]+)",
  creationDate: "Created:\\s*(.+)",
  expirationDate: "Valid Until:\\s*(.+)",
  status: "EPP Status:\\s*(.+)",
  updatedDate: "Updated:\\s*(.+)",
  registrar: "Registrar:\\s*(.+)",
  dateFormat: "YYYY-MM-DD",
  notFound: "Domain not found",
};

const seRegex: DomainRegex = {
  domainName: "domain\\.*: *([^\\s]+)",
  creationDate: "created\\.*: *(.+)",
  updatedDate: "modified\\.*: *(.+)",
  expirationDate: "expires\\.*: *(.+)",
  status: "status\\.*: *(.+)",
  registrar: "registrar: *(.+)",
  dateFormat: "YYYY-MM-DD",
  notFound: '\\" not found.',
};

const isRegex: DomainRegex = {
  domainName: "domain\\.*: *([^\\s]+)",
  creationDate: "created\\.*: *(.+)",
  expirationDate: "expires\\.*: *(.+)",
  dateFormat: "MMM DD YYYY",
  notFound: "No entries found for query",
};

const coRegex: DomainRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  registrar: "Registrar: *(.+)",
  updatedDate: "Updated Date: *(.+)",
  creationDate: "Creation Date: *(.+)",
  expirationDate: "Expir\\w+ Date: *(.+)",
  status: "Status:\\s*(.+)\\s*\\n",
  nameServers: "Name Server: *(.+)",
  notFound: "No Data Found",
};

const trRegex: DomainRegex = {
  domainName: "Domain Name: *([^\\s]+)",
  registrar: "Organization Name\t: *(.+)",
  creationDate: "Created on..............: *(.+)",
  expirationDate: "Expires on..............: *(.+)",
  dateFormat: "YYYY-MMM-DD",
  notFound: "No match found",
};

export function getDomainRegex(domain: string): DomainRegex {
  if (
    domain.endsWith(".com") ||
    domain.endsWith(".net") ||
    domain.endsWith(".name")
  ) {
    return comRegex;
  } else if (
    domain.endsWith(".org") ||
    domain.endsWith(".me") ||
    domain.endsWith(".mobi")
  ) {
    return orgRegex;
  } else if (domain.endsWith(".au")) {
    return auRegex;
  } else if (
    domain.endsWith(".ru") ||
    domain.endsWith(".рф") ||
    domain.endsWith(".su")
  ) {
    return ruRegex;
  } else if (domain.endsWith(".us") || domain.endsWith(".biz")) {
    return usRegex;
  } else if (domain.endsWith(".uk")) {
    return ukRegex;
  } else if (domain.endsWith(".fr")) {
    return frRegex;
  } else if (domain.endsWith(".nl")) {
    return nlRegex;
  } else if (domain.endsWith(".fi")) {
    return fiRegex;
  } else if (domain.endsWith(".jp")) {
    return jpRegex;
  } else if (domain.endsWith(".pl")) {
    return plRegex;
  } else if (domain.endsWith(".br")) {
    return brRegex;
  } else if (domain.endsWith(".eu")) {
    return euRegex;
  } else if (domain.endsWith(".ee")) {
    return eeRegex;
  } else if (domain.endsWith(".kr")) {
    return krRegex;
  } else if (domain.endsWith(".bg")) {
    return bgRegex;
  } else if (domain.endsWith(".de")) {
    return deRegex;
  } else if (domain.endsWith(".at")) {
    return atRegex;
  } else if (domain.endsWith(".ca")) {
    return caRegex;
  } else if (domain.endsWith(".be")) {
    return beRegex;
  } else if (domain.endsWith(".kg")) {
    return kgRegex;
  } else if (domain.endsWith(".info")) {
    return infoRegex;
    // } else if (domain.endsWith('.ch') || domain.endsWith('.li')) {
    //   return infoRegex;
  } else if (domain.endsWith(".id")) {
    return idRegex;
  } else if (domain.endsWith(".sk")) {
    return skRegex;
  } else if (domain.endsWith(".se") || domain.endsWith(".nu")) {
    return seRegex;
  } else if (domain.endsWith(".is")) {
    return isRegex;
  } else if (domain.endsWith(".co")) {
    return coRegex;
  } else if (domain.endsWith(".tr")) {
    return trRegex;
  } else {
    return defaultRegex;
  }
}

export function getSpecialDomain(domain: string): string {
  return specialDomains[domain.toLowerCase()] ?? domain;
}
