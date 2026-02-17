import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { strEnv } from "@/lib/env";
import PWAInstaller from "@/components/pwa_installer";
import { Navbar } from "@/components/navbar";

const siteTitle = strEnv(
  "NEXT_PUBLIC_SITE_TITLE",
  "Next Whois - Easily Lookup Whois Information",
);
const siteDescription = strEnv(
  "NEXT_PUBLIC_SITE_DESCRIPTION",
  "🧪 Your Next Generation Of Whois Lookup Tool With Modern UI. Support Domain/IPv4/IPv6/ASN/CIDR Whois Lookup And Powerful Features.",
);
const siteKeywords = strEnv(
  "NEXT_PUBLIC_SITE_KEYWORDS",
  "Whois, Lookup, Tool, Next Whois",
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <meta name="tags" content={siteKeywords} />
        <meta name="keywords" content={siteKeywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content="/api/og" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content="/api/og" />
      </Head>
      <Toaster />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <PWAInstaller
          manifest-url="/manifest.json"
          name="Next Whois"
          description="🧪 Your Next Generation Of Whois Lookup Tool With Modern UI. Support Domain/IPv4/IPv6/ASN/CIDR Whois Lookup And Powerful Features."
        />
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-dot-pattern opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        </div>
        <div className="relative w-full min-h-screen font-sans">
          <Navbar />
          <main className="pt-16">
            <Component {...pageProps} />
          </main>
        </div>
      </ThemeProvider>
    </>
  );
}
