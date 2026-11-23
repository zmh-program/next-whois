import {
  ChevronDown,
  Clock3,
  FileSearch,
  LockKeyhole,
  RotateCw,
  Search,
  ServerOff,
} from "lucide-react";
import Link from "next/link";
import React, { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import type { WhoisResult } from "@/lib/whois/types";
import type en from "../../locales/en.json";

type Outcome = Exclude<
  keyof typeof en.protocol_status,
  "ok" | "referral" | "title"
>;
type Protocol = "rdap" | "whois" | "whois_https" | "referral";
export type LookupPageData = WhoisResult & {
  errorCode?: Outcome;
  protocolStatus?: Partial<Record<Protocol, Outcome | "ok">>;
  rawWhoisContent?: string;
};

const legacyOutcomes = new Map<string, Outcome>([
  ["Timeout", "timeout"],
  ["No WHOIS/RDAP server available for this TLD", "unsupported"],
  ["WHOIS/RDAP not available for this TLD", "unsupported"],
]);

export function ProtocolRows({
  attempts,
}: {
  attempts: LookupPageData["protocolStatus"];
}) {
  const { t } = useTranslation();
  return (
    <>
      {(["rdap", "whois", "whois_https", "referral"] as const).map((p) => {
        const outcome = attempts?.[p];
        return (
          outcome && (
            <div className="contents" key={p}>
              <dt className="text-muted-foreground">
                {p === "referral"
                  ? t("protocol_status.referral")
                  : p === "whois_https"
                    ? "WHOIS (HTTPS)"
                    : p.toUpperCase()}
              </dt>
              <dd>{t(`protocol_status.${outcome}`)}</dd>
            </div>
          )
        );
      })}
    </>
  );
}

export function LookupFailure({
  data,
  target,
  domain,
  children,
}: {
  data: LookupPageData;
  target: string;
  domain: boolean;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const code = data.errorCode ?? legacyOutcomes.get(data.error ?? "");
  const retry =
    !code ||
    ["timeout", "upstream_failure", "unrecognized_response"].includes(code);
  const restricted =
    code === "reserved" ||
    code === "registration_restricted" ||
    code === "access_denied";
  const Icon = restricted
    ? LockKeyhole
    : code === "timeout" || code === "rate_limited"
      ? Clock3
      : retry
        ? ServerOff
        : FileSearch;
  const guidance =
    code === "not_found" && !domain
      ? "resource_not_found"
      : (code ?? "unknown");
  const title = code ? t(`protocol_status.${code}`) : t("lookup_failed");
  return (
    <section
      aria-labelledby="lookup-outcome"
      className="mx-auto max-w-2xl pb-12"
    >
      <div className="mb-6 flex items-center gap-2 font-mono text-sm text-muted-foreground">
        <Icon aria-hidden className="size-4 shrink-0" />
        <span className="break-all">{target}</span>
      </div>
      <h1
        id="lookup-outcome"
        className="text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        {title}
      </h1>
      <p className="mt-3 max-w-prose text-sm leading-6 text-muted-foreground">
        {t(`lookup_guidance.${guidance}`)}
      </p>
      <div className="mb-8 mt-6 flex flex-wrap gap-2">
        {retry && (
          <Button
            onClick={() => window.location.reload()}
            className="gap-2 rounded-lg"
          >
            <RotateCw className="size-4" />
            {t("try_again")}
          </Button>
        )}
        <Button
          asChild
          variant={retry ? "outline" : "default"}
          className="gap-2 rounded-lg"
        >
          <Link href="/">
            <Search className="size-4" />
            {t("new_search")}
          </Link>
        </Button>
      </div>
      <details className="group border-y">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
          {t("query_details")}
          <ChevronDown
            aria-hidden
            className="size-4 text-muted-foreground group-open:rotate-180"
          />
        </summary>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 pb-4 text-sm">
          <ProtocolRows attempts={data.protocolStatus} />
          {data.errorCode && (
            <>
              <dt className="text-muted-foreground">{t("error_code")}</dt>
              <dd className="break-all font-mono text-xs">{data.errorCode}</dd>
            </>
          )}
          <dt className="text-muted-foreground">{t("time")}</dt>
          <dd className="font-mono text-xs">{data.time.toFixed(2)}s</dd>
        </dl>
        {data.error && data.error !== title && (
          <p className="break-words pb-4 text-sm text-muted-foreground">
            {data.error}
          </p>
        )}
      </details>
      {children}
    </section>
  );
}
