import { lookupWhoisWithCache } from "@/lib/whois/lookup";
import {
  cleanDomain,
  cn,
  getWindowHref,
  toSearchURI,
  useClipboard,
  useSaver,
} from "@/lib/utils";
import { GetServerSidePropsContext } from "next";
import { getOrigin } from "@/lib/seo";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import {
  RiCameraLine,
  RiFileCopyLine,
  RiExternalLinkLine,
  RiLinkM,
  RiBarChartBoxAiFill,
  RiShareLine,
  RiTwitterXLine,
  RiFacebookFill,
  RiRedditLine,
  RiWhatsappLine,
  RiTelegramLine,
  RiTimeLine,
  RiExchangeDollarFill,
  RiBillLine,
  RiDownloadLine,
  RiServerLine,
  RiEarthLine,
  RiGlobalLine,
} from "@remixicon/react";
import React, { useEffect, useMemo } from "react";
import { addHistory, detectQueryType } from "@/lib/history";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { WhoisAnalyzeResult, WhoisResult } from "@/lib/whois/types";
import {
  getEppStatusInfo,
  getEppStatusColor,
  getEppStatusDisplayName,
  getEppStatusLink,
} from "@/lib/whois/epp_status";
import { SearchBox } from "@/components/search_box";
import {
  KeyboardShortcut,
  SearchHotkeysText,
} from "@/components/search_shortcuts";
import { useTranslation, TranslationKey } from "@/lib/i18n";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSearchHotkeys } from "@/hooks/useSearchHotkeys";

const REGISTRAR_ICONS: Record<string, { slug: string | null; color: string }> =
  {
    godaddy: { slug: "godaddy", color: "#1BDBDB" },
    namecheap: { slug: "namecheap", color: "#DE3723" },
    cloudflare: { slug: "cloudflare", color: "#F38020" },
    google: { slug: "google", color: "#000000" },
    googledomains: { slug: "google", color: "#000000" },
    ovh: { slug: "ovh", color: "#123F6D" },
    ovhcloud: { slug: "ovh", color: "#123F6D" },
    ionos: { slug: "ionos", color: "#003D8F" },
    "1and1": { slug: "ionos", color: "#003D8F" },
    "1&1": { slug: "ionos", color: "#003D8F" },
    uniteddomains: { slug: "ionos", color: "#003D8F" },
    gandi: { slug: "gandi", color: "#6640FE" },
    porkbun: { slug: "porkbun", color: "#EF7878" },
    hetzner: { slug: "hetzner", color: "#D50C2D" },
    hostinger: { slug: "hostinger", color: "#673DE6" },
    alibaba: { slug: "alibabacloud", color: "#FF6A00" },
    alibabacloud: { slug: "alibabacloud", color: "#FF6A00" },
    aliyun: { slug: "alibabacloud", color: "#FF6A00" },
    hichina: { slug: "alibabacloud", color: "#FF6A00" },
    wanwang: { slug: "alibabacloud", color: "#FF6A00" },
    tencent: { slug: "/registrar-icons/tencent.png", color: "#EB1923" },
    dnspod: { slug: "/registrar-icons/dnspod.png", color: "#EB1923" },
    digitalocean: { slug: "digitalocean", color: "#0080FF" },
    squarespace: { slug: "squarespace", color: "#000000" },
    wix: { slug: "wix", color: "#0C6EFC" },
    wordpress: { slug: "wordpress", color: "#21759B" },
    automattic: { slug: "wordpress", color: "#21759B" },
    netlify: { slug: "netlify", color: "#00C7B7" },
    vercel: { slug: "vercel", color: "#000000" },
    namedotcom: { slug: "/registrar-icons/namecom.png", color: "#236BFF" },
    "name.com": { slug: "/registrar-icons/namecom.png", color: "#236BFF" },
    namesilo: { slug: "namesilo", color: "#031B4E" },
    dynadot: { slug: "/registrar-icons/dynadot.png", color: "#4E2998" },
    enom: { slug: "/registrar-icons/enom.png", color: "#F09B1B" },
    tucows: { slug: "/registrar-icons/tucows.png", color: "#F09B1B" },
    networksolutions: {
      slug: "/registrar-icons/networksolutions.png",
      color: "#2E8B57",
    },
    markmonitor: { slug: "/registrar-icons/markmonitor.png", color: "#2B5797" },
    amazon: { slug: "/registrar-icons/amazon.png", color: "#FF9900" },
    aws: { slug: "/registrar-icons/amazon.png", color: "#FF9900" },
    hover: { slug: "/registrar-icons/hover.png", color: "#3B7DDD" },
    rebel: { slug: "/registrar-icons/hover.png", color: "#3B7DDD" },
    epik: { slug: "/registrar-icons/epik.png", color: "#4A90D9" },
    dreamhost: { slug: "/registrar-icons/dreamhost.png", color: "#0073EC" },
    bluehost: { slug: "/registrar-icons/bluehost.png", color: "#003580" },
    hostgator: { slug: "/registrar-icons/hostgator.png", color: "#F8A41B" },
    siteground: { slug: "/registrar-icons/siteground.png", color: "#7B3FA0" },
    fastdomain: { slug: "/registrar-icons/fastdomain.png", color: "#003580" },
    huawei: { slug: "huawei", color: "#FF0000" },
    baidu: { slug: "baidu", color: "#2932E1" },
    ename: { slug: "/registrar-icons/ename.png", color: "#2C7BE5" },
    "ename technology": {
      slug: "/registrar-icons/ename.png",
      color: "#2C7BE5",
    },
    xinnet: { slug: "/registrar-icons/xinnet.png", color: "#E60012" },
    "identity digital": {
      slug: "/registrar-icons/identitydigital.png",
      color: "#1A1A2E",
    },
    donuts: { slug: "/registrar-icons/identitydigital.png", color: "#1A1A2E" },
    "registry operator": {
      slug: "/registrar-icons/identitydigital.png",
      color: "#1A1A2E",
    },
    "360": { slug: "/registrar-icons/360.png", color: "#2FC332" },
    qihoo: { slug: "/registrar-icons/360.png", color: "#2FC332" },
    westcn: { slug: "/registrar-icons/westcn.png", color: "#2B7DE9" },
    "west.cn": { slug: "/registrar-icons/westcn.png", color: "#2B7DE9" },
    vultr: { slug: "/registrar-icons/vultr.png", color: "#007BFC" },
    scaleway: { slug: "/registrar-icons/scaleway.png", color: "#4F0599" },
    csc: { slug: "/registrar-icons/csc.png", color: "#00529B" },
    cscglobal: { slug: "/registrar-icons/csc.png", color: "#00529B" },
    webcom: { slug: null, color: "#1166BB" },
    "web.com": { slug: null, color: "#1166BB" },
    registercom: { slug: "/registrar-icons/registercom.png", color: "#00A651" },
    "register.com": {
      slug: "/registrar-icons/registercom.png",
      color: "#00A651",
    },
    domaincom: { slug: "/registrar-icons/domaincom.png", color: "#2B74B4" },
    "domain.com": { slug: "/registrar-icons/domaincom.png", color: "#2B74B4" },
    gname: { slug: "/registrar-icons/gname.png", color: "#1E90FF" },
    shopify: { slug: "/registrar-icons/shopify.png", color: "#7AB55C" },
    oracle: { slug: "oracle", color: "#F80000" },
    gmo: { slug: "/registrar-icons/gmo.png", color: "#FF6600" },
    onamae: { slug: "/registrar-icons/gmo.png", color: "#FF6600" },
    gabia: { slug: "/registrar-icons/gabia.png", color: "#EE2737" },
    regru: { slug: "/registrar-icons/regru.png", color: "#FF6B00" },
    "reg.ru": { slug: "/registrar-icons/regru.png", color: "#FF6B00" },
    rucenter: { slug: "/registrar-icons/rucenter.png", color: "#005BAC" },
    "ru-center": { slug: "/registrar-icons/rucenter.png", color: "#005BAC" },
    strato: { slug: "/registrar-icons/strato.png", color: "#2DB928" },
    spaceship: { slug: "/registrar-icons/spaceship.png", color: "#6366F1" },
    centralnic: { slug: "/registrar-icons/centralnic.png", color: "#1D6AE5" },
    keysystems: { slug: "/registrar-icons/centralnic.png", color: "#1D6AE5" },
    rrpproxy: { slug: "/registrar-icons/centralnic.png", color: "#1D6AE5" },
    bigrock: { slug: "/registrar-icons/bigrock.png", color: "#FF6C2C" },
    resellerclub: {
      slug: "/registrar-icons/resellerclub.png",
      color: "#F99D1C",
    },
    publicdomainregistry: { slug: null, color: "#0066FF" },
    pdr: { slug: null, color: "#0066FF" },
    internetbs: { slug: null, color: "#2196F3" },
    "internet.bs": { slug: null, color: "#2196F3" },
  };

