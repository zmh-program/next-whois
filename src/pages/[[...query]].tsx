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
  RiDeleteBinLine,
  RiHistoryLine,
  RiGlobalLine,
  RiKeyboardLine,
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
} from "@remixicon/react";
import React, { useEffect, useMemo, useCallback } from "react";
import {
  addHistory,
  detectQueryType,
  listHistory,
  removeHistory,
} from "@/lib/history";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { WhoisAnalyzeResult, WhoisResult } from "@/lib/whois/types";
import {
  getEppStatusInfo,
  getEppStatusColor,
  getEppStatusDisplayName,
  getEppStatusLink,
} from "@/lib/whois/epp-status";
import { SearchBox } from "@/components/search_box";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { format } from "date-fns";

const LOCALES = ["en", "zh", "zh-tw", "de", "ru", "ja", "fr", "ko"];

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
    tencent: { slug: null, color: "#EB1923" },
    dnspod: { slug: null, color: "#EB1923" },
    digitalocean: { slug: "digitalocean", color: "#0080FF" },
    squarespace: { slug: "squarespace", color: "#000000" },
    wix: { slug: "wix", color: "#0C6EFC" },
    wordpress: { slug: "wordpress", color: "#21759B" },
    automattic: { slug: "wordpress", color: "#21759B" },
    netlify: { slug: "netlify", color: "#00C7B7" },
    vercel: { slug: "vercel", color: "#000000" },
    namedotcom: { slug: null, color: "#236BFF" },
    "name.com": { slug: null, color: "#236BFF" },
    namesilo: { slug: "namesilo", color: "#031B4E" },
    dynadot: { slug: null, color: "#4E2998" },
    enom: { slug: null, color: "#F09B1B" },
    tucows: { slug: null, color: "#F09B1B" },
    networksolutions: { slug: null, color: "#2E8B57" },
    markmonitor: { slug: null, color: "#2B5797" },
    amazon: { slug: null, color: "#FF9900" },
    aws: { slug: null, color: "#FF9900" },
    hover: { slug: null, color: "#3B7DDD" },
    rebel: { slug: null, color: "#3B7DDD" },
    epik: { slug: null, color: "#4A90D9" },
    dreamhost: { slug: null, color: "#0073EC" },
    bluehost: { slug: null, color: "#003580" },
    hostgator: { slug: null, color: "#F8A41B" },
    siteground: { slug: null, color: "#7B3FA0" },
    fastdomain: { slug: null, color: "#003580" },
    huawei: { slug: "huawei", color: "#FF0000" },
    baidu: { slug: "baidu", color: "#2932E1" },
  };

const NS_BRAND_MAP: Record<
  string,
  { brand: string; slug: string | null; color: string }
