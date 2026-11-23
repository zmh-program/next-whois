import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";
import type { NextRouter } from "next/router";
import { expect, it, vi } from "vitest";
import LookupPage from "@/pages/[...query]";
import { initialWhoisAnalyzeResult } from "./whois/types";

vi.mock("next/font/local", () => ({
  default: () => ({ className: "", variable: "" }),
}));
vi.mock("./whois/lookup", () => ({ lookupWhoisWithCache: vi.fn() }));

function render(data: Record<string, unknown>) {
  return renderToStaticMarkup(
    React.createElement(
      RouterContext.Provider,
      {
        value: {
          locale: "en",
          pathname: "/[...query]",
          asPath: "/example.net",
        } as NextRouter,
      },
      React.createElement(LookupPage, {
        target: "example.net",
        origin: "https://example.org",
        data: { status: true, time: 1, ...data },
      }),
    ),
  );
}

it("leads with the resource heading and keeps the raw exchange in a closed disclosure", () => {
  const html = render({
    result: {
      ...initialWhoisAnalyzeResult,
      domain: "example.net",
      rawWhoisContent: "Domain Name: EXAMPLE.NET",
    },
  });
  expect(html).toMatch(/<h1[^>]*>.*?example\.net.*?<\/h1>/);
  expect(html).toMatch(/<details[^>]*><summary/);
  expect(html).not.toMatch(/<details[^>]* open/);
});
it("preserves the upstream message and keeps diagnostics collapsed for legacy errors", () => {
  const html = render({ status: false, error: "Temporary network error" });
  expect(html).toMatch(/<h1[^>]*>Lookup Failed<\/h1>/);
  expect(html).toContain("Temporary network error");
  expect(html).toContain("Try Again");
  expect(html).not.toContain("The domain might be available for purchase");
});
it.each([
  ["registration_restricted", "Registration eligibility restricted", false],
  ["timeout", "Timed out", true],
  ["not_found", "No matching record", false],
] as const)(
  "presents the supplied %s outcome and appropriate action",
  (errorCode, title, retry) => {
    const html = render({
      status: false,
      errorCode,
      protocolStatus: { whois: errorCode },
    });
    expect(html).toContain(">" + title + "</h1>");
    expect(html.includes("Try Again")).toBe(retry);
    expect(html).toContain("New Search");
    expect(html).toContain(errorCode);
  },
);

it("exposes partial protocol outcomes without discarding the resource", () => {
  const html = render({
    result: { ...initialWhoisAnalyzeResult, domain: "example.net" },
    protocolStatus: { rdap: "ok", whois: "timeout" },
  });
  expect(html).toContain(">Registry responses<");
  expect(html).toContain(">Timed out<");
  expect(html).toContain(">example.net<");
});