const NS_BRANDS: {
  brand: string;
  domains: string[];
  slug: string | null;
  color: string;
}[] = [
  {
    brand: "GoDaddy",
    domains: ["domaincontrol.com"],
    slug: "godaddy",
    color: "#1BDBDB",
  },
  {
    brand: "Cloudflare",
    domains: [
      "cloudflare.com",
      "foundationdns.com",
      "foundationdns.net",
      "foundationdns.org",
    ],
    slug: "cloudflare",
    color: "#F38020",
  },
  {
    brand: "Namecheap",
    domains: ["registrar-servers.com", "namecheaphosting.com"],
    slug: "namecheap",
    color: "#DE3723",
  },
  {
    brand: "Porkbun",
    domains: ["porkbun.com"],
    slug: "porkbun",
    color: "#EF7878",
  },
  {
    brand: "Hetzner",
    domains: [
      "hetzner.com",
      "hetzner.de",
      "first-ns.de",
      "second-ns.de",
      "second-ns.com",
      "your-server.de",
    ],
    slug: "hetzner",
    color: "#D50C2D",
  },
  {
    brand: "OVHcloud",
    domains: ["ovh.net", "ovh.ca", "anycast.me"],
    slug: "ovh",
    color: "#123F6D",
  },
  {
    brand: "IONOS",
    domains: ["ui-dns.com", "ui-dns.org", "ui-dns.de", "ui-dns.biz"],
    slug: "ionos",
    color: "#003D8F",
  },
  { brand: "Gandi", domains: ["gandi.net"], slug: "gandi", color: "#6640FE" },
  {
    brand: "DigitalOcean",
    domains: ["digitalocean.com"],
    slug: "digitalocean",
    color: "#0080FF",
  },
  {
    brand: "Hostinger",
    domains: ["dns-parking.com", "main-hosting.eu"],
    slug: "hostinger",
    color: "#673DE6",
  },
  {
    brand: "Netlify",
    domains: ["netlify.com"],
    slug: "netlify",
    color: "#00C7B7",
  },
  {
    brand: "NS1",
    domains: ["nsone.net"],
    slug: "/registrar-icons/ns1.png",
    color: "#760DDE",
  },
  {
    brand: "Vercel",
    domains: ["vercel-dns.com"],
    slug: "vercel",
    color: "#000000",
  },
  { brand: "Wix", domains: ["wixdns.net"], slug: "wix", color: "#0C6EFC" },
  {
    brand: "Squarespace",
    domains: ["squarespace-dns.com", "squarespace.com"],
    slug: "squarespace",
    color: "#000000",
  },
  {
    brand: "WordPress",
    domains: ["wordpress.com"],
    slug: "wordpress",
    color: "#21759B",
  },
  {
    brand: "AWS Route 53",
    domains: ["awsdns"],
    slug: "/registrar-icons/amazon.png",
    color: "#232F3E",
  },
  {
    brand: "Azure DNS",
    domains: [
      "azure-dns.com",
      "azure-dns.net",
      "azure-dns.org",
      "azure-dns.info",
    ],
    slug: "/registrar-icons/azure.png",
    color: "#0078D4",
  },
  {
    brand: "Google",
    domains: ["googledomains.com", "google.com"],
    slug: "google",
    color: "#000000",
  },
  {
    brand: "Akamai",
    domains: ["linode.com", "akam.net", "akamaiedge.net"],
    slug: "akamai",
    color: "#0096D6",
  },
  {
    brand: "Hurricane Electric",
    domains: ["dns.he.net"],
    slug: "/registrar-icons/he.png",
    color: "#E40000",
  },
  {
    brand: "DNSPod",
    domains: [
      "dnspod.net",
      "qq.com",
      "dnsv2.com",
      "dnsv3.com",
      "dnsv4.com",
      "dnsv5.com",
      "iidns.com",
    ],
    slug: "/registrar-icons/dnspod.png",
    color: "#4478E6",
  },
  {
    brand: "Tencent Cloud",
    domains: ["tencentcloudcns.com"],
    slug: "/registrar-icons/tencent.png",
    color: "#EB1923",
  },
  {
    brand: "DNSimple",
    domains: ["dnsimple.com", "dnsimple-edge.net"],
    slug: "/registrar-icons/dnsimple.png",
    color: "#205EBB",
  },
  {
    brand: "ClouDNS",
    domains: ["cloudns.net"],
    slug: "/registrar-icons/cloudns.png",
    color: "#4FA3D7",
  },
  { brand: "FreeDNS", domains: ["afraid.org"], slug: null, color: "#27AE60" },
  {
    brand: "Name.com",
    domains: ["name.com"],
    slug: "/registrar-icons/namecom.png",
    color: "#236BFF",
  },
  {
    brand: "Hover",
    domains: ["hover.com"],
    slug: "/registrar-icons/hover.png",
    color: "#3B7DDD",
  },
  {
    brand: "Dynadot",
    domains: ["dynadot.com"],
    slug: "/registrar-icons/dynadot.png",
    color: "#4E2998",
  },
  {
    brand: "Enom",
    domains: ["name-services.com"],
    slug: "/registrar-icons/enom.png",
    color: "#F09B1B",
  },
  {
    brand: "Network Solutions",
    domains: ["worldnic.com"],
    slug: "/registrar-icons/networksolutions.png",
    color: "#2E8B57",
  },
  {
    brand: "NameSilo",
    domains: ["dnsowl.com", "namesilo.com"],
    slug: "namesilo",
    color: "#031B4E",
  },
  {
    brand: "Alibaba Cloud",
    domains: ["hichina.com", "alidns.com", "net.cn", "aliyun.com"],
    slug: "alibabacloud",
    color: "#FF6A00",
  },
  {
    brand: "Baidu Cloud",
    domains: ["bdydns.cn", "bdydns.com"],
    slug: "baidu",
    color: "#2932E1",
  },
  {
    brand: "Huawei Cloud",
    domains: [
      "huaweicloud-dns.com",
      "huaweicloud-dns.cn",
      "huaweicloud-dns.net",
      "hwclouds-dns.com",
      "hwclouds-dns.net",
      "huawei.com",
    ],
    slug: "huawei",
    color: "#FF0000",
  },
  {
    brand: "Tucows",
    domains: ["tucows.com"],
    slug: "/registrar-icons/tucows.png",
    color: "#F09B1B",
  },
  {
    brand: "360",
    domains: ["360safe.com"],
    slug: "/registrar-icons/360.png",
    color: "#2FC332",
  },
  {
    brand: "eName",
    domains: ["ename.net", "ename.com"],
    slug: "/registrar-icons/ename.png",
    color: "#2C7BE5",
  },
  {
    brand: "Xinnet",
    domains: ["xinnet.com", "xincache.com"],
    slug: "/registrar-icons/xinnet.png",
    color: "#E60012",
  },
  {
    brand: "West.cn",
    domains: ["myhostadmin.net", "west-dns.com", "est.cn"],
    slug: "/registrar-icons/westcn.png",
    color: "#2B7DE9",
  },
  {
    brand: "JD Cloud",
    domains: ["jdgslb.com", "jdcache.com"],
    slug: "/registrar-icons/jdcloud.png",
    color: "#C9151E",
  },
  {
    brand: "Volcengine",
    domains: ["volcengine.com", "volcdns.com"],
    slug: "/registrar-icons/volcengine.png",
    color: "#3370FF",
  },
  {
    brand: "Fastly",
    domains: ["fastly.net"],
    slug: "/registrar-icons/fastly.png",
    color: "#FF282D",
  },
  {
    brand: "UltraDNS",
    domains: ["ultradns.com", "ultradns.net", "ultradns.org"],
    slug: "/registrar-icons/ultradns.png",
    color: "#5B2D8E",
  },
  {
    brand: "Constellix",
    domains: ["constellix.com", "constellix.net"],
    slug: "/registrar-icons/constellix.png",
    color: "#4B9CD3",
  },
  {
    brand: "easyDNS",
    domains: ["easydns.com", "easydns.net", "easydns.org"],
    slug: "/registrar-icons/easydns.png",
    color: "#29A8E0",
  },
  {
    brand: "Vultr",
    domains: ["vultr.com"],
    slug: "/registrar-icons/vultr.png",
    color: "#007BFC",
  },
  {
    brand: "Scaleway",
    domains: ["scaleway.com"],
    slug: "/registrar-icons/scaleway.png",
    color: "#4F0599",
  },
  {
    brand: "TransIP",
    domains: ["transip.net", "transip.nl"],
    slug: "/registrar-icons/transip.png",
    color: "#74B63B",
  },
  {
    brand: "SiteGround",
    domains: ["siteground.net", "sgvps.net"],
    slug: "/registrar-icons/siteground.png",
    color: "#7B3FA0",
  },
  {
    brand: "Bluehost",
    domains: ["bluehost.com"],
    slug: "/registrar-icons/bluehost.png",
    color: "#003580",
  },
  {
    brand: "DreamHost",
    domains: ["dreamhost.com"],
    slug: "/registrar-icons/dreamhost.png",
    color: "#0073EC",
  },
  {
    brand: "HostGator",
    domains: ["hostgator.com"],
    slug: "/registrar-icons/hostgator.png",
    color: "#F8A41B",
  },
  {
    brand: "Epik",
    domains: ["epik.com"],
    slug: "/registrar-icons/epik.png",
    color: "#4A90D9",
  },
  {
    brand: "MarkMonitor",
    domains: ["markmonitor.com"],
    slug: "/registrar-icons/markmonitor.png",
    color: "#2B5797",
  },
  {
    brand: "Identity Digital",
    domains: ["donuts.co", "identity.digital"],
    slug: "/registrar-icons/identitydigital.png",
    color: "#1A1A2E",
  },
  {
    brand: "CSC Global",
    domains: ["cscglobal.com", "cscdns.net"],
    slug: "/registrar-icons/csc.png",
    color: "#00529B",
  },
  {
    brand: "Shopify",
    domains: ["shopify.com", "myshopify.com"],
    slug: "/registrar-icons/shopify.png",
    color: "#7AB55C",
  },
  {
    brand: "Oracle/Dyn",
    domains: ["dynect.net", "oraclecloud.net"],
    slug: "oracle",
    color: "#F80000",
  },
  {
    brand: "Imperva",
    domains: ["impervadns.net", "incapdns.net"],
    slug: "/registrar-icons/imperva.png",
    color: "#004680",
  },
  {
    brand: "Sucuri",
    domains: ["sucuridns.com", "sucuri.net"],
    slug: "/registrar-icons/sucuri.png",
    color: "#88C946",
  },
  {
    brand: "Verisign",
    domains: ["verisign-grs.com", "verisigndns.com", "nstld.com"],
    slug: "/registrar-icons/verisign.png",
    color: "#003399",
  },
  {
    brand: "GMO/Onamae",
    domains: ["onamae.com", "gmoint.com", "gmoserver.jp"],
    slug: "/registrar-icons/gmo.png",
    color: "#FF6600",
  },
  {
    brand: "Gabia",
    domains: ["gabia.net", "gabia.io"],
    slug: "/registrar-icons/gabia.png",
    color: "#EE2737",
  },
  {
    brand: "Reg.ru",
    domains: ["reg.ru"],
    slug: "/registrar-icons/regru.png",
    color: "#FF6B00",
  },
  {
    brand: "RU-CENTER",
    domains: ["nic.ru"],
    slug: "/registrar-icons/rucenter.png",
    color: "#005BAC",
  },
  {
    brand: "Strato",
    domains: ["strato.de", "stratoserver.net", "rzone.de"],
    slug: "/registrar-icons/strato.png",
    color: "#2DB928",
  },
  {
    brand: "Bunny.net",
    domains: ["bunny.net", "bunnyinfra.net"],
    slug: "/registrar-icons/bunny.png",
    color: "#F47621",
  },
  {
    brand: "DNS Made Easy",
    domains: ["dnsmadeeasy.com"],
    slug: "/registrar-icons/dnsmadeeasy.png",
    color: "#6BB839",
  },
  {
    brand: "CentralNic",
    domains: ["centralnic.net", "rrpproxy.net"],
    slug: "/registrar-icons/centralnic.png",
    color: "#1D6AE5",
  },
  {
    brand: "Gname",
    domains: ["gname-dns.com"],
    slug: "/registrar-icons/gname.png",
    color: "#1E90FF",
  },
  {
    brand: "Register.com",
    domains: ["register.com"],
    slug: "/registrar-icons/registercom.png",
    color: "#00A651",
  },
  {
    brand: "Domain.com",
    domains: ["domain.com"],
    slug: "/registrar-icons/domaincom.png",
    color: "#2B74B4",
  },
  {
    brand: "Yandex",
    domains: ["yandexcloud.net", "yandex.net"],
    slug: "/registrar-icons/yandex.png",
    color: "#5282FF",
  },
  {
    brand: "DDoS-Guard",
    domains: ["ddos-guard.net"],
    slug: "/registrar-icons/ddosguard.png",
    color: "#0A2856",
  },
  {
    brand: "Sakura Internet",
    domains: ["sakura.ne.jp", "dns.ne.jp"],
    slug: "/registrar-icons/sakura.png",
    color: "#FF6699",
  },
  {
    brand: "Rackspace",
    domains: ["rackspace.com", "stabletransit.com"],
    slug: "rackspace",
    color: "#C40022",
  },
  {
    brand: "IBM Cloud",
    domains: ["softlayer.com"],
    slug: "ibm",
    color: "#054ADA",
  },
  {
    brand: "BigRock",
    domains: ["bigrock.in"],
    slug: "/registrar-icons/bigrock.png",
    color: "#FF6C2C",
  },
  {
    brand: "ResellerClub",
    domains: ["resellerclub.com"],
    slug: "/registrar-icons/resellerclub.png",
    color: "#F99D1C",
  },
  {
    brand: "Cafe24",
    domains: ["cafe24.com"],
    slug: "/registrar-icons/cafe24.png",
    color: "#13AA52",
  },
  {
    brand: "Gcore",
    domains: ["gcore.com", "gcorelabs.net"],
    slug: "/registrar-icons/gcore.png",
    color: "#FF4C00",
  },
  {
    brand: "Wangsu",
    domains: ["wscdns.com", "wsglb0.com"],
    slug: "/registrar-icons/wangsu.png",
    color: "#004B97",
  },
  {
    brand: "ZDNS",
    domains: ["zdnscloud.com", "zdns.cn"],
    slug: "/registrar-icons/zdns.png",
    color: "#1E73BE",
  },
  {
    brand: "No-IP",
    domains: ["no-ip.com"],
    slug: "/registrar-icons/noip.png",
    color: "#2196F3",
  },
  {
    brand: "Infomaniak",
    domains: ["infomaniak.com", "infomaniak.ch"],
    slug: "/registrar-icons/infomaniak.png",
    color: "#0F7A3F",
  },
  {
    brand: "Spaceship",
    domains: ["spaceship.com"],
    slug: "/registrar-icons/spaceship.png",
    color: "#6366F1",
  },
  { brand: "22.cn", domains: ["22.cn"], slug: null, color: "#FF6600" },
  { brand: "DNS.com", domains: ["dns.com"], slug: null, color: "#0099CC" },
  {
    brand: "Cndns",
    domains: ["dns-diy.com", "cndns.com"],
    slug: null,
    color: "#FF8C00",
  },
  {
    brand: "StackPath",
    domains: ["stackpathdns.com"],
    slug: null,
    color: "#003BDE",
  },
  { brand: "Zoho", domains: ["zoho.com"], slug: "zoho", color: "#C8202B" },
];

