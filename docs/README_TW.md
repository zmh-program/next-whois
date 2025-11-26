<div align="center">

# 🧪 Next Whois

😎 輕量級且美觀的 Whois 查詢工具

[English](/README.md) · [簡體中文](/docs/README_CN.md) · [繁體中文](/docs/README_TW.md) · [Русский](/docs/README_RU.md) · [日本語](/docs/README_JP.md) · [Deutsch](/docs/README_DE.md) · [Français](/docs/README_FR.md) · [한국어](/docs/README_KR.md)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui)

</div>

## 😎 特性

無需多言，直接試試吧！🥳

1. ✨ **美觀介面**：採用現代簡約設計的 [Shadcn UI](https://ui.shadcn.com) 風格。
2. 📱 **響應式設計**：適配手機端✅ / Pad✅ / 桌面端✅，並支持 PWA 應用。
3. 🌈 **多主題支持**：支持亮/暗色切換，自動檢測系統主題。
4. 🚀 **靈活查詢**：基於 Next.js，支持無服務器部署，更快查詢速度。
5. 📚 **歷史記錄**：歷史記錄存儲在本地存儲中，方便查看和查詢歷史。
6. 📡 **開放接口**：提供簡單的 whois 查詢 API，易於與其他服務集成。
7. 🌍 **強大支持**：支持 IPv4、IPv6、域名、ASN、CIDR 的 Whois 查詢。
8. 📦 **結果分享**：支持獲取 Whois 查詢結果，方便分享和保存。
9. 📡 **結果快取**：支援基於 Redis 的 Whois 快取，提升查詢速度。
10. 🌍 **國際化**：支援多語言
11. 🚀 **RDAP 支援**：支援現代 RDAP 協議，自動回退到 WHOIS

👉 [貢獻代碼](https://github.com/zmh-program/next-whois-ui/pulls)

## 部署

#### `1` 🚀 雲平台部署（推薦）

[Vercel](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui) / [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui) / [Zeabur](https://zeabur.com/templates/UHCCCT)

#### `2` 🐳 Docker 部署

```bash
docker run -d -p 3000:3000 programzmh/next-whois-ui
```

#### `3` 🔨 源碼部署

```bash
git clone https://github.com/zmh-program/next-whois-ui
cd next-whois-ui

npm install -g pnpm
pnpm install
pnpm dev
```

## 📏 環境變量

### SEO

- `NEXT_PUBLIC_SITE_TITLE`: 站點標題
- `NEXT_PUBLIC_SITE_DESCRIPTION`: 站點描述
- `NEXT_PUBLIC_SITE_KEYWORDS`: 站點關鍵詞

### WHOIS

- `NEXT_PUBLIC_HISTORY_LIMIT`: 歷史記錄限制（預設值：-1）
- `NEXT_PUBLIC_MAX_WHOIS_FOLLOW`: 最大域名 Whois 跟隨數（預設值：0）
- `NEXT_PUBLIC_MAX_IP_WHOIS_FOLLOW`: 最大 IP Whois 跟隨數（預設值：5）

### MOZ API

- `MOZ_ACCESS_ID`: Moz API 存取 ID（取得域名指標所需）
- `MOZ_SECRET_KEY`: Moz API 密鑰（取得域名指標所需）

### 快取

- `REDIS_HOST`: Redis 主機（如果為空則停用快取）
- `REDIS_PORT`: Redis 連接埠（預設值：6379）
- `REDIS_PASSWORD`: Redis 密碼（可選）
- `REDIS_DB`: Redis 資料庫（預設值：0）
- `REDIS_CACHE_TTL`: Redis 快取 TTL 秒數（預設值：3600）

## 📝 API 文檔

`GET` `/api/lookup?query=google.com`

<details>
<summary><strong>響應</strong> OK (200)</summary>

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
<summary><strong>錯誤響應</strong> Internal Server Error (500)</summary>

```json
{
  "time": 0.609,
  "status": false,
  "error": "No match for domain google.notfound (e.g. domain is not registered)"
}
```

</details>

<details>
<summary><strong>錯誤響應</strong> Bad Request (400)</summary>

```json
{
  "time": -1,
  "status": false,
  "error": "Query is required"
}
```

</details>

## 🧠 技術棧

- Next.js
- Shadcn UI & Tailwind CSS
- Whois Core Lib (@[whois-raw](https://www.npmjs.com/package/whois-raw))
- RDAP 支援 (@[node-rdap](https://www.npmjs.com/package/node-rdap))

## 💪 TLDs 支持

👉 [TLDs Whois 解析器庫源碼](./src/lib/whois/lib.ts)

❤ 提示: 部分 TLDs 的 Whois 解析器可能暫不兼容，感謝您提交 [貢獻](https://github.com/zmh-program/next-whois-ui/pulls) 以便支持更多 TLDs！
