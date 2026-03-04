import React from "react";
import Head from "next/head";
import Link from "next/link";
import { GetServerSidePropsContext } from "next";
import { getOrigin } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RiArrowLeftSLine, RiFileCopyLine } from "@remixicon/react";
import { VERSION } from "@/lib/env";
import { useClipboard } from "@/lib/utils";
import { useTranslation, TranslationKey } from "@/lib/i18n";

function JsonHighlight({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const parts: React.ReactNode[] = [];
        let remaining = line;
        let keyIdx = 0;

        while (remaining.length > 0) {
          const wsMatch = remaining.match(/^(\s+)/);
          if (wsMatch && !remaining.match(/^\s*"/)) {
            parts.push(<span key={`ws0-${keyIdx}`}>{wsMatch[1]}</span>);
            remaining = remaining.slice(wsMatch[1].length);
            keyIdx++;
            continue;
          }

          const keyMatch = remaining.match(
            /^(\s*)"((?:[^"\\]|\\.)+)"(\s*:\s*)/,
          );
          if (keyMatch) {
            parts.push(<span key={`ws-${keyIdx}`}>{keyMatch[1]}</span>);
            parts.push(
              <span key={`k-${keyIdx}`} className="text-sky-400">
                &quot;{keyMatch[2]}&quot;
              </span>,
            );
            parts.push(<span key={`c-${keyIdx}`}>{keyMatch[3]}</span>);
            remaining = remaining.slice(keyMatch[0].length);
            keyIdx++;
            continue;
          }

          const strMatch = remaining.match(/^"((?:[^"\\]|\\.)*)"(,?\s*)/);
          if (strMatch) {
            if (strMatch[1] === "..." || strMatch[1].length > 60) {
              parts.push(
                <span key={`s-${keyIdx}`} className="text-zinc-500">
                  &quot;{strMatch[1]}&quot;
                </span>,
              );
            } else {
              parts.push(
                <span key={`s-${keyIdx}`} className="text-emerald-400">
                  &quot;{strMatch[1]}&quot;
                </span>,
              );
            }
            parts.push(<span key={`sc-${keyIdx}`}>{strMatch[2]}</span>);
            remaining = remaining.slice(strMatch[0].length);
            keyIdx++;
            continue;
          }

          const numMatch = remaining.match(/^(-?\d+\.?\d*)(,?\s*)/);
          if (numMatch) {
            parts.push(
              <span key={`n-${keyIdx}`} className="text-amber-400">
                {numMatch[1]}
              </span>,
            );
            parts.push(<span key={`nc-${keyIdx}`}>{numMatch[2]}</span>);
            remaining = remaining.slice(numMatch[0].length);
            keyIdx++;
            continue;
          }

          const boolMatch = remaining.match(/^(true|false|null)(,?\s*)/);
          if (boolMatch) {
            parts.push(
              <span key={`b-${keyIdx}`} className="text-purple-400">
                {boolMatch[1]}
              </span>,
            );
            parts.push(<span key={`bc-${keyIdx}`}>{boolMatch[2]}</span>);
            remaining = remaining.slice(boolMatch[0].length);
            keyIdx++;
            continue;
          }

          const bracketMatch = remaining.match(/^([{}\[\],])(.*)/);
          if (bracketMatch) {
            parts.push(
              <span key={`br-${keyIdx}`} className="text-zinc-500">
                {bracketMatch[1]}
              </span>,
            );
            remaining = bracketMatch[2];
            keyIdx++;
            continue;
          }

          parts.push(<span key={`r-${keyIdx}`}>{remaining}</span>);
          break;
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

