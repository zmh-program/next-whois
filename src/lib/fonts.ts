import localFont from "next/font/local";

export const geistSans = localFont({
  src: "../assets/fonts/GeistSans-Variable.woff2",
  variable: "--font-geist-sans",
  display: "swap",
  weight: "100 900",
});

export const geistMono = localFont({
  src: "../assets/fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  display: "swap",
  weight: "100 900",
});
