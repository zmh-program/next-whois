<div align="center">

<img src="/public/icons/icon-512x512.png" alt="Next Whois" width="64" height="64">

# Next Whois

Un outil de recherche WHOIS/RDAP rapide et moderne, construit avec Next.js.

[English](/README.md) · [简体中文](/docs/README_CN.md) · [繁體中文](/docs/README_TW.md) · [Русский](/docs/README_RU.md) · [日本語](/docs/README_JP.md) · [Deutsch](/docs/README_DE.md) · [Français](/docs/README_FR.md) · [한국어](/docs/README_KR.md)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui)

</div>

![Banner](/public/banner.png)

## Fonctionnalites

- **WHOIS & RDAP** - Recherche de domaines, IPv4, IPv6, ASN, CIDR avec priorite RDAP et repli sur WHOIS
- **Images OG dynamiques** - Generation d'images Open Graph basee sur Satori via `/api/og`
- **Interface responsive** - Shadcn UI + Tailwind CSS, compatible mobile, tablette et bureau. Support PWA.
- **Theme sombre / clair** - Detection automatique du systeme avec bascule manuelle
- **Historique & raccourcis** - Historique local avec recherche, filtrage et raccourcis clavier
- **Codes de statut EPP** - Descriptions lisibles des statuts avec references ICANN
- **Branding registraires & NS** - Detection automatique des icones des principaux registraires et fournisseurs de serveurs de noms
- **Metriques de domaine** - Integration Moz DA/PA/Spam Score (optionnel)
- **Cache Redis** - Mise en cache des resultats cote serveur avec en-tetes `Cache-Control`
- **API ouverte** - `/api/lookup` pour l'acces programmatique, `/api/og` pour la generation d'images
- **Internationalisation** - Anglais, chinois (simplifie/traditionnel), allemand, russe, japonais, francais, coreen
- **Documentation API** - Page `/docs` integree avec exemples interactifs

[Contribuer](https://github.com/zmh-program/next-whois-ui/pulls)

## Deploiement

### Plateformes (Recommande)

[Vercel](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui) / [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui) / [Zeabur](https://zeabur.com/templates/UHCCCT)

### Docker

```bash
docker run -d -p 3000:3000 programzmh/next-whois-ui
```

### Code source

```bash
git clone https://github.com/zmh-program/next-whois-ui
cd next-whois-ui
pnpm install
pnpm dev
```

## Variables d'environnement

| Variable | Description | Valeur par defaut |
|----------|-------------|-------------------|
| `NEXT_PUBLIC_SITE_TITLE` | Titre du site | Next Whois |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Description du site | — |
| `NEXT_PUBLIC_SITE_KEYWORDS` | Mots-cles du site | — |
| `NEXT_PUBLIC_HISTORY_LIMIT` | Nb max d'entrees d'historique (-1 = illimite) | -1 |
| `NEXT_PUBLIC_MAX_WHOIS_FOLLOW` | Profondeur max de suivi WHOIS des domaines | 0 |
| `MOZ_ACCESS_ID` | Moz API Access ID | — |
| `MOZ_SECRET_KEY` | Moz API Secret Key | — |
| `REDIS_HOST` | Hote Redis (vide = cache desactive) | — |
| `REDIS_PORT` | Port Redis | 6379 |
| `REDIS_PASSWORD` | Mot de passe Redis | — |
| `REDIS_DB` | Index de la base de donnees Redis | 0 |
| `REDIS_CACHE_TTL` | TTL du cache en secondes | 3600 |

## API

Consultez la page de [documentation API](https://gtb.zmh.me/docs) integree, ou :

**`GET /api/lookup?query=google.com`** — Recherche WHOIS/RDAP

**`GET /api/og?domain=google.com`** — Generation d'image OG dynamique

## Stack technique

- Next.js (Pages Router, Edge Runtime for OG)
- Shadcn UI, Tailwind CSS, Framer Motion
- [whois-raw](https://www.npmjs.com/package/whois-raw) + RDAP client
- Satori (via `next/og`) for image generation

## Licence

MIT