function CodeBlock({
  children,
  language,
}: {
  children: string;
  language?: string;
}) {
  const copy = useClipboard();
  const isJson = language === "json" || children.trimStart().startsWith("{");
  return (
    <div className="relative group">
      <ScrollArea className="w-full rounded-lg border border-zinc-800/70 bg-zinc-950">
        <pre className="w-max min-w-full text-zinc-200 p-3 sm:p-4 text-[10px] sm:text-xs font-mono leading-relaxed">
          <code className="block">
            {isJson ? <JsonHighlight content={children} /> : children}
          </code>
        </pre>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <button
        onClick={() => copy(children)}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-800 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-zinc-200"
      >
        <RiFileCopyLine className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function InlineCodeScroll({
  children,
  codeClassName,
}: {
  children: string;
  codeClassName?: string;
}) {
  return (
    <div className="inline-block max-w-full align-middle">
      <ScrollArea className="max-w-full rounded-md">
        <code
          className={`block whitespace-nowrap ${
            codeClassName || "font-mono text-xs bg-muted px-1 py-0.5 rounded"
          }`}
        >
          {children}
        </code>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

function ParamsTable({
  params,
  t,
}: {
  params: {
    name: string;
    type: string;
    required: boolean;
    description: string;
    default?: string;
  }[];
  t: (key: TranslationKey) => string;
}) {
  return (
    <ScrollArea className="w-full rounded-md border border-border/60">
      <table className="min-w-[680px] w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-4 pl-3 font-medium text-muted-foreground">
              {t("docs.parameter")}
            </th>
            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
              {t("type")}
            </th>
            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
              {t("docs.required")}
            </th>
            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
              {t("docs.default")}
            </th>
            <th className="text-left py-2 font-medium text-muted-foreground">
              {t("docs.description_col")}
            </th>
          </tr>
        </thead>
        <tbody>
          {params.map((p) => (
            <tr key={p.name} className="border-b border-border/50">
              <td className="py-2 pr-4 pl-3 font-mono text-foreground">
                {p.name}
              </td>
              <td className="py-2 pr-4 text-muted-foreground">{p.type}</td>
              <td className="py-2 pr-4">
                {p.required ? (
                  <Badge className="text-[9px] bg-red-500/10 text-red-500 hover:bg-red-500/20 border-0">
                    {t("docs.required")}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px]">
                    {t("docs.optional")}
                  </Badge>
                )}
              </td>
              <td className="py-2 pr-4 font-mono text-muted-foreground">
                {p.default || "—"}
              </td>
              <td className="py-2 text-muted-foreground">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return { props: { origin: getOrigin(context.req) } };
}

export default function DocsPage({ origin }: { origin: string }) {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{t("docs.title")} - Next Whois</title>
        <meta
          key="og:title"
          property="og:title"
          content={`${t("docs.title")} - Next Whois`}
        />
        <meta
          key="og:image"
          property="og:image"
          content={`${origin}/banner.png`}
        />
        <meta
          key="twitter:title"
          name="twitter:title"
          content={`${t("docs.title")} - Next Whois`}
        />
        <meta
          key="twitter:image"
          name="twitter:image"
          content={`${origin}/banner.png`}
        />
      </Head>
      <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden">
        <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-4rem)]">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/">
              <Button variant="ghost" size="icon-sm" className="shrink-0">
                <RiArrowLeftSLine className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("docs.title")}
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                v{VERSION}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("docs.description")}
            </p>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base flex-wrap">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0 text-xs font-bold">
                    GET
                  </Badge>
                  <InlineCodeScroll codeClassName="font-mono text-sm">
                    /api/lookup
                  </InlineCodeScroll>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("docs.lookup_description")}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    {t("docs.parameters")}
                  </h3>
                  <ParamsTable
                    t={t}
                    params={[
                      {
                        name: "query",
                        type: "string",
                        required: true,
                        description: t("docs.lookup_query_desc"),
                      },
                    ]}
                  />
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    {t("docs.example_request")}
                  </h3>
                  <CodeBlock>{`curl "https://your-domain.com/api/lookup?query=google.com"`}</CodeBlock>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    {t("docs.success_response")}
                  </h3>
                  <CodeBlock>{`{
  "status": true,
  "time": 1.23,
  "cached": false,
  "source": "rdap",
  "result": {
    "domain": "google.com",
    "registrar": "MarkMonitor Inc.",
    "registrarURL": "http://www.markmonitor.com",
    "ianaId": "292",
    "whoisServer": "whois.markmonitor.com",
    "creationDate": "1997-09-15T04:00:00Z",
    "expirationDate": "2028-09-14T04:00:00Z",
    "updatedDate": "2019-09-09T15:39:04Z",
    "status": [
      { "status": "clientDeleteProhibited", "url": "..." },
      { "status": "clientTransferProhibited", "url": "..." }
    ],
    "nameServers": ["ns1.google.com", "ns2.google.com", "ns3.google.com", "ns4.google.com"],
    "dnssec": "unsigned",
    "domainAge": 28,
    "remainingDays": 945,
    "rawWhoisContent": "Domain Name: GOOGLE.COM\\nRegistry Domain ID: ...",
    "rawRdapContent": "{\\n  \\"objectClassName\\": \\"domain\\",\\n  ...\\n}"
  }
}`}</CodeBlock>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    {t("docs.error_response")}
                  </h3>
                  <CodeBlock>{`{
  "status": false,
  "time": 0.45,
  "error": "No match for domain \\"EXAMPLE.INVALID\\""
}`}</CodeBlock>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base flex-wrap">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0 text-xs font-bold">
                    GET
                  </Badge>
                  <InlineCodeScroll codeClassName="font-mono text-sm">
                    /api/og
                  </InlineCodeScroll>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("docs.og_description")}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    {t("docs.parameters")}
                  </h3>
                  <ParamsTable
                    t={t}
                    params={[
                      {
                        name: "query",
                        type: "string",
                        required: false,
                        description: t("docs.og_query_desc"),
                        default: "—",
                      },
                      {
                        name: "w",
                        type: "number",
                        required: false,
                        description: t("docs.og_width_desc"),
                        default: "1200",
                      },
                      {
                        name: "h",
                        type: "number",
                        required: false,
                        description: t("docs.og_height_desc"),
                        default: "630",
                      },
                      {
                        name: "theme",
                        type: "string",
                        required: false,
                        description: t("docs.og_theme_desc"),
                        default: "light",
                      },
                    ]}
                  />
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    {t("docs.example_request")}
                  </h3>
                  <CodeBlock>{`curl "https://your-domain.com/api/og?query=google.com&theme=dark" -o og.png`}</CodeBlock>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    {t("docs.preview")}
                  </h3>
                  <div className="rounded-lg border overflow-hidden bg-muted/30">
                    <img
                      src="/api/og?query=google.com"
                      alt="OG Image Preview"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 font-mono">
                    /api/og?query=google.com
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">
                  {t("docs.rate_limiting")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                  <span>{t("docs.rate_limiting_desc1")}</span>
                  <InlineCodeScroll>
                    Cache-Control: s-maxage=3600, stale-while-revalidate=86400
                  </InlineCodeScroll>
                  <span>{t("docs.rate_limiting_desc2")}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                  <span>{t("docs.rate_limiting_cached")}</span>
                  <InlineCodeScroll>{`"cached": true`}</InlineCodeScroll>
                  <span>{t("docs.rate_limiting_time")}</span>
                  <InlineCodeScroll>{`"time": 0`}</InlineCodeScroll>
                  <span>.</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 mb-8 text-center">
            <p className="text-xs text-muted-foreground">
              Next Whois v{VERSION} ·{" "}
              <a
                href="https://github.com/zmh-program/next-whois-ui"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
