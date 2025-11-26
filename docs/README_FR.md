<div align="center">

# 🧪 Next Whois
😎 Outil de requête Whois léger et élégant

[English](/README.md) · [简体中文](/docs/README_CN.md) · [繁體中文](/docs/README_TW.md) · [Русский](/docs/README_RU.md) · [日本語](/docs/README_JP.md) · [Deutsch](/docs/README_DE.md) · [Français](/docs/README_FR.md) · [한국어](/docs/README_KR.md)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui)

</div>

## 😎 Caractéristiques
Pas besoin d'en dire plus, essayez-le ! 🥳

1. ✨ **Interface élégante**: Design moderne avec [Shadcn UI](https://ui.shadcn.com), pour votre confort.
2. 📱 **Responsive**: Fonctionne bien sur Mobile✅ / Tablette✅ / Bureau✅, Support PWA.
3. 🌈 **Multi-thèmes**: Support multi-thèmes (*Clair & Sombre*), détection du thème système.
4. 🚀 **Requêtes flexibles**: Propulsé par Next.js, supporte le déploiement serverless et les requêtes rapides.
5. 📚 **Historique**: Les enregistrements sont stockés localement, faciles à consulter.
6. 📡 **API ouverte**: API simple pour les requêtes whois, facile à intégrer.
7. 🌍 **Whois IPv4 & IPv6**: Support des requêtes whois IPv4, IPv6, Domaine, ASN, CIDR.
8. 📦 **Capture des résultats**: Capturez les résultats whois, faciles à partager.
9. 📡 **Mise en cache**: Mise en cache Whois basée sur Redis pour des requêtes plus rapides.
10. 🌍 **Internationalisation**: Support multi-langues
11. 🚀 **Support RDAP**: Support du protocole RDAP moderne avec repli automatique vers WHOIS

👉 [Contribuer](https://github.com/zmh-program/next-whois-ui/pulls)

## Déploiement
#### `1` 🚀 Plateformes (Recommandé)
[Vercel](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui) / [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui) / [Zeabur](https://zeabur.com/templates/UHCCCT)
#### `2` 🐳 Docker
```bash
docker run -d -p 3000:3000 programzmh/next-whois-ui
```

#### `3` 🔨 Code Source
```bash
git clone https://github.com/zmh-program/next-whois-ui
cd next-whois-ui

npm install -g pnpm
pnpm install
pnpm dev
```

## 📏 Variables d'environnement

### SEO
- `NEXT_PUBLIC_SITE_TITLE`: Titre du site
- `NEXT_PUBLIC_SITE_DESCRIPTION`: Description du site
- `NEXT_PUBLIC_SITE_KEYWORDS`: Mots-clés du site

### WHOIS
- `NEXT_PUBLIC_HISTORY_LIMIT`: Limite d'historique (Par défaut: -1)
- `NEXT_PUBLIC_MAX_WHOIS_FOLLOW`: Suivi max des domaines Whois (Par défaut: 0)
- `NEXT_PUBLIC_MAX_IP_WHOIS_FOLLOW`: Suivi max des IP Whois (Par défaut: 5)

### MOZ API
- `MOZ_ACCESS_ID`: ID d'accès Moz API (Requis pour les métriques de domaine)
- `MOZ_SECRET_KEY`: Clé secrète Moz API (Requise pour les métriques de domaine)

### CACHE
- `REDIS_HOST`: Hôte Redis (CACHE DÉSACTIVÉ SI VIDE)
- `REDIS_PORT`: Port Redis (Par défaut: 6379)
- `REDIS_PASSWORD`: Mot de passe Redis (OPTIONNEL)
- `REDIS_DB`: Base de données Redis (Par défaut: 0)
- `REDIS_CACHE_TTL`: TTL du cache Redis en secondes (Par défaut: 3600)

## 🧠 Stack Technique
- Next.js
- Shadcn UI & Tailwind CSS
- Whois Core Lib (@[whois-raw](https://www.npmjs.com/package/whois-raw))
- Support RDAP (@[node-rdap](https://www.npmjs.com/package/node-rdap))

## 💪 Support TLD
👉 [Code source de la bibliothèque d'analyse Whois TLD](../src/lib/whois/lib.ts)

❤ CONSEIL: L'analyseur Whois pour certains TLD peut ne pas être actuellement compatible, merci de contribuer via une [Pull Request](https://github.com/zmh-program/next-whois-ui/pulls) pour faire en sorte que ce projet supporte plus de TLD ! 