> = {
  "domaincontrol.com": { brand: "GoDaddy", slug: "godaddy", color: "#1BDBDB" },
  "cloudflare.com": {
    brand: "Cloudflare",
    slug: "cloudflare",
    color: "#F38020",
  },
  "foundationdns.com": {
    brand: "Cloudflare",
    slug: "cloudflare",
    color: "#F38020",
  },
  "foundationdns.net": {
    brand: "Cloudflare",
    slug: "cloudflare",
    color: "#F38020",
  },
  "foundationdns.org": {
    brand: "Cloudflare",
    slug: "cloudflare",
    color: "#F38020",
  },
  "registrar-servers.com": {
    brand: "Namecheap",
    slug: "namecheap",
    color: "#DE3723",
  },
  "namecheaphosting.com": {
    brand: "Namecheap",
    slug: "namecheap",
    color: "#DE3723",
  },
  "porkbun.com": { brand: "Porkbun", slug: "porkbun", color: "#EF7878" },
  "hetzner.com": { brand: "Hetzner", slug: "hetzner", color: "#D50C2D" },
  "hetzner.de": { brand: "Hetzner", slug: "hetzner", color: "#D50C2D" },
  "first-ns.de": { brand: "Hetzner", slug: "hetzner", color: "#D50C2D" },
  "second-ns.de": { brand: "Hetzner", slug: "hetzner", color: "#D50C2D" },
  "second-ns.com": { brand: "Hetzner", slug: "hetzner", color: "#D50C2D" },
  "your-server.de": { brand: "Hetzner", slug: "hetzner", color: "#D50C2D" },
  "ovh.net": { brand: "OVHcloud", slug: "ovh", color: "#123F6D" },
  "ovh.ca": { brand: "OVHcloud", slug: "ovh", color: "#123F6D" },
  "anycast.me": { brand: "OVHcloud", slug: "ovh", color: "#123F6D" },
  "ui-dns.com": { brand: "IONOS", slug: "ionos", color: "#003D8F" },
  "ui-dns.org": { brand: "IONOS", slug: "ionos", color: "#003D8F" },
  "ui-dns.de": { brand: "IONOS", slug: "ionos", color: "#003D8F" },
  "ui-dns.biz": { brand: "IONOS", slug: "ionos", color: "#003D8F" },
  "gandi.net": { brand: "Gandi", slug: "gandi", color: "#6640FE" },
  "digitalocean.com": {
    brand: "DigitalOcean",
    slug: "digitalocean",
    color: "#0080FF",
  },
  "dns-parking.com": {
    brand: "Hostinger",
    slug: "hostinger",
    color: "#673DE6",
  },
  "main-hosting.eu": {
    brand: "Hostinger",
    slug: "hostinger",
    color: "#673DE6",
  },
  "netlify.com": { brand: "Netlify", slug: "netlify", color: "#00C7B7" },
  "nsone.net": { brand: "NS1", slug: null, color: "#760DDE" },
  "vercel-dns.com": { brand: "Vercel", slug: "vercel", color: "#000000" },
  "wixdns.net": { brand: "Wix", slug: "wix", color: "#0C6EFC" },
  "squarespace-dns.com": {
    brand: "Squarespace",
    slug: "squarespace",
    color: "#000000",
  },
  "squarespace.com": {
    brand: "Squarespace",
    slug: "squarespace",
    color: "#000000",
  },
  "wordpress.com": { brand: "WordPress", slug: "wordpress", color: "#21759B" },
  awsdns: { brand: "AWS Route 53", slug: null, color: "#232F3E" },
  "azure-dns.com": { brand: "Azure DNS", slug: null, color: "#0078D4" },
  "azure-dns.net": { brand: "Azure DNS", slug: null, color: "#0078D4" },
  "azure-dns.org": { brand: "Azure DNS", slug: null, color: "#0078D4" },
  "azure-dns.info": { brand: "Azure DNS", slug: null, color: "#0078D4" },
  "googledomains.com": { brand: "Google", slug: "google", color: "#000000" },
  "google.com": { brand: "Google", slug: "google", color: "#000000" },
  "linode.com": { brand: "Akamai", slug: "akamai", color: "#0096D6" },
  "dns.he.net": { brand: "Hurricane Electric", slug: null, color: "#E40000" },
  "dnspod.net": { brand: "DNSPod", slug: null, color: "#4478E6" },
  "dnsimple.com": { brand: "DNSimple", slug: null, color: "#205EBB" },
  "dnsimple-edge.net": { brand: "DNSimple", slug: null, color: "#205EBB" },
  "cloudns.net": { brand: "ClouDNS", slug: null, color: "#4FA3D7" },
  "afraid.org": { brand: "FreeDNS", slug: null, color: "#27AE60" },
  "name.com": { brand: "Name.com", slug: null, color: "#236BFF" },
  "hover.com": { brand: "Hover", slug: null, color: "#3B7DDD" },
  "dynadot.com": { brand: "Dynadot", slug: null, color: "#4E2998" },
  "name-services.com": { brand: "Enom", slug: null, color: "#F09B1B" },
  "worldnic.com": { brand: "Network Solutions", slug: null, color: "#2E8B57" },
  "dnsowl.com": { brand: "NameSilo", slug: "namesilo", color: "#031B4E" },
  "namesilo.com": { brand: "NameSilo", slug: "namesilo", color: "#031B4E" },
  "hichina.com": {
    brand: "Alibaba Cloud",
    slug: "alibabacloud",
    color: "#FF6A00",
  },
  "alidns.com": {
    brand: "Alibaba Cloud",
    slug: "alibabacloud",
    color: "#FF6A00",
  },
  "bdydns.cn": { brand: "Baidu Cloud", slug: "baidu", color: "#2932E1" },
  "bdydns.com": { brand: "Baidu Cloud", slug: "baidu", color: "#2932E1" },
  "huaweicloud-dns.com": {
    brand: "Huawei Cloud",
    slug: "huawei",
    color: "#FF0000",
  },
  "huaweicloud-dns.cn": {
    brand: "Huawei Cloud",
    slug: "huawei",
    color: "#FF0000",
  },
  "huaweicloud-dns.net": {
    brand: "Huawei Cloud",
    slug: "huawei",
    color: "#FF0000",
  },
  "hwclouds-dns.com": {
    brand: "Huawei Cloud",
    slug: "huawei",
    color: "#FF0000",
  },
  "hwclouds-dns.net": {
    brand: "Huawei Cloud",
    slug: "huawei",
    color: "#FF0000",
  },
};

