<div align="center">

<img src="/public/icons/icon-512x512.png" alt="Next Whois" width="64" height="64">

# Next Whois

A fast, modern WHOIS/RDAP lookup tool built with Next.js.

[English](/README.md) · [简体中文](/docs/README_CN.md) · [繁體中文](/docs/README_TW.md) · [Русский](/docs/README_RU.md) · [日本語](/docs/README_JP.md) · [Deutsch](/docs/README_DE.md) · [Français](/docs/README_FR.md) · [한국어](/docs/README_KR.md)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui)

</div>

![Banner](/public/banner.png)

## Features

- **WHOIS & RDAP** - Domain, IPv4, IPv6, ASN, CIDR lookup with RDAP-first, WHOIS fallback
- **Dynamic OG Images** - Satori-based Open Graph image generation via `/api/og`
- **Responsive UI** - Shadcn UI + Tailwind CSS, works across mobile, tablet, and desktop. PWA support.
- **Dark / Light Theme** - System detection with manual toggle
- **History & Shortcuts** - Local history with search, filter, and keyboard shortcuts
- **EPP Status Codes** - Human-readable status descriptions with ICANN references
- **Registrar & NS Branding** - Auto-detected icons for major registrars and nameserver providers
- **Domain Metrics** - Moz DA/PA/Spam Score integration (optional)
- **Redis Caching** - Server-side result caching with `Cache-Control` headers
- **Open API** - `/api/lookup` for programmatic access, `/api/og` for image generation
- **i18n** - English, Chinese (Simplified/Traditional), German, Russian, Japanese, French, Korean
- **API Documentation** - Built-in `/docs` page with interactive examples

[Contribute](https://github.com/zmh-program/next-whois-ui/pulls)

## Deploy

### Platforms (Recommended)

[Vercel](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui) / [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui) / [Zeabur](https://zeabur.com/templates/UHCCCT)

### Docker

```bash
docker run -d -p 3000:3000 programzmh/next-whois-ui
```

### Source Code

```bash
git clone https://github.com/zmh-program/next-whois-ui
cd next-whois-ui
pnpm install
pnpm dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_TITLE` | Site title | Next Whois |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Site description | — |
| `NEXT_PUBLIC_SITE_KEYWORDS` | Site keywords | — |
| `NEXT_PUBLIC_HISTORY_LIMIT` | Max history items (-1 = unlimited) | -1 |
| `NEXT_PUBLIC_MAX_WHOIS_FOLLOW` | Max domain WHOIS follow depth | 0 |
| `MOZ_ACCESS_ID` | Moz API Access ID | — |
| `MOZ_SECRET_KEY` | Moz API Secret Key | — |
| `REDIS_HOST` | Redis host (empty = cache disabled) | — |
| `REDIS_PORT` | Redis port | 6379 |
| `REDIS_PASSWORD` | Redis password | — |
| `REDIS_DB` | Redis database index | 0 |
| `REDIS_CACHE_TTL` | Cache TTL in seconds | 3600 |

## API

See the built-in [API Documentation](https://gtb.zmh.me/docs) page, or:

**`GET /api/lookup?query=google.com`** — WHOIS/RDAP lookup (parallel, merged results, includes raw responses)

**`GET /api/og?query=google.com`** — Dynamic OG image generation

## Tech Stack

- Next.js 14 (Pages Router, Edge Runtime for OG)
- [Whoiser](https://www.npmjs.com/package/whoiser) + RDAP client
- Satori (via `next/og`) for image generation