function getNsBrand(
  ns: string,
): { brand: string; slug: string | null; color: string } | null {
  const lower = ns.toLowerCase();
  for (const info of NS_BRANDS) {
    if (info.domains.some((d) => lower.includes(d))) return info;
  }
  return null;
}

function getRegistrarIcon(
  registrar: string,
  registrarURL?: string,
): { slug: string | null; color: string } | null {
  if (!registrar || registrar === "Unknown") return null;
  const normalized = registrar.toLowerCase().replace(/[\s.,\-_()]+/g, "");
  for (const [key, info] of Object.entries(REGISTRAR_ICONS)) {
    if (normalized.includes(key)) return info;
  }
  if (registrarURL) {
    const urlLower = registrarURL.toLowerCase();
    for (const [key, info] of Object.entries(REGISTRAR_ICONS)) {
      if (urlLower.includes(key)) return info;
    }
  }
  return null;
}

function getDarkModeIconColor(color: string): string {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.4 ? "white" : hex;
}

function resolveIconUrl(slug: string, color: string, dark: boolean): string {
  if (slug.startsWith("/")) return slug;
  const c = dark ? getDarkModeIconColor(color) : color.replace("#", "");
  return `https://cdn.simpleicons.org/${slug}/${c}`;
}

function getRegistrarFallbackColor(registrar: string): string {
  let hash = 0;
  for (let i = 0; i < registrar.length; i++) {
    hash = registrar.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

function getRelativeTime(
  dateStr: string,
  t: (key: TranslationKey, values?: Record<string, string | number>) => string,
): string {
  if (!dateStr || dateStr === "Unknown") return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 0) {
      const abs = Math.abs(diffDays);
      if (abs < 30) return t("relative_time.in_days", { days: abs });
      if (abs < 365)
        return t("relative_time.in_months", { months: Math.floor(abs / 30) });
      return t("relative_time.in_years", { years: Math.floor(abs / 365) });
    }
    if (diffDays < 1) return t("relative_time.today");
    if (diffDays < 30) return t("relative_time.days_ago", { days: diffDays });
    if (diffDays < 365)
      return t("relative_time.months_ago", {
        months: Math.floor(diffDays / 30),
      });
    return t("relative_time.years_ago", { years: Math.floor(diffDays / 365) });
  } catch {
    return "";
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === "Unknown") return "—";
  try {
    return dateStr.split("T")[0];
  } catch {
    return dateStr;
  }
}

