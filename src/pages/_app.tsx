import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { siteTitle, siteDescription, siteKeywords } from "@/lib/seo";
import PWAInstaller from "@/components/pwa_installer";
import { Navbar } from "@/components/navbar";

export default function App({ Component, pageProps }: AppProps) {
  const origin: string = pageProps.origin || "";

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <meta name="tags" content={siteKeywords} />
        <meta name="keywords" content={siteKeywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta key="og:title" property="og:title" content={siteTitle} />
        <meta key="og:description" property="og:description" content={siteDescription} />
        <meta key="og:image" property="og:image" content={`${origin}/banner.png`} />
        <meta key="og:url" property="og:url" content={origin} />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
        <meta key="twitter:title" name="twitter:title" content={siteTitle} />
        <meta key="twitter:description" name="twitter:description" content={siteDescription} />
        <meta key="twitter:image" name="twitter:image" content={`${origin}/banner.png`} />
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
