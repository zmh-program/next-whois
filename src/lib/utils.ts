import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";
import { toast } from "sonner";
import { getDomain } from "tldjs";
import { getSpecialDomain } from "@/lib/whois/lib";
import { useTranslation } from "@/lib/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isEnter(e: React.KeyboardEvent) {
  // compatible with MacOS
  return e.key === "Enter" && e.keyCode !== 229;
}

export function saveAsFile(filename: string, content: string) {
  /**
   * Save text as file
   * @param filename Filename
   * @param content File content
   * @example
   * saveAsFile("hello.txt", "Hello world!");
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Blob
   */

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content]));
  a.download = filename;
  a.click();
}

async function copyClipboard(text: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return await navigator.clipboard.writeText(text);
  }

  const el = document.createElement("textarea");
  el.value = text;
  // android may require editable
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.focus();
  el.select();
  el.setSelectionRange(0, text.length);
  document.execCommand("copy");
  document.body.removeChild(el);
}

export function useClipboard() {
  /**
   * Use clipboard
   * @example
   * const copy = useClipboard();
   * copy("Hello world!");
   */
  const { t } = useTranslation();

  return async (text: string) => {
    try {
      await copyClipboard(text);
      toast.success(t("toast.copied"));
    } catch (e) {
      console.error(e);

      const err = e as Error;
      toast.error(t("toast.copy_failed", { message: err.message }));
    }
  };
}

export function useSaver() {
  const { t } = useTranslation();

  return (filename: string, content: string) => {
    try {
      saveAsFile(filename, content);
      toast.success(t("toast.saved"));
    } catch (e) {
      console.error(e);

      toast.error(t("toast.save_failed", { message: toErrorMessage(e) }));
    }
  };
}

export function toSearchURI(query: string) {
  const q = query.trim();
  let locale = "en";

  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    const match = path.match(/^\/([a-z]{2}(?:-[a-z]{2})?)(\/|$)/);
    if (match) {
      locale = match[1];
    } else {
      locale =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("NEXT_LOCALE="))
          ?.split("=")[1] ||
        navigator.language.split("-")[0] ||
        "en";
      if (!["en", "zh", "zh-tw", "de", "ru", "ja", "fr", "ko"].includes(locale))
        locale = "en";
    }
  }

  if (!["en", "zh", "zh-tw", "de", "ru", "ja", "fr", "ko"].includes(locale)) {
    locale = "en";
  }

  return q ? `/${locale}/${encodeURIComponent(q)}` : `/${locale}`;
}

export function includeArgs(from: string, ...args: string[]): boolean {
  return args.some((arg) => from.toLowerCase().includes(arg.toLowerCase()));
}

export function toErrorMessage(e: any): string {
  return e.message || "Unknown error";
}

export function extractDomain(url: string): string | null {
  try {
    return getDomain(getSpecialDomain(url));
  } catch {
    return null;
  }
}

export function cleanDomain(domain: string): string {
  const hostname = extractDomain(domain);
  if (hostname) {
    return hostname;
  }

  // if contains ip, extract it and return
  const ipMatch = domain.match(
    /^(https?:\/\/)?((\d{1,3}\.){3}\d{1,3})(:\d+)?(\/.*)?$/,
  );
  if (ipMatch) {
    return ipMatch[2];
  }

  return domain;
}

export function getWindowHref(): string {
  // if in server side, return empty string
  if (typeof window === "undefined") return "";

  return window.location.href;
}