function getNsBrand(
  ns: string,
): { brand: string; slug: string | null; color: string } | null {
  const lower = ns.toLowerCase();
  for (const [pattern, info] of Object.entries(NS_BRAND_MAP)) {
    if (lower.includes(pattern)) return info;
  }
  return null;
}

function getRegistrarIcon(
  registrar: string,
): { slug: string | null; color: string } | null {
  if (!registrar || registrar === "Unknown") return null;
  const normalized = registrar.toLowerCase().replace(/[\s.,\-_()]+/g, "");
  for (const [key, info] of Object.entries(REGISTRAR_ICONS)) {
    if (normalized.includes(key)) return info;
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

function getRegistrarFallbackColor(registrar: string): string {
  let hash = 0;
  for (let i = 0; i < registrar.length; i++) {
    hash = registrar.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

function getRelativeTime(dateStr: string): string {
  if (!dateStr || dateStr === "Unknown") return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 0) {
      const abs = Math.abs(diffDays);
      if (abs < 30) return `in ${abs}d`;
      if (abs < 365) return `in ${Math.floor(abs / 30)}mo`;
      return `in ${Math.floor(abs / 365)}y`;
    }
    if (diffDays < 1) return "today";
    if (diffDays < 30) return `${diffDays}d ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
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

type HomeProps = { mode: "home"; origin: string };
type LookupProps = { mode: "lookup"; data: WhoisResult; target: string; origin: string };
type PageProps = HomeProps | LookupProps;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const querySegments: string[] = (context.params?.query as string[]) ?? [];
  const origin = getOrigin(context.req);

  if (querySegments.length === 0) {
    return { props: { mode: "home", origin } };
  }

  if (querySegments.length === 1) {
    if (LOCALES.includes(querySegments[0])) {
      return { props: { mode: "home", origin } };
    }
    const target = cleanDomain(querySegments[0]);
    const data = await lookupWhoisWithCache(target);
    return {
      props: {
        mode: "lookup",
        data: JSON.parse(JSON.stringify(data)),
        target,
        origin,
      },
    };
  }

  if (querySegments.length === 2) {
    const target = cleanDomain(querySegments[1]);
    const data = await lookupWhoisWithCache(target);
    return {
      props: {
        mode: "lookup",
        data: JSON.parse(JSON.stringify(data)),
        target,
        origin,
      },
    };
  }

  return { notFound: true };
}

function KeyboardShortcut({ k }: { k: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-[9px] font-sans font-medium text-muted-foreground bg-muted/50 border border-border/50 rounded-[3px] mx-0.5 select-none">
      {k}
    </kbd>
  );
}

function ShortcutsList() {
  return (
    <div className="grid gap-0.5 p-1">
      {[
        { label: "Search", keys: ["/"] },
        { label: "Clear / Blur", keys: ["Esc"] },
        { label: "Shortcuts", keys: ["?"] },
      ].map((item, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted/50 transition-colors"
        >
          <span className="text-[10px] text-muted-foreground/80 font-medium">
            {item.label}
          </span>
          <div className="flex items-center">
            {item.keys.map((k, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <span className="text-[9px] text-muted-foreground mx-0.5">
                    +
                  </span>
                )}
                <KeyboardShortcut k={k} />
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function QueryTypeIcon({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  const config = {
    domain: {
      label: "",
      icon: RiGlobalLine,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    ipv4: {
      label: "4",
      icon: null,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    ipv6: {
      label: "6",
      icon: null,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    asn: {
      label: "AS",
      icon: null,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    cidr: {
      label: "/",
      icon: null,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
  }[type] || {
    label: "?",
    icon: null,
    color: "text-gray-500",
    bg: "bg-gray-500/10",
  };

  if (config.icon) {
    const Icon = config.icon;
    return <Icon className={cn("w-3.5 h-3.5", config.color, className)} />;
  }
  return (
    <span className={cn("text-[9px] font-bold", config.color, className)}>
      {config.label}
    </span>
  );
}

function getDateGroupLabel(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const itemDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (itemDate.getTime() === today.getTime()) return "Today";
  if (itemDate.getTime() === yesterday.getTime()) return "Yesterday";
  if (date.getFullYear() === now.getFullYear()) return format(date, "MMM dd");
  return format(date, "MMM dd, yyyy");
}

function HomePage() {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [showShortcuts, setShowShortcuts] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const active = document.activeElement;
      const isInput =
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.hasAttribute("contenteditable"));

      if (e.key === "/" && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        document.getElementById("main-search-input")?.focus();
        return;
      }
      if (e.key === "?" && !isInput) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
        return;
      }
      if (e.key === "Escape") {
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
        const mainInput = document.getElementById("main-search-input");
        if (active === mainInput) mainInput?.blur();
        else if (active instanceof HTMLElement) active.blur();
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showShortcuts]);

  const handleSearch = useCallback((query: string) => {
    setLoading(true);
    window.location.href = toSearchURI(query);
  }, []);

  const allHistory = useMemo(() => {
    if (!mounted) return [];
    return listHistory().sort((a, b) => b.timestamp - a.timestamp);
  }, [mounted, refreshTrigger]);

  const groupedHistory = useMemo(() => {
    const groups: { label: string; items: typeof allHistory }[] = [];
    if (allHistory.length === 0) return groups;
    let currentLabel = "";
    let currentGroup: typeof allHistory = [];
    for (const item of allHistory) {
      const label = getDateGroupLabel(item.timestamp);
      if (label !== currentLabel) {
        if (currentGroup.length > 0)
          groups.push({ label: currentLabel, items: currentGroup });
        currentLabel = label;
        currentGroup = [item];
      } else {
        currentGroup.push(item);
      }
    }
    if (currentGroup.length > 0)
      groups.push({ label: currentLabel, items: currentGroup });
    return groups;
  }, [allHistory]);

  const handleRemoveHistory = useCallback(
    (query: string) => {
      if (!mounted) return;
      removeHistory(query);
      setRefreshTrigger((prev) => prev + 1);
    },
    [mounted],
  );

  return (
    <ScrollArea className="w-full h-[calc(100vh-4rem)]">
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-4rem)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative group">
            <SearchBox onSearch={handleSearch} loading={loading} autoFocus />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
              <KeyboardShortcut k="/" />
            </div>
          </div>
          <Popover open={showShortcuts} onOpenChange={setShowShortcuts}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground"
                title="Keyboard Shortcuts (?)"
              >
                <RiKeyboardLine className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-0" sideOffset={5}>
              <ShortcutsList />
            </PopoverContent>
          </Popover>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {allHistory.length > 0 ? (
            <div className="space-y-1">
              {groupedHistory.map((group) => (
                <div key={group.label}>
                  <div className="flex items-center gap-3 py-2 px-1">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                      {group.label}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  {group.items.map((item) => (
                    <Link
                      key={`${item.query}-${item.timestamp}`}
                      href={toSearchURI(item.query)}
                      onClick={() => handleSearch(item.query)}
                      className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-md grid place-items-center border border-border bg-muted/20 group-hover:border-primary/30 shrink-0">
                        <QueryTypeIcon type={item.queryType} />
                      </div>
                      <span className="text-sm font-medium truncate flex-1 min-w-0">
                        {item.query}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[8px] px-1.5 py-0 uppercase tracking-wider shrink-0"
                      >
                        {item.queryType}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                        {format(item.timestamp, "h:mm a")}
                      </span>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 shrink-0"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveHistory(item.query);
                        }}
                      >
                        <RiDeleteBinLine className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <RiHistoryLine className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {t("no_history_title")}
              </h3>
              <p className="text-xs text-muted-foreground/70">
                {t("no_history_description")}
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </ScrollArea>
  );
}

function LookupPage({ data, target, origin }: { data: WhoisResult; target: string; origin: string }) {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const [expandStatus, setExpandStatus] = React.useState(false);
  const [showImagePreview, setShowImagePreview] = React.useState(false);
  const [imgWidth, setImgWidth] = React.useState(1200);
  const [imgHeight, setImgHeight] = React.useState(630);
  const [imgTheme, setImgTheme] = React.useState<"light" | "dark">("light");
  const copy = useClipboard();
  const save = useSaver();

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

  const registrarIcon = result ? getRegistrarIcon(result.registrar) : null;
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
        <meta key="og:title" property="og:title" content={`${target} - WHOIS Lookup`} />
        <meta
          key="og:image"
          property="og:image"
          content={`${origin}/api/og?query=${encodeURIComponent(target)}&theme=dark`}
        />
        <meta key="twitter:title" name="twitter:title" content={`${target} - WHOIS Lookup`} />
        <meta
          key="twitter:image"
          name="twitter:image"
          content={`${origin}/api/og?query=${encodeURIComponent(target)}&theme=dark`}
        />
      </Head>
      <ScrollArea className="w-full h-[calc(100vh-4rem)]">
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-4rem)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 relative group">
              <SearchBox
                initialValue={target}
                onSearch={handleSearch}
                loading={loading}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                <KeyboardShortcut k="/" />
              </div>
            </div>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center flex-wrap gap-2 mb-6"
            >
              {result.domainAge !== null && (
                <div className="px-2 py-0.5 rounded-md border bg-background flex items-center space-x-1">
                  <RiTimeLine className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="text-[11px] sm:text-xs font-normal text-muted-foreground">
                    {result.domainAge === 0 ? "<1" : result.domainAge}{" "}
                    {result.domainAge === 1 ? "year" : "years"}
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
                      Transfer {result.transferPrice.transfer}{" "}
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
                    Share
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
                    Copy URL
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Image
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
                        toast.success("Downloaded");
                      } catch {
                        toast.error("Failed to download");
                      }
                    }}
                  >
                    <RiDownloadLine className="w-4 h-4 mr-2" />
                    Download PNG
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
                        toast.success("Copied to clipboard");
                      } catch {
                        toast.error("Failed to copy");
                      }
                    }}
                  >
                    <RiFileCopyLine className="w-4 h-4 mr-2" />
                    Copy Image
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowImagePreview(true)}>
                    <RiCameraLine className="w-4 h-4 mr-2" />
                    Preview & Customize
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
                  <h2 className="text-2xl font-bold mb-2">Lookup Failed</h2>
                  <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed mb-8">
                    {"We couldn't find any registry data for "}
                    <span className="font-mono font-medium text-foreground">
                      {target}
                    </span>
                    {". "}
                    {error ||
                      "This could be due to a typo or the domain might not be registered yet."}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button onClick={() => handleSearch(target)}>
                      Try Again
                    </Button>
                    <Link href="/">
                      <Button variant="outline">New Search</Button>
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
                      Common Issues
                    </h3>
                    <ul className="space-y-3">
                      {[
                        {
                          title: "Invalid TLD",
                          desc: "Ensure the domain extension (e.g., .com, .io) is typed correctly.",
                        },
                        {
                          title: "Not Registered",
                          desc: "The domain might be available for purchase.",
                        },
                        {
                          title: "Rate Limited",
                          desc: "The WHOIS server may have temporarily blocked requests.",
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
                      Query Details
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-mono uppercase">
                          Target
                        </span>
                        <span className="font-mono font-medium">{target}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-mono uppercase">
                          Type
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
                          Time
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
                  <div className="glass-panel border border-border rounded-xl p-6 text-center">
                    <RiServerLine className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-xs text-muted-foreground">
                      No raw response data available
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
                              Expired
                            </Badge>
                          ) : result.remainingDays <= 60 ? (
                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0">
                              <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse mr-1.5" />
                              {t("expiring_soon")}
                            </Badge>
                          ) : (
                            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground border-0">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
                              Active
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
                          {time.toFixed(2)}s{data.cached && " · cached"}
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
                                {getRelativeTime(result.creationDate)}
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
                                    ? `${result.remainingDays}d remaining`
                                    : "Expired"
                                  : getRelativeTime(result.expirationDate)}
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
                                {getRelativeTime(result.updatedDate)}
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
                              ? "Show less"
                              : `+${result.status.length - 5} more`}
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
                                    <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                      <img
                                        src={`https://cdn.simpleicons.org/${nsBrand.slug}/${nsBrand.color.replace("#", "")}`}
                                        alt=""
                                        className="w-3.5 h-3.5 object-contain dark:hidden"
                                      />
                                      <img
                                        src={`https://cdn.simpleicons.org/${nsBrand.slug}/${getDarkModeIconColor(nsBrand.color)}`}
                                        alt=""
                                        className="w-3.5 h-3.5 object-contain hidden dark:block"
                                      />
                                    </div>
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
                          Network Info
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
                            <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center p-1.5 border shrink-0">
                              <img
                                src={`https://cdn.simpleicons.org/${registrarIcon.slug}/${registrarIcon.color.replace("#", "")}`}
                                alt=""
                                className="w-full h-full object-contain dark:hidden"
                              />
                              <img
                                src={`https://cdn.simpleicons.org/${registrarIcon.slug}/${getDarkModeIconColor(registrarIcon.color)}`}
                                alt=""
                                className="w-full h-full object-contain hidden dark:block"
                              />
                            </div>
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
                                Whois Server
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
                                Contact Email
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
                                Contact Phone
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
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Width</Label>
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
                <Label className="text-xs">Height</Label>
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
                <Label className="text-xs">Theme</Label>
                <Select
                  value={imgTheme}
                  onValueChange={(v: "light" | "dark") => setImgTheme(v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
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
                    toast.success("Downloaded");
                  } catch {
                    toast.error("Failed to download");
                  }
                }}
              >
                <RiDownloadLine className="w-3.5 h-3.5 mr-1.5" />
                Download
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
                    toast.success("Copied to clipboard");
                  } catch {
                    toast.error("Failed to copy");
                  }
                }}
              >
                <RiFileCopyLine className="w-3.5 h-3.5 mr-1.5" />
                Copy
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
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
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
            <div key={i} className="text-zinc-600 italic">
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
              <span className="text-sky-400 font-medium">{key}</span>
              <span className="text-zinc-200">
                {value.split(urlRegex).map((part, j) =>
                  urlRegex.test(part) ? (
                    <a
                      key={j}
                      href={part}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
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
          <div key={i} className="text-zinc-300">
            {line.split(urlRegex).map((part, j) =>
              urlRegex.test(part) ? (
                <a
                  key={j}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
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
              <span key={`t${lastIndex}`} className="text-zinc-300">
                {line.slice(lastIndex, match.index)}
              </span>,
            );
          }
          if (match[1]) {
            parts.push(
              <span key={`k${match.index}`} className="text-sky-400">
                {match[1]}
              </span>,
              <span key={`c${match.index}`} className="text-zinc-500">
                :
              </span>,
            );
          } else if (match[2]) {
            const str = match[2];
            if (/^"https?:\/\//.test(str)) {
              const url = str.slice(1, -1);
              parts.push(
                <span key={`s${match.index}`} className="text-emerald-400">
                  &quot;
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline"
                  >
                    {url}
                  </a>
                  &quot;
                </span>,
              );
            } else {
              parts.push(
                <span key={`s${match.index}`} className="text-emerald-400">
                  {str}
                </span>,
              );
            }
          } else if (match[3]) {
            parts.push(
              <span key={`n${match.index}`} className="text-amber-400">
                {match[3]}
              </span>,
            );
          } else if (match[4]) {
            parts.push(
              <span key={`b${match.index}`} className="text-purple-400">
                {match[4]}
              </span>,
            );
          } else if (match[5]) {
            parts.push(
              <span key={`p${match.index}`} className="text-zinc-500">
                {match[5]}
              </span>,
            );
          } else if (match[6]) {
            parts.push(
              <span key={`d${match.index}`} className="text-zinc-500">
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
            <span key={`e${lastIndex}`} className="text-zinc-300">
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
    <div className="bg-zinc-900 dark:bg-zinc-950 text-zinc-300 rounded-xl overflow-hidden border border-zinc-800 flex flex-col shadow-lg h-full">
      <div className="bg-zinc-950 dark:bg-black border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* <span className="text-xs font-mono text-zinc-500 mr-2 hidden sm:inline">
            RESPONSE
          </span> */}
          {hasWhois && (
            <button
              onClick={() => setActiveTab("whois")}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] font-mono transition-colors",
                activeTab === "whois"
                  ? "bg-zinc-800 text-zinc-200"
                  : "text-zinc-500 hover:text-zinc-300",
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
                  ? "bg-zinc-800 text-zinc-200"
                  : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              RDAP
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => copy(currentContent)}
            className="text-[10px] text-zinc-500 hover:text-white transition-colors uppercase font-medium tracking-wide flex items-center gap-1"
          >
            <RiFileCopyLine className="w-3 h-3" />
            Copy
          </button>
          <button
            onClick={() => save(currentFilename, currentContent)}
            className="text-[10px] text-zinc-500 hover:text-white transition-colors uppercase font-medium tracking-wide flex items-center gap-1"
          >
            <RiDownloadLine className="w-3 h-3" />
            Save
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

export default function Page(props: PageProps) {
  if (props.mode === "home") return <HomePage />;
  return <LookupPage data={props.data} target={props.target} origin={props.origin} />;
}
