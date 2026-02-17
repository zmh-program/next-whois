import React from "react";
import Head from "next/head";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RiArrowLeftSLine, RiFileCopyLine } from "@remixicon/react";
import { VERSION } from "@/lib/env";
import { useClipboard } from "@/lib/utils";

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

          const keyMatch = remaining.match(/^(\s*)"([^"]+)"(\s*:\s*)/);
          if (keyMatch) {
            parts.push(<span key={`ws-${keyIdx}`}>{keyMatch[1]}</span>);
            parts.push(<span key={`k-${keyIdx}`} className="text-sky-400">&quot;{keyMatch[2]}&quot;</span>);
            parts.push(<span key={`c-${keyIdx}`}>{keyMatch[3]}</span>);
            remaining = remaining.slice(keyMatch[0].length);
            keyIdx++;
            continue;
          }

          const strMatch = remaining.match(/^"([^"]*)"(,?\s*)/);
          if (strMatch) {
            if (strMatch[1] === "..." || strMatch[1].length > 60) {
              parts.push(<span key={`s-${keyIdx}`} className="text-zinc-500">&quot;{strMatch[1]}&quot;</span>);
            } else {
              parts.push(<span key={`s-${keyIdx}`} className="text-emerald-400">&quot;{strMatch[1]}&quot;</span>);
            }
            parts.push(<span key={`sc-${keyIdx}`}>{strMatch[2]}</span>);
            remaining = remaining.slice(strMatch[0].length);
            keyIdx++;
            continue;
          }

          const numMatch = remaining.match(/^(-?\d+\.?\d*)(,?\s*)/);
          if (numMatch) {
            parts.push(<span key={`n-${keyIdx}`} className="text-amber-400">{numMatch[1]}</span>);
            parts.push(<span key={`nc-${keyIdx}`}>{numMatch[2]}</span>);
            remaining = remaining.slice(numMatch[0].length);
            keyIdx++;
            continue;
          }

          const boolMatch = remaining.match(/^(true|false|null)(,?\s*)/);
          if (boolMatch) {
            parts.push(<span key={`b-${keyIdx}`} className="text-purple-400">{boolMatch[1]}</span>);
            parts.push(<span key={`bc-${keyIdx}`}>{boolMatch[2]}</span>);
            remaining = remaining.slice(boolMatch[0].length);
            keyIdx++;
            continue;
          }

          const bracketMatch = remaining.match(/^([{}\[\],])(.*)/);
          if (bracketMatch) {
            parts.push(<span key={`br-${keyIdx}`} className="text-zinc-500">{bracketMatch[1]}</span>);
            remaining = bracketMatch[2];
            keyIdx++;
            continue;
          }

          parts.push(<span key={`r-${keyIdx}`}>{remaining}</span>);
          break;
        }

        return <div key={i} className="whitespace-pre">{parts.length > 0 ? parts : " "}</div>;
      })}
    </>
  );
}

