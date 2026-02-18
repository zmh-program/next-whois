<div align="center">

<img src="/public/icons/icon-512x512.png" alt="Next Whois" width="64" height="64">

# Next Whois

快速、現代的 WHOIS/RDAP 查詢工具，基於 Next.js 構建。

[English](/README.md) · [简体中文](/docs/README_CN.md) · [繁體中文](/docs/README_TW.md) · [Русский](/docs/README_RU.md) · [日本語](/docs/README_JP.md) · [Deutsch](/docs/README_DE.md) · [Français](/docs/README_FR.md) · [한국어](/docs/README_KR.md)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui)

</div>

![Banner](/public/banner.png)

## 特性

- **WHOIS & RDAP** - 支援域名、IPv4、IPv6、ASN、CIDR 查詢，優先使用 RDAP，自動回退到 WHOIS
- **動態 OG 圖片** - 基於 Satori 的 Open Graph 圖片生成，透過 `/api/og` 存取
- **響應式介面** - Shadcn UI + Tailwind CSS，適配手機、平板和桌面端，支援 PWA
- **深色 / 淺色主題** - 自動偵測系統主題，支援手動切換
- **歷史記錄與快捷鍵** - 本地歷史記錄，支援搜尋、篩選和鍵盤快捷鍵
- **EPP 狀態碼** - 可讀的狀態描述，附帶 ICANN 參考連結
- **註冊商與 NS 品牌識別** - 自動識別主要註冊商和域名伺服器提供商的圖示
- **域名指標** - 可選整合 Moz DA/PA/Spam Score
- **Redis 快取** - 伺服器端結果快取，支援 `Cache-Control` 回應標頭
- **開放 API** - `/api/lookup` 提供程式化存取，`/api/og` 生成動態圖片
- **國際化** - 支援英語、簡體中文、繁體中文、德語、俄語、日語、法語、韓語
- **API 文件** - 內建 `/docs` 頁面，提供互動式範例

[貢獻代碼](https://github.com/zmh-program/next-whois-ui/pulls)

## 部署

### 雲端平台（推薦）

[Vercel](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui) / [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui) / [Zeabur](https://zeabur.com/templates/UHCCCT)

### Docker

```bash
docker run -d -p 3000:3000 programzmh/next-whois-ui
```

### 原始碼部署

```bash
git clone https://github.com/zmh-program/next-whois-ui
cd next-whois-ui
pnpm install
pnpm dev
```

## 環境變數

| 變數 | 描述 | 預設值 |
|------|------|--------|
| `NEXT_PUBLIC_SITE_TITLE` | 站點標題 | Next Whois |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | 站點描述 | — |
| `NEXT_PUBLIC_SITE_KEYWORDS` | 站點關鍵詞 | — |
| `NEXT_PUBLIC_HISTORY_LIMIT` | 最大歷史記錄數（-1 = 無限制） | -1 |
| `NEXT_PUBLIC_MAX_WHOIS_FOLLOW` | 最大域名 WHOIS 跟隨深度 | 0 |
| `MOZ_ACCESS_ID` | Moz API Access ID | — |
| `MOZ_SECRET_KEY` | Moz API Secret Key | — |
| `REDIS_HOST` | Redis 主機（留空則停用快取） | — |
| `REDIS_PORT` | Redis 連接埠 | 6379 |
| `REDIS_PASSWORD` | Redis 密碼 | — |
| `REDIS_DB` | Redis 資料庫索引 | 0 |
| `REDIS_CACHE_TTL` | 快取 TTL（秒） | 3600 |

## API

查看內建的 [API 文件](https://gtb.zmh.me/docs) 頁面，或：

**`GET /api/lookup?query=google.com`** — WHOIS/RDAP 查詢

**`GET /api/og?domain=google.com`** — 動態 OG 圖片生成

## 技術棧

- Next.js (Pages Router, Edge Runtime for OG)
- Shadcn UI, Tailwind CSS, Framer Motion
- [whois-raw](https://www.npmjs.com/package/whois-raw) + RDAP client
- Satori (via `next/og`) for image generation

## 授權條款

MIT
