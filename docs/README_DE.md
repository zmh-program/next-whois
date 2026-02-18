<div align="center">

<img src="/public/icons/icon-512x512.png" alt="Next Whois" width="64" height="64">

# Next Whois

Ein schnelles, modernes WHOIS/RDAP-Lookup-Tool, gebaut mit Next.js.

[English](/README.md) · [简体中文](/docs/README_CN.md) · [繁體中文](/docs/README_TW.md) · [Русский](/docs/README_RU.md) · [日本語](/docs/README_JP.md) · [Deutsch](/docs/README_DE.md) · [Français](/docs/README_FR.md) · [한국어](/docs/README_KR.md)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui)

</div>

![Banner](/public/banner.png)

## Funktionen

- **WHOIS & RDAP** - Domain-, IPv4-, IPv6-, ASN-, CIDR-Abfragen mit RDAP-Prioritaet und WHOIS-Fallback
- **Dynamische OG-Bilder** - Satori-basierte Open Graph Bildgenerierung ueber `/api/og`
- **Responsive UI** - Shadcn UI + Tailwind CSS, funktioniert auf Mobilgeraeten, Tablets und Desktops. PWA-Unterstuetzung.
- **Dark / Light Theme** - Systemerkennung mit manueller Umschaltung
- **Verlauf & Tastenkuerzel** - Lokaler Verlauf mit Suche, Filter und Tastaturkuerzeln
- **EPP-Statuscodes** - Verstaendliche Statusbeschreibungen mit ICANN-Referenzen
- **Registrar- & NS-Branding** - Automatisch erkannte Icons fuer grosse Registrare und Nameserver-Anbieter
- **Domain-Metriken** - Moz DA/PA/Spam Score Integration (optional)
- **Redis-Caching** - Serverseitiges Ergebnis-Caching mit `Cache-Control`-Headern
- **Offene API** - `/api/lookup` fuer programmatischen Zugriff, `/api/og` fuer Bildgenerierung
- **Internationalisierung** - Englisch, Chinesisch (vereinfacht/traditionell), Deutsch, Russisch, Japanisch, Franzoesisch, Koreanisch
- **API-Dokumentation** - Integrierte `/docs`-Seite mit interaktiven Beispielen

[Beitragen](https://github.com/zmh-program/next-whois-ui/pulls)

## Bereitstellung

### Plattformen (Empfohlen)

[Vercel](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui) / [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui) / [Zeabur](https://zeabur.com/templates/UHCCCT)

### Docker

```bash
docker run -d -p 3000:3000 programzmh/next-whois-ui
```

### Quellcode

```bash
git clone https://github.com/zmh-program/next-whois-ui
cd next-whois-ui
pnpm install
pnpm dev
```

## Umgebungsvariablen

| Variable | Beschreibung | Standardwert |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SITE_TITLE` | Seitentitel | Next Whois |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Seitenbeschreibung | — |
| `NEXT_PUBLIC_SITE_KEYWORDS` | Seiten-Schluesselwoerter | — |
| `NEXT_PUBLIC_HISTORY_LIMIT` | Max. Verlaufseintraege (-1 = unbegrenzt) | -1 |
| `NEXT_PUBLIC_MAX_WHOIS_FOLLOW` | Max. Domain-WHOIS-Verfolgungstiefe | 0 |
| `MOZ_ACCESS_ID` | Moz API Access ID | — |
| `MOZ_SECRET_KEY` | Moz API Secret Key | — |
| `REDIS_HOST` | Redis-Host (leer = Cache deaktiviert) | — |
| `REDIS_PORT` | Redis-Port | 6379 |
| `REDIS_PASSWORD` | Redis-Passwort | — |
| `REDIS_DB` | Redis-Datenbankindex | 0 |
| `REDIS_CACHE_TTL` | Cache-TTL in Sekunden | 3600 |

## API

Siehe die integrierte [API-Dokumentation](https://gtb.zmh.me/docs)-Seite, oder:

**`GET /api/lookup?query=google.com`** — WHOIS/RDAP-Abfrage

**`GET /api/og?domain=google.com`** — Dynamische OG-Bildgenerierung

## Tech-Stack

- Next.js (Pages Router, Edge Runtime for OG)
- Shadcn UI, Tailwind CSS, Framer Motion
- [whois-raw](https://www.npmjs.com/package/whois-raw) + RDAP client
- Satori (via `next/og`) for image generation

## Lizenz

MIT