function buildOgUrl(
  target: string,
  _result?: WhoisAnalyzeResult | undefined,
  overrides?: { w?: number; h?: number; theme?: string },
): string {
  const params = new URLSearchParams();
  params.set("query", target);
  if (overrides?.w) params.set("w", String(overrides.w));
  if (overrides?.h) params.set("h", String(overrides.h));
  const themeVal =
    overrides?.theme ||
    (typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : "light");
  if (themeVal === "dark") params.set("theme", "dark");
  return `/api/og?${params.toString()}`;
}

function WhoisHighlight({ content }: { content: string }) {
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/;

  return (
    <>
      {content.split("\n").map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-3" />;
        if (
          trimmed.startsWith("%") ||
          trimmed.startsWith("#") ||
          trimmed.startsWith(">>>") ||
          trimmed.startsWith("--")
        ) {
          return (
            <div key={i} className="text-zinc-400 dark:text-zinc-600 italic">
              {line}
            </div>
          );
        }
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0 && colonIdx < 40) {
          const key = line.slice(0, colonIdx + 1);
          const value = line.slice(colonIdx + 1);
          return (
            <div key={i}>
              <span className="text-sky-600 dark:text-sky-400 font-medium">
                {key}
              </span>
              <span className="text-zinc-700 dark:text-zinc-200">
                {value.split(urlRegex).map((part, j) =>
                  urlRegex.test(part) ? (
                    <a
                      key={j}
                      href={part}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {part}
                    </a>
                  ) : (
                    <span key={j}>{part}</span>
                  ),
                )}
              </span>
            </div>
          );
        }
        return (
          <div key={i} className="text-zinc-600 dark:text-zinc-300">
            {line.split(urlRegex).map((part, j) =>
              urlRegex.test(part) ? (
                <a
                  key={j}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {part}
                </a>
              ) : (
                <span key={j}>{part}</span>
              ),
            )}
          </div>
        );
      })}
    </>
  );
}

function RdapJsonHighlight({ content }: { content: string }) {
  const tokenRegex =
    /("(?:[^"\\]|\\.)*")\s*:|("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b|\bnull\b)|([{}[\]])|([,:])|([\s]+)/g;

  return (
    <>
      {content.split("\n").map((line, i) => {
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;
        const re = new RegExp(tokenRegex.source, "g");
        while ((match = re.exec(line)) !== null) {
          if (match.index > lastIndex) {
            parts.push(
              <span
                key={`t${lastIndex}`}
                className="text-zinc-600 dark:text-zinc-300"
              >
                {line.slice(lastIndex, match.index)}
              </span>,
            );
          }
          if (match[1]) {
            parts.push(
              <span
                key={`k${match.index}`}
                className="text-sky-600 dark:text-sky-400"
              >
                {match[1]}
              </span>,
              <span
                key={`c${match.index}`}
                className="text-zinc-400 dark:text-zinc-500"
              >
                :
              </span>,
            );
          } else if (match[2]) {
            const str = match[2];
            if (/^"https?:\/\//.test(str)) {
              const url = str.slice(1, -1);
              parts.push(
                <span
                  key={`s${match.index}`}
                  className="text-emerald-600 dark:text-emerald-400"
                >
                  &quot;
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {url}
                  </a>
                  &quot;
                </span>,
              );
            } else {
              parts.push(
                <span
                  key={`s${match.index}`}
                  className="text-emerald-600 dark:text-emerald-400"
                >
                  {str}
                </span>,
              );
            }
          } else if (match[3]) {
            parts.push(
              <span
                key={`n${match.index}`}
                className="text-amber-600 dark:text-amber-400"
              >
                {match[3]}
              </span>,
            );
          } else if (match[4]) {
            parts.push(
              <span
                key={`b${match.index}`}
                className="text-purple-600 dark:text-purple-400"
              >
                {match[4]}
              </span>,
            );
          } else if (match[5]) {
            parts.push(
              <span
                key={`p${match.index}`}
                className="text-zinc-400 dark:text-zinc-500"
              >
                {match[5]}
              </span>,
            );
          } else if (match[6]) {
            parts.push(
              <span
                key={`d${match.index}`}
                className="text-zinc-400 dark:text-zinc-500"
              >
                {match[6]}
              </span>,
            );
          } else if (match[7]) {
            parts.push(<span key={`w${match.index}`}>{match[7]}</span>);
          }
          lastIndex = re.lastIndex;
        }
        if (lastIndex < line.length) {
          parts.push(
            <span
              key={`e${lastIndex}`}
              className="text-zinc-600 dark:text-zinc-300"
            >
              {line.slice(lastIndex)}
            </span>,
          );
        }
        return (
          <div key={i} className="whitespace-pre">
            {parts.length > 0 ? parts : " "}
          </div>
        );
      })}
    </>
  );
}

