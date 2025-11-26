<div align="center">

# 🧪 Next Whois

😎 Modernes Whois-Abfrage-Tool

[English](/README.md) · [简体中文](/docs/README_CN.md) · [繁體中文](/docs/README_TW.md) · [Русский](/docs/README_RU.md) · [日本語](/docs/README_JP.md) · [Deutsch](/docs/README_DE.md) · [Français](/docs/README_FR.md) · [한국어](/docs/README_KR.md)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui)

</div>

## 😎 Funktionen

Keine Notwendigkeit, mehr zu sagen, probieren Sie es einfach aus! 🥳

1. ✨ **Schönes UI**: Modernes Design mit [Shadcn UI](https://ui.shadcn.com), das Ihnen ein angenehmes Gefühl vermittelt.
2. 📱 **Responsive**: Funktioniert gut auf Mobilgeräten✅ / Tablets✅ / Desktops✅, PWA-App-Unterstützung.
3. 🌈 **Multi-Theme**: Unterstützung für mehrere Themen (*Hell & Dunkel*), Erkennung des Systemthemas, Wechseln des Themas nach Belieben.
4. 🚀 **Flexible Abfrage**: Angetrieben von Next.js, Unterstützung für serverlose Bereitstellung und schnelle Abfragen.
5. 📚 **Verlauf speichern**: Verlaufsaufzeichnungen werden im lokalen Speicher gespeichert, einfach zu durchsuchen und anzuzeigen.
6. 📡 **Offene API**: Einfache API für Whois-Abfragen, leicht in andere Dienste zu integrieren.
7. 🌍 **IPv4 & IPv6 Whois**: Unterstützung für Whois-Abfragen für IPv4, IPv6, Domain, ASN, CIDR.
8. 📦 **Ergebnis erfassen**: Erfassen von Whois-Ergebnissen, einfach zu teilen und zu speichern.
9. 📡 **Ergebnis-Caching**: Redis-basiertes Whois-Caching für schnellere Abfragen.
10. 🌍 **Internationalisierung**: Unterstützung mehrerer Sprachen
11. 🚀 **RDAP-Unterstützung**: Unterstützung des modernen RDAP-Protokolls mit automatischem Fallback auf WHOIS

👉 [Beitragen](https://github.com/zmh-program/next-whois-ui/pulls)

## Bereitstellung

#### `1` 🚀 Plattformen (Empfohlen)

[Vercel](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui) / [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui) / [Zeabur](https://zeabur.com/templates/UHCCCT)

#### `2` 🐳 Docker

```bash
docker run -d -p 3000:3000 programzmh/next-whois-ui
```

#### `3` 🔨 Quellcode

```bash
git clone https://github.com/zmh-program/next-whois-ui
cd next-whois-ui

npm install -g pnpm
pnpm install
pnpm dev
```

## 📏 Umgebungsvariablen

### SEO

- `NEXT_PUBLIC_SITE_TITLE`: Seitentitel
- `NEXT_PUBLIC_SITE_DESCRIPTION`: Seitenbeschreibung
- `NEXT_PUBLIC_SITE_KEYWORDS`: Seiten-Schlüsselwörter

### WHOIS

- `NEXT_PUBLIC_HISTORY_LIMIT`: Verlaufslimit (Standard: -1)
- `NEXT_PUBLIC_MAX_WHOIS_FOLLOW`: Maximale Domain-Whois-Verfolgung (Standard: 0)
- `NEXT_PUBLIC_MAX_IP_WHOIS_FOLLOW`: Maximale IP-Whois-Verfolgung (Standard: 5)

### MOZ API
- `MOZ_ACCESS_ID`: Moz API Zugangs-ID (Erforderlich für Domain-Metriken)
- `MOZ_SECRET_KEY`: Moz API Geheimschlüssel (Erforderlich für Domain-Metriken)

### CACHE

- `REDIS_HOST`: Redis-Host (CACHE DEAKTIVIERT, WENN LEER)
- `REDIS_PORT`: Redis-Port (Standard: 6379)
- `REDIS_PASSWORD`: Redis-Passwort (OPTIONAL)
- `REDIS_DB`: Redis-DB (Standard: 0)
- `REDIS_CACHE_TTL`: Redis-Cache-TTL in Sekunden (Standard: 3600)

## 📝 API-Referenz

`GET` `/api/lookup?query=google.com`

<details>
<summary><strong>Antwort</strong> OK (200)</summary>

```json
{
  "time": 1.547,
  "status": true,
  "cached": false,
  "source": "rdap",
  "result": {
    "domain": "GOOGLE.COM",
    "registrar": "MarkMonitor Inc.",
    "registrarURL": "http://www.markmonitor.com",
    "ianaId": "292",
    "whoisServer": "whois.markmonitor.com",
    "updatedDate": "2019-09-09T15:39:04.000Z",
    "creationDate": "1997-09-15T04:00:00.000Z",
    "expirationDate": "2028-09-14T04:00:00.000Z",
    "status": [
      {
        "status": "clientDeleteProhibited",
        "url": "https://icann.org/epp#clientDeleteProhibited"
      },
      {
        "status": "clientTransferProhibited",
        "url": "https://icann.org/epp#clientTransferProhibited"
      },
      {
        "status": "clientUpdateProhibited",
        "url": "https://icann.org/epp#clientUpdateProhibited"
      },
      {
        "status": "serverDeleteProhibited",
        "url": "https://icann.org/epp#serverDeleteProhibited"
      },
      {
        "status": "serverTransferProhibited",
        "url": "https://icann.org/epp#serverTransferProhibited"
      },
      {
        "status": "serverUpdateProhibited",
        "url": "https://icann.org/epp#serverUpdateProhibited"
      }
    ],
    "nameServers": [
      "NS1.GOOGLE.COM",
      "NS2.GOOGLE.COM",
      "NS3.GOOGLE.COM",
      "NS4.GOOGLE.COM"
    ],
    "registrantOrganization": "Unknown",
    "registrantProvince": "Unknown",
    "registrantCountry": "Unknown",
    "registrantPhone": "+1 2086851750",
    "registrantEmail": "Unknown",
    "rawWhoisContent": "...",
    "rawRdapContent": "..."
  }
}
```

</details>

<details>
<summary><strong>Fehlerantwort</strong> Internal Server Error (500)</summary>

```json
{
  "time": 0.609,
  "status": false,
  "error": "No match for domain google.notfound (e.g. domain is not registered)"
}
```

</details>

<details>
<summary><strong>Fehlerantwort</strong> Bad Request (400)</summary>

```json
{
  "time": -1,
  "status": false,
  "error": "Query is required"
}
```

</details>

## 🧠 Tech-Stack

- Next.js
- Shadcn UI & Tailwind CSS
- Whois Core Lib (@[whois-raw](https://www.npmjs.com/package/whois-raw))
- RDAP-Unterstützung (@[node-rdap](https://www.npmjs.com/package/node-rdap))

## 💪 TLDs-Unterstützung

👉 [TLDs Whois Parser Lib Quellcode](../src/lib/whois/lib.ts)

❤ TIPP: Der Whois-Parser für einige TLDs ist möglicherweise derzeit nicht kompatibel. Vielen Dank für Ihren Beitrag [Pull Request](https://github.com/zmh-program/next-whois-ui/pulls), um dieses Projekt zu unterstützen, mehr TLDs zu unterstützen!
