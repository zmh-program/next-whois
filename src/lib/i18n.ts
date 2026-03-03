/**
 * Internationalization (i18n) utilities
 * Supports: en, zh, zh-tw, de, ru, ja, fr, ko
 */
import { useRouter } from "next/router";
import en from "../../locales/en.json";
import zh from "../../locales/zh.json";
import zhTW from "../../locales/zh-tw.json";
import de from "../../locales/de.json";
import ru from "../../locales/ru.json";
import ja from "../../locales/ja.json";
import fr from "../../locales/fr.json";
import ko from "../../locales/ko.json";

const translations = { en, zh, "zh-tw": zhTW, de, ru, ja, fr, ko };

export type Locale = keyof typeof translations;

type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;

type DotNestedKeys<T> = (
  T extends object
    ? {
        [K in Exclude<
          keyof T,
          symbol
        >]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}`;
      }[Exclude<keyof T, symbol>]
    : ""
) extends infer D
  ? Extract<D, string>
  : never;

export type TranslationKey = DotNestedKeys<typeof en>;

type NestedValue<T, K extends string> = K extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? NestedValue<T[First], Rest>
    : never
  : K extends keyof T
    ? T[K]
    : never;

type InterpolationValues = Record<string, string | number>;

export function useTranslation() {
  const router = useRouter();
  const locale = (router.locale || "en") as Locale;

  function t(key: TranslationKey, values?: InterpolationValues): string {
    const getValue = (
      obj:
        | typeof en
        | typeof zh
        | typeof zhTW
        | typeof de
        | typeof ru
        | typeof ja
        | typeof fr
        | typeof ko,
      path: string[],
    ): string => {
      return path.reduce((acc, key) => {
        if (acc && typeof acc === "object" && key in acc) {
          const value = (acc as any)[key];
          return value;
        }
        return "";
      }, obj as any) as string;
    };

    const path = key.split(".");
    let localeValue =
      getValue(translations[locale], path) || getValue(translations.en, path);

    if (values) {
      Object.entries(values).forEach(([key, value]) => {
        localeValue = localeValue.replace(`{{${key}}}`, String(value));
      });
    }

    return localeValue;
  }

  return { t, locale };
}