function ResponsePanel({
  whoisContent,
  rdapContent,
  target,
  copy,
  save,
}: {
  whoisContent: string;
  rdapContent?: string;
  target: string;
  copy: (text: string) => void;
  save: (filename: string, content: string) => void;
}) {
  const { t } = useTranslation();
  const hasWhois = !!whoisContent;
  const hasRdap = !!rdapContent;
  const [activeTab, setActiveTab] = React.useState<"whois" | "rdap">(
    hasWhois ? "whois" : "rdap",
  );

  const currentContent =
    activeTab === "whois" ? whoisContent : rdapContent || "";
  const currentFilename =
    activeTab === "whois"
      ? `${target.replace(/\./g, "-")}-whois.txt`
      : `${target.replace(/\./g, "-")}-rdap.json`;

  return (
    <div className="bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 rounded-xl overflow-hidden border border-border flex flex-col shadow-lg h-full">
      <div className="bg-muted/50 dark:bg-black border-b border-border px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {hasWhois && (
            <button
              onClick={() => setActiveTab("whois")}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] font-mono transition-colors",
                activeTab === "whois"
                  ? "bg-background dark:bg-zinc-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Whois
            </button>
          )}
          {hasRdap && (
            <button
              onClick={() => setActiveTab("rdap")}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] font-mono transition-colors",
                activeTab === "rdap"
                  ? "bg-background dark:bg-zinc-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              RDAP
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => copy(currentContent)}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors uppercase font-medium tracking-wide flex items-center gap-1"
          >
            <RiFileCopyLine className="w-3 h-3" />
            {t("copy")}
          </button>
          <button
            onClick={() => save(currentFilename, currentContent)}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors uppercase font-medium tracking-wide flex items-center gap-1"
          >
            <RiDownloadLine className="w-3 h-3" />
            {t("save")}
          </button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 font-mono text-[11px] leading-relaxed">
          {activeTab === "whois" && whoisContent && (
            <WhoisHighlight content={whoisContent} />
          )}
          {activeTab === "rdap" && rdapContent && (
            <RdapJsonHighlight content={rdapContent} />
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const querySegments: string[] = (context.params?.query as string[]) ?? [];
  const origin = getOrigin(context.req);
  const target = cleanDomain(querySegments.join("/"));
  try {
    const data = await lookupWhoisWithCache(target);
    return {
      props: {
        data: JSON.parse(JSON.stringify(data)),
        target,
        origin,
      },
    };
  } catch (e: any) {
    return {
      props: {
        data: {
          time: 0,
          status: false,
          cached: false,
          error: e?.message || "Lookup failed",
        } as WhoisResult,
        target,
        origin,
      },
    };
  }
}

export default function LookupPage({
  data,
  target,
  origin,
}: {
  data: WhoisResult;
  target: string;
  origin: string;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const [expandStatus, setExpandStatus] = React.useState(false);
  const [showImagePreview, setShowImagePreview] = React.useState(false);
  const [imgWidth, setImgWidth] = React.useState(1200);
  const [imgHeight, setImgHeight] = React.useState(630);
  const [imgTheme, setImgTheme] = React.useState<"light" | "dark">("light");
  const copy = useClipboard();
  const save = useSaver();
  useSearchHotkeys({});

  useEffect(() => {
    setImgTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);

  const current = getWindowHref();
  const queryType = detectQueryType(target);
  const { status, result, error, time } = data;

  const handleSearch = (query: string) => {
    setLoading(true);
    window.location.href = toSearchURI(query);
  };

  useEffect(() => {
    if (status) addHistory(target);
  }, []);

  const registrarIcon = result
    ? getRegistrarIcon(result.registrar, result.registrarURL)
    : null;
  const registrarInitial = result
    ? result.registrar && result.registrar !== "Unknown"
      ? result.registrar.charAt(0).toUpperCase()
      : "?"
    : "?";

  const displayStatuses = useMemo(() => {
    if (!result || result.status.length === 0) return [];
    if (result.status.length > 5 && !expandStatus)
      return result.status.slice(0, 5);
    return result.status;
  }, [result, expandStatus]);

  const hasIpFields =
    result &&
    ((result.cidr && result.cidr !== "Unknown") ||
      (result.netRange && result.netRange !== "Unknown") ||
      (result.netName && result.netName !== "Unknown") ||
      (result.netType && result.netType !== "Unknown") ||
      (result.originAS && result.originAS !== "Unknown") ||
      (result.inetNum && result.inetNum !== "Unknown") ||
      (result.inet6Num && result.inet6Num !== "Unknown"));

  const hasRegistrant =
    result &&
    ((result.registrantOrganization &&
      result.registrantOrganization !== "Unknown") ||
      (result.registrantCountry && result.registrantCountry !== "Unknown") ||
      (result.registrantProvince && result.registrantProvince !== "Unknown") ||
      (result.registrantEmail && result.registrantEmail !== "Unknown") ||
      (result.registrantPhone && result.registrantPhone !== "Unknown"));

  return (
    <>
      <Head>
        <title>{`${target} - WHOIS Lookup`}</title>
        <meta
          key="og:title"
          property="og:title"
          content={`${target} - WHOIS Lookup`}
        />
        <meta
          key="og:image"
          property="og:image"
          content={`${origin}/api/og?query=${encodeURIComponent(target)}&theme=dark`}
        />
        <meta
          key="twitter:title"
          name="twitter:title"
          content={`${target} - WHOIS Lookup`}
        />
        <meta
          key="twitter:image"
          name="twitter:image"
          content={`${origin}/api/og?query=${encodeURIComponent(target)}&theme=dark`}
        />
      </Head>
      <ScrollArea className="w-full h-[calc(100vh-4rem)]">
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-4rem)]">
          <div className="mb-6">
            <div className="relative group">
              <SearchBox
                initialValue={target}
                onSearch={handleSearch}
                loading={loading}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                <KeyboardShortcut k="/" />
              </div>
            </div>
            <SearchHotkeysText className="mt-2 px-1 justify-end" />
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center flex-wrap gap-2 mb-6"
            >
              {result.domainAge !== null && (
                <div className="px-2 py-0.5 rounded-md border border-primary/30 bg-primary/5 flex items-center space-x-1">
                  <RiTimeLine className="w-3 h-3 text-primary shrink-0" />
                  <span className="text-[11px] sm:text-xs font-normal text-primary">
                    {result.domainAge === 0 ? "<1" : result.domainAge}{" "}
                    {result.domainAge === 1 ? t("year") : t("years")}
                  </span>
                </div>
              )}
              {result.registerPrice &&
                result.registerPrice.new !== -1 &&
                result.registerPrice.currency !== "Unknown" && (
                  <Link
                    target="_blank"
                    href={result.registerPrice.externalLink}
                    className="px-2 py-0.5 rounded-md border bg-background flex items-center space-x-1 cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  >
                    <RiBillLine className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span
                      className={cn(
                        "text-[11px] sm:text-xs font-normal text-muted-foreground",
                        result.registerPrice.isPremium && "text-red-500",
                      )}
                    >
                      {t("register_price")}
                      {result.registerPrice.new}{" "}
                      {result.registerPrice.currency.toUpperCase()}
                    </span>
                  </Link>
                )}
              {result.renewPrice &&
                result.renewPrice.renew !== -1 &&
                result.renewPrice.currency !== "Unknown" && (
                  <Link
                    href={result.renewPrice.externalLink}
                    target="_blank"
                    className="px-2 py-0.5 rounded-md border bg-background flex items-center space-x-1 cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  >
                    <RiExchangeDollarFill className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-[11px] sm:text-xs font-normal text-muted-foreground">
                      {t("renew_price")}
                      {result.renewPrice.renew}{" "}
                      {result.renewPrice.currency.toUpperCase()}
                    </span>
                  </Link>
                )}
              {result.transferPrice &&
                result.transferPrice.transfer !== -1 &&
                result.transferPrice.currency !== "Unknown" && (
                  <Link
                    href={result.transferPrice.externalLink}
                    target="_blank"
                    className="px-2 py-0.5 rounded-md border bg-background flex items-center space-x-1 cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  >
                    <RiExchangeDollarFill className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-[11px] sm:text-xs font-normal text-muted-foreground">
                      {t("transfer_price")}
                      {result.transferPrice.transfer}{" "}
                      {result.transferPrice.currency.toUpperCase()}
                    </span>
                  </Link>
                )}
              <div className="flex-grow" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="transition hover:border-muted-foreground shadow-sm"
                    tapEnabled
                  >
                    <RiShareLine className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[200px]">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    {t("share")}
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Whois Lookup: ${target}`)}&url=${encodeURIComponent(current)}`}
                      target="_blank"
                    >
                      <RiTwitterXLine className="w-4 h-4 mr-2" />
                      Twitter / X
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(current)}`}
                      target="_blank"
                    >
                      <RiFacebookFill className="w-4 h-4 mr-2" />
                      Facebook
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`https://reddit.com/submit?url=${encodeURIComponent(current)}`}
                      target="_blank"
                    >
                      <RiRedditLine className="w-4 h-4 mr-2" />
                      Reddit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(current)}`}
                      target="_blank"
                    >
                      <RiWhatsappLine className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`https://t.me/share/url?url=${encodeURIComponent(current)}`}
                      target="_blank"
                    >
                      <RiTelegramLine className="w-4 h-4 mr-2" />
                      Telegram
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => copy(current)}>
                    <RiLinkM className="w-4 h-4 mr-2" />
                    {t("copy_url")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    {t("image")}
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={async () => {
                      const ogUrl = buildOgUrl(target, result);
                      try {
                        const res = await fetch(ogUrl);
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `whois-${target}.png`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success(t("toast.downloaded"));
                      } catch {
                        toast.error(t("toast.download_failed"));
                      }
                    }}
                  >
                    <RiDownloadLine className="w-4 h-4 mr-2" />
                    {t("download_png")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      const ogUrl = buildOgUrl(target, result);
                      try {
                        const res = await fetch(ogUrl);
                        const blob = await res.blob();
                        await navigator.clipboard.write([
                          new ClipboardItem({ "image/png": blob }),
                        ]);
                        toast.success(t("toast.copied_to_clipboard"));
                      } catch {
                        toast.error(t("toast.copy_to_clipboard_failed"));
                      }
                    }}
                  >
                    <RiFileCopyLine className="w-4 h-4 mr-2" />
                    {t("copy_image")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowImagePreview(true)}>
                    <RiCameraLine className="w-4 h-4 mr-2" />
                    {t("preview_customize")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          )}

          {!status && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 space-y-6">
                <div className="glass-panel border border-border rounded-xl p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-red-500"
                    >
                      <path d="m21 21-4.3-4.3" />
                      <circle cx="11" cy="11" r="8" />
                      <path d="m8 8 6 6" />
                      <path d="m14 8-6 6" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {t("lookup_failed")}
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed mb-8">
                    {t("lookup_failed_description")}{" "}
                    <span className="font-mono font-medium text-foreground">
                      {target}
                    </span>
                    {". "}
                    {error || t("lookup_failed_fallback")}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button onClick={() => handleSearch(target)}>
                      {t("try_again")}
                    </Button>
                    <Link href="/">
                      <Button variant="outline">{t("new_search")}</Button>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="glass-panel border border-border rounded-xl p-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      {t("common_issues")}
                    </h3>
                    <ul className="space-y-3">
                      {[
                        {
                          title: t("issue_invalid_tld"),
                          desc: t("issue_invalid_tld_desc"),
                        },
                        {
                          title: t("issue_not_registered"),
                          desc: t("issue_not_registered_desc"),
                        },
                        {
                          title: t("issue_rate_limited"),
                          desc: t("issue_rate_limited_desc"),
                        },
                      ].map((item) => (
                        <li key={item.title} className="flex items-start gap-2">
                          <div className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/30 shrink-0" />
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            <strong className="text-foreground">
                              {item.title}:
                            </strong>{" "}
                            {item.desc}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-panel border border-border rounded-xl p-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                      <RiTimeLine className="w-4 h-4" />
                      {t("query_details")}
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-mono uppercase">
                          {t("target")}
                        </span>
                        <span className="font-mono font-medium">{target}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-mono uppercase">
                          {t("type")}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono"
                        >
                          {queryType}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-mono uppercase">
                          {t("time")}
                        </span>
                        <span className="font-mono">{time.toFixed(2)}s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                {result && (result.rawWhoisContent || result.rawRdapContent) ? (
                  <ResponsePanel
                    whoisContent={result.rawWhoisContent || ""}
                    rdapContent={result.rawRdapContent}
                    target={target}
                    copy={copy}
                    save={save}
                  />
                ) : (
                  <div className="glass-panel border border-border rounded-xl p-6 text-center h-full flex flex-col items-center justify-center">
                    <RiServerLine className="w-8 h-8 text-muted-foreground/30 mb-3" />
                    <p className="text-xs text-muted-foreground">
                      {t("no_raw_response")}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {status && result && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {" "}
                <div className="lg:col-span-8 space-y-6">
                  <div className="glass-panel border border-border rounded-xl p-6 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                      <RiEarthLine className="w-28 h-28" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold uppercase tracking-wider font-mono"
                          >
                            {queryType}
                          </Badge>
                        </div>
                        <h2
                          className="text-3xl sm:text-4xl font-bold tracking-tight mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => copy(result.domain || target)}
                        >
                          {result.domain || target.toUpperCase()}
                        </h2>
                        {result.registrar && result.registrar !== "Unknown" && (
                          <p className="text-muted-foreground text-sm">
                            {t("whois_fields.registrar")}: {result.registrar}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-2">
                        {result.remainingDays !== null ? (
                          result.remainingDays <= 0 ? (
                            <Badge className="bg-red-500 hover:bg-red-600 text-white border-0">
                              <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse mr-1.5" />
                              {t("expired")}
                            </Badge>
                          ) : result.remainingDays <= 60 ? (
                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0">
                              <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse mr-1.5" />
                              {t("expiring_soon")}
                            </Badge>
                          ) : (
                            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground border-0">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
                              {t("active")}
                            </Badge>
                          )
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground"
                          >
                            <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mr-1.5" />
                            N/A
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {time.toFixed(2)}s{data.cached && ` · ${t("cached")}`}
                          {data.source && ` · ${data.source}`}
                        </span>
                      </div>
                    </div>

                    {(result.creationDate !== "Unknown" ||
                      result.expirationDate !== "Unknown" ||
                      result.updatedDate !== "Unknown") && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-8 pt-8 border-t border-border/50">
                        {result.creationDate &&
                          result.creationDate !== "Unknown" && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                                {t("whois_fields.creation_date")}
                              </p>
                              <p className="font-mono text-sm font-medium">
                                {formatDate(result.creationDate)}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {getRelativeTime(result.creationDate, t)}
                              </p>
                            </div>
                          )}
                        {result.expirationDate &&
                          result.expirationDate !== "Unknown" && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                                {t("whois_fields.expiration_date")}
                              </p>
                              <p className="font-mono text-sm font-medium">
                                {formatDate(result.expirationDate)}
                              </p>
                              <p
                                className={cn(
                                  "text-[10px] mt-0.5 font-medium",
                                  result.remainingDays !== null &&
                                    result.remainingDays > 60
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-muted-foreground",
                                )}
                              >
                                {result.remainingDays !== null
                                  ? result.remainingDays > 0
                                    ? t("d_remaining", {
                                        days: result.remainingDays,
                                      })
                                    : t("expired")
                                  : getRelativeTime(result.expirationDate, t)}
                              </p>
                            </div>
                          )}
                        {result.updatedDate &&
                          result.updatedDate !== "Unknown" && (
                            <div className="col-span-2 sm:col-span-1">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                                {t("whois_fields.updated_date")}
                              </p>
                              <p className="font-mono text-sm font-medium">
                                {formatDate(result.updatedDate)}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {getRelativeTime(result.updatedDate, t)}
                              </p>
                            </div>
                          )}
                      </div>
                    )}

                    {hasRegistrant && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
                        {[
                          {
                            label: t("whois_fields.registrant_organization"),
                            value: result.registrantOrganization,
                          },
                          {
                            label: t("whois_fields.registrant_country"),
                            value: result.registrantCountry,
                          },
                          {
                            label: t("whois_fields.registrant_province"),
                            value: result.registrantProvince,
                          },
                          {
                            label: t("whois_fields.registrant_email"),
                            value: result.registrantEmail,
                          },
                          {
                            label: t("whois_fields.registrant_phone"),
                            value: result.registrantPhone,
                          },
                        ]
                          .filter((f) => f.value && f.value !== "Unknown")
                          .map((f, i) => (
                            <div key={i} className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                                {f.label}
                              </p>
                              <p className="text-xs font-mono whitespace-pre-wrap break-all">
                                {f.value}
                              </p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {result.status.length > 0 && (
                      <div className="glass-panel border border-border rounded-xl p-5">
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-muted-foreground"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                          {t("whois_fields.status")}
                        </h3>
                        <div className="space-y-2.5">
                          {displayStatuses.map((s, i) => {
                            const info = getEppStatusInfo(s.status);
                            const color = getEppStatusColor(s.status);
                            const displayName = getEppStatusDisplayName(
                              s.status,
                            );
                            const link = getEppStatusLink(s.status);
                            return (
                              <div key={i} className="flex items-start gap-2.5">
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0 mt-[0.65rem]"
                                  style={{ backgroundColor: color }}
                                />
                                <div className="min-w-0">
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-mono font-medium leading-tight hover:underline"
                                  >
                                    {displayName}
                                  </a>
                                  {info && (
                                    <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                                      {info.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {result.status.length > 5 && (
                          <button
                            onClick={() => setExpandStatus(!expandStatus)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium mt-3"
                          >
                            {expandStatus
                              ? t("show_less")
                              : t("more_count", {
                                  count: result.status.length - 5,
                                })}
                          </button>
                        )}
                      </div>
                    )}

                    {result.nameServers.length > 0 && (
                      <div className="glass-panel border border-border rounded-xl p-5 flex flex-col">
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                          <RiServerLine className="w-4 h-4 text-muted-foreground" />
                          {t("whois_fields.name_servers")}
                        </h3>
                        <div className="space-y-2">
                          {result.nameServers.map((ns, i) => {
                            const nsBrand = getNsBrand(ns);
                            return (
                              <div
                                key={i}
                                className="flex items-center gap-3 p-2 bg-muted/30 border border-border/50 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => copy(ns)}
                              >
                                {nsBrand ? (
                                  nsBrand.slug ? (
                                    nsBrand.slug.startsWith("/") ? (
                                      <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                        <img
                                          src={nsBrand.slug}
                                          alt=""
                                          className="w-3.5 h-3.5 object-contain rounded-sm"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                        <img
                                          src={resolveIconUrl(
                                            nsBrand.slug,
                                            nsBrand.color,
                                            false,
                                          )}
                                          alt=""
                                          className="w-3.5 h-3.5 object-contain dark:hidden"
                                        />
                                        <img
                                          src={resolveIconUrl(
                                            nsBrand.slug,
                                            nsBrand.color,
                                            true,
                                          )}
                                          alt=""
                                          className="w-3.5 h-3.5 object-contain hidden dark:block"
                                        />
                                      </div>
                                    )
                                  ) : (
                                    <div
                                      className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-white text-[8px] font-bold"
                                      style={{ backgroundColor: nsBrand.color }}
                                    >
                                      {nsBrand.brand.charAt(0)}
                                    </div>
                                  )
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-1" />
                                )}
                                <span className="font-mono text-xs text-muted-foreground truncate flex-1">
                                  {ns}
                                </span>
                                {nsBrand && (
                                  <span className="text-[9px] text-muted-foreground/60 shrink-0">
                                    {nsBrand.brand}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {result.dnssec && (
                          <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase">
                              DNSSEC
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">
                              {result.dnssec}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {hasIpFields && (
                      <div className="glass-panel border border-border rounded-xl p-5">
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                          <RiGlobalLine className="w-4 h-4 text-muted-foreground" />
                          {t("whois_fields.network_info")}
                        </h3>
                        <div className="space-y-3">
                          {[
                            {
                              label: t("whois_fields.cidr"),
                              value: result.cidr,
                            },
                            {
                              label: t("whois_fields.net_range"),
                              value: result.netRange,
                            },
                            {
                              label: t("whois_fields.net_name"),
                              value: result.netName,
                            },
                            {
                              label: t("whois_fields.net_type"),
                              value: result.netType,
                            },
                            {
                              label: t("whois_fields.origin_as"),
                              value: result.originAS,
                            },
                            {
                              label: t("whois_fields.inet_num"),
                              value: result.inetNum,
                            },
                            {
                              label: t("whois_fields.inet6_num"),
                              value: result.inet6Num,
                            },
                          ]
                            .filter((f) => f.value && f.value !== "Unknown")
                            .map((f, i) => (
                              <div key={i}>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                                  {f.label}
                                </p>
                                <p className="font-mono text-xs">{f.value}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {result.mozDomainAuthority !== -1 && (
                    <div className="glass-panel border border-border rounded-xl p-5">
                      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <RiBarChartBoxAiFill className="w-4 h-4 text-muted-foreground" />
                        <span>{t("whois_fields.moz_stats")}</span>
                        <Link
                          href="https://moz.com/learn/seo/domain-authority"
                          target="_blank"
                          className="ml-auto text-muted-foreground hover:text-primary transition-colors"
                        >
                          <RiExternalLinkLine className="w-3.5 h-3.5" />
                        </Link>
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div
                          className={cn(
                            "flex flex-col items-center rounded-lg p-3 border",
                            result.mozDomainAuthority > 50
                              ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                              : "bg-muted/30",
                          )}
                        >
                          <span className="text-xs text-muted-foreground mb-1">
                            DA
                          </span>
                          <span
                            className={cn(
                              "text-lg font-semibold",
                              result.mozDomainAuthority > 50 &&
                                "text-green-600 dark:text-green-400",
                            )}
                          >
                            {result.mozDomainAuthority}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "flex flex-col items-center rounded-lg p-3 border",
                            result.mozPageAuthority > 50
                              ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                              : "bg-muted/30",
                          )}
                        >
                          <span className="text-xs text-muted-foreground mb-1">
                            PA
                          </span>
                          <span
                            className={cn(
                              "text-lg font-semibold",
                              result.mozPageAuthority > 50 &&
                                "text-green-600 dark:text-green-400",
                            )}
                          >
                            {result.mozPageAuthority}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "flex flex-col items-center rounded-lg p-3 border",
                            result.mozSpamScore > 5
                              ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                              : "bg-muted/30",
                          )}
                        >
                          <span className="text-xs text-muted-foreground mb-1">
                            Spam
                          </span>
                          <span
                            className={cn(
                              "text-lg font-semibold",
                              result.mozSpamScore > 5
                                ? "text-red-600 dark:text-red-400"
                                : "text-green-600 dark:text-green-400",
                            )}
                          >
                            {result.mozSpamScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="lg:col-span-4 relative overflow-hidden">
                  <div className="flex flex-col gap-6 lg:absolute lg:inset-0 lg:overflow-y-auto">
                    {result.registrar && result.registrar !== "Unknown" && (
                      <div className="glass-panel border border-border rounded-xl p-5 shrink-0 overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold">
                            {t("whois_fields.registrar")}
                          </h3>
                          {result.ianaId && result.ianaId !== "N/A" && (
                            <Link
                              href={`https://www.internic.net/registrars/registrar-${result.ianaId}.html`}
                              target="_blank"
                              className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono hover:bg-muted/80 transition-colors"
                            >
                              IANA: {result.ianaId}
                            </Link>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                          {registrarIcon && registrarIcon.slug ? (
                            registrarIcon.slug.startsWith("/") ? (
                              <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center p-1.5 border shrink-0">
                                <img
                                  src={registrarIcon.slug}
                                  alt=""
                                  className="w-full h-full object-contain rounded-md"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center p-1.5 border shrink-0">
                                <img
                                  src={resolveIconUrl(
                                    registrarIcon.slug,
                                    registrarIcon.color,
                                    false,
                                  )}
                                  alt=""
                                  className="w-full h-full object-contain dark:hidden"
                                />
                                <img
                                  src={resolveIconUrl(
                                    registrarIcon.slug,
                                    registrarIcon.color,
                                    true,
                                  )}
                                  alt=""
                                  className="w-full h-full object-contain hidden dark:block"
                                />
                              </div>
                            )
                          ) : (
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0"
                              style={{
                                backgroundColor: registrarIcon
                                  ? registrarIcon.color
                                  : getRegistrarFallbackColor(result.registrar),
                              }}
                            >
                              {registrarInitial}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {result.registrar}
                            </p>
                            {result.registrarURL &&
                              result.registrarURL !== "Unknown" && (
                                <a
                                  href={
                                    result.registrarURL.startsWith("http")
                                      ? result.registrarURL
                                      : `http://${result.registrarURL}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all block"
                                >
                                  {result.registrarURL}
                                </a>
                              )}
                          </div>
                        </div>
                        {result.whoisServer &&
                          result.whoisServer !== "Unknown" && (
                            <div className="mb-3">
                              <p className="text-[10px] uppercase text-muted-foreground font-medium mb-1">
                                {t("whois_fields.whois_server")}
                              </p>
                              <p className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
                                {result.whoisServer}
                              </p>
                            </div>
                          )}
                        {result.registrantEmail &&
                          result.registrantEmail !== "Unknown" && (
                            <div className="mb-3">
                              <p className="text-[10px] uppercase text-muted-foreground font-medium mb-1">
                                {t("whois_fields.contact_email")}
                              </p>
                              <p className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
                                {result.registrantEmail}
                              </p>
                            </div>
                          )}
                        {result.registrantPhone &&
                          result.registrantPhone !== "Unknown" && (
                            <div>
                              <p className="text-[10px] uppercase text-muted-foreground font-medium mb-1">
                                {t("whois_fields.contact_phone")}
                              </p>
                              <p className="text-xs font-mono text-muted-foreground">
                                {result.registrantPhone}
                              </p>
                            </div>
                          )}
                      </div>
                    )}

                    {(result.rawWhoisContent || result.rawRdapContent) && (
                      <div className="flex-1 min-h-[250px]">
                        <ResponsePanel
                          whoisContent={result.rawWhoisContent}
                          rdapContent={result.rawRdapContent}
                          target={target}
                          copy={copy}
                          save={save}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </main>
      </ScrollArea>
      <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("image_preview")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("width")}</Label>
                <Input
                  type="number"
                  value={imgWidth}
                  onChange={(e) =>
                    setImgWidth(
                      Math.min(
                        4096,
                        Math.max(200, parseInt(e.target.value) || 1200),
                      ),
                    )
                  }
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("height")}</Label>
                <Input
                  type="number"
                  value={imgHeight}
                  onChange={(e) =>
                    setImgHeight(
                      Math.min(
                        4096,
                        Math.max(200, parseInt(e.target.value) || 630),
                      ),
                    )
                  }
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("theme")}</Label>
                <Select
                  value={imgTheme}
                  onValueChange={(v: "light" | "dark") => setImgTheme(v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t("light")}</SelectItem>
                    <SelectItem value="dark">{t("dark")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-lg border overflow-hidden bg-muted/30">
              <img
                src={buildOgUrl(target, result, {
                  w: imgWidth,
                  h: imgHeight,
                  theme: imgTheme,
                })}
                alt="OG Preview"
                className="w-full h-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  const ogUrl = buildOgUrl(target, result, {
                    w: imgWidth,
                    h: imgHeight,
                    theme: imgTheme,
                  });
                  try {
                    const res = await fetch(ogUrl);
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `whois-${target}-${imgWidth}x${imgHeight}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success(t("toast.downloaded"));
                  } catch {
                    toast.error(t("toast.download_failed"));
                  }
                }}
              >
                <RiDownloadLine className="w-3.5 h-3.5 mr-1.5" />
                {t("download")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const ogUrl = buildOgUrl(target, result, {
                    w: imgWidth,
                    h: imgHeight,
                    theme: imgTheme,
                  });
                  try {
                    const res = await fetch(ogUrl);
                    const blob = await res.blob();
                    await navigator.clipboard.write([
                      new ClipboardItem({ "image/png": blob }),
                    ]);
                    toast.success(t("toast.copied_to_clipboard"));
                  } catch {
                    toast.error(t("toast.copy_to_clipboard_failed"));
                  }
                }}
              >
                <RiFileCopyLine className="w-3.5 h-3.5 mr-1.5" />
                {t("copy")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const ogUrl = buildOgUrl(target, result, {
                    w: imgWidth,
                    h: imgHeight,
                    theme: imgTheme,
                  });
                  copy(window.location.origin + ogUrl);
                }}
              >
                <RiLinkM className="w-3.5 h-3.5 mr-1.5" />
                {t("copy_link")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