function CodeBlock({ children, language }: { children: string; language?: string }) {
  const copy = useClipboard();
  const isJson = language === "json" || children.trimStart().startsWith("{");
  return (
    <div className="relative group">
      <pre className="bg-zinc-950 text-zinc-200 rounded-lg p-4 text-xs font-mono overflow-x-auto leading-relaxed">
        <code>{isJson ? <JsonHighlight content={children} /> : children}</code>
      </pre>
      <button
        onClick={() => copy(children)}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-800 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-zinc-200"
      >
        <RiFileCopyLine className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ParamsTable({ params }: { params: { name: string; type: string; required: boolean; description: string; default?: string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Parameter</th>
            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Type</th>
            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Required</th>
            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Default</th>
            <th className="text-left py-2 font-medium text-muted-foreground">Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p) => (
            <tr key={p.name} className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-foreground">{p.name}</td>
              <td className="py-2 pr-4 text-muted-foreground">{p.type}</td>
              <td className="py-2 pr-4">
                {p.required ? (
                  <Badge className="text-[9px] bg-red-500/10 text-red-500 hover:bg-red-500/20 border-0">Required</Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px]">Optional</Badge>
                )}
              </td>
              <td className="py-2 pr-4 font-mono text-muted-foreground">{p.default || "—"}</td>
              <td className="py-2 text-muted-foreground">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DocsPage() {
  return (
    <>
      <Head>
        <title>API Documentation - Next Whois</title>
        <meta property="og:title" content="API Documentation - Next Whois" />
      </Head>
      <ScrollArea className="w-full h-[calc(100vh-4rem)]">
        <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-4rem)]">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/">
              <Button variant="ghost" size="icon-sm" className="shrink-0">
                <RiArrowLeftSLine className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">API Documentation</h1>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">v{VERSION}</p>
            </div>
          </div>

          <div className="space-y-8">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Next Whois provides a simple REST API for programmatic WHOIS/RDAP lookups and dynamic OG image generation. All endpoints are publicly accessible and require no authentication.
            </p>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0 text-xs font-bold">GET</Badge>
                  <code className="font-mono text-sm">/api/lookup</code>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Query WHOIS/RDAP information for a domain, IP address, ASN, or CIDR range.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Parameters</h3>
                  <ParamsTable params={[
                    { name: "query", type: "string", required: true, description: "Domain name, IPv4/IPv6 address, ASN (e.g. AS13335), or CIDR range" },
                  ]} />
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Example Request</h3>
                  <CodeBlock>{`curl "https://your-domain.com/api/lookup?query=google.com"`}</CodeBlock>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Success Response</h3>
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
      { "status": "clientTransferProhibited", "url": "..." },
      { "status": "clientUpdateProhibited", "url": "..." },
      { "status": "serverDeleteProhibited", "url": "..." },
      { "status": "serverTransferProhibited", "url": "..." },
      { "status": "serverUpdateProhibited", "url": "..." }
    ],
    "nameServers": ["ns1.google.com", "ns2.google.com", "ns3.google.com", "ns4.google.com"],
    "dnssec": "unsigned",
    "domainAge": 28,
    "remainingDays": 945,
    "rawWhoisContent": "...",
    "rawRdapContent": "..."
  }
}`}</CodeBlock>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Error Response</h3>
                  <CodeBlock>{`{
  "status": false,
  "time": 0.45,
  "error": "No match for domain \"EXAMPLE.INVALID\"",
  "rawWhoisContent": "% IANA WHOIS server\\n% for more information..."
}`}</CodeBlock>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0 text-xs font-bold">GET</Badge>
                  <code className="font-mono text-sm">/api/og</code>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate a dynamic Open Graph image. Returns a PNG image.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Parameters</h3>
                  <ParamsTable params={[
                    { name: "domain", type: "string", required: false, description: "Domain name to display on the image", default: "—" },
                    { name: "registrar", type: "string", required: false, description: "Registrar name", default: "—" },
                    { name: "created", type: "string", required: false, description: "Creation date (e.g. 2020-01-01)", default: "—" },
                    { name: "expires", type: "string", required: false, description: "Expiration date", default: "—" },
                    { name: "updated", type: "string", required: false, description: "Last updated date", default: "—" },
                    { name: "status", type: "string", required: false, description: "Comma-separated EPP status codes", default: "—" },
                    { name: "ns", type: "string", required: false, description: "Comma-separated nameservers", default: "—" },
                    { name: "age", type: "number", required: false, description: "Domain age in years", default: "—" },
                    { name: "remaining", type: "number", required: false, description: "Remaining days until expiration", default: "—" },
                    { name: "dnssec", type: "string", required: false, description: "DNSSEC status", default: "—" },
                    { name: "whoisServer", type: "string", required: false, description: "WHOIS server hostname", default: "—" },
                    { name: "registrantOrg", type: "string", required: false, description: "Registrant organization", default: "—" },
                    { name: "country", type: "string", required: false, description: "Registrant country", default: "—" },
                    { name: "w", type: "number", required: false, description: "Image width in pixels (200-4096)", default: "1200" },
                    { name: "h", type: "number", required: false, description: "Image height in pixels (200-4096)", default: "630" },
                    { name: "theme", type: "string", required: false, description: "Color theme: \"light\" or \"dark\"", default: "light" },
                  ]} />
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Example Request</h3>
                  <CodeBlock>{`curl "https://your-domain.com/api/og?domain=google.com&theme=dark" -o og.png`}</CodeBlock>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Preview</h3>
                  <div className="rounded-lg border overflow-hidden bg-muted/30">
                    <img
                      src="/api/og?domain=google.com"
                      alt="OG Image Preview"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 font-mono">/api/og?domain=google.com</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Rate Limiting & Caching</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Successful WHOIS lookup responses are cached server-side (Redis) and served with <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Cache-Control: s-maxage=3600, stale-while-revalidate=86400</code> headers.
                </p>
                <p>
                  Cached responses include <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{`"cached": true`}</code> in the JSON body and report <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{`"time": 0`}</code>.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 mb-8 text-center">
            <p className="text-xs text-muted-foreground">
              Next Whois v{VERSION} · <a href="https://github.com/zmh-program/next-whois-ui" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
            </p>
          </div>
        </main>
      </ScrollArea>
    </>
  );
}
