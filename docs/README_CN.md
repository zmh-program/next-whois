<div align="center">

# 🧪 Next Whois

😎 轻量级且美观的 Whois 查询工具

[English](/README.md) · [简体中文](/docs/README_CN.md) · [繁體中文](/docs/README_TW.md) · [Русский](/docs/README_RU.md) · [日本語](/docs/README_JP.md) · [Deutsch](/docs/README_DE.md) · [Français](/docs/README_FR.md) · [한국어](/docs/README_KR.md)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui)

</div>

## 😎 特性

无需多言，直接试试吧！🥳

1. ✨ **美观界面**：采用现代简约设计的 [Shadcn UI](https://ui.shadcn.com) 风格。
2. 📱 **响应式设计**：适配手机端✅ / Pad 端✅ / 桌面端✅，并支持 PWA 应用。
3. 🌈 **多主题支持**：支持亮/暗色切换，自动检测系统主题。
4. 🚀 **灵活查询**：基于 Next.js，支持无服务器部署，更快查询速度。
5. 📚 **历史记录**：历史记录存储在本地，方便查看和查询历史。
6. 📡 **开放接口**：提供简单的 whois 查询 API，易于与其他服务集成。
7. 🌍 **强大支持**：支持 IPv4、IPv6、域名、ASN、CIDR 的 Whois 查询。
8. 📦 **结果分享**：支持获取 Whois 查询结果，方便分享和保存。
9. 📡 **结果缓存**：支持基于 Redis 的 Whois 缓存，提升查询速度。
10. 🌍 **国际化**：支持多语言
11. 🚀 **RDAP 支持**：支持现代 RDAP 协议，自动回退到 WHOIS

👉 [贡献代码](https://github.com/zmh-program/next-whois-ui/pulls)

## 部署

#### `1` 🚀 云平台部署（推荐）

[Vercel](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui) / [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui) / [Zeabur](https://zeabur.com/templates/UHCCCT)

#### `2` 🐳 Docker 部署

```bash
docker run -d -p 3000:3000 programzmh/next-whois-ui
```

#### `3` 🔨 源码部署

```bash
git clone https://github.com/zmh-program/next-whois-ui
cd next-whois-ui

npm install -g pnpm
pnpm install
pnpm dev
```

## 📏 环境变量

### SEO

- `NEXT_PUBLIC_SITE_TITLE`: 站点标题
- `NEXT_PUBLIC_SITE_DESCRIPTION`: 站点描述
- `NEXT_PUBLIC_SITE_KEYWORDS`: 站点关键词

### WHOIS

- `NEXT_PUBLIC_HISTORY_LIMIT`: 历史记录限制（默认值：-1）
- `NEXT_PUBLIC_MAX_WHOIS_FOLLOW`: 最大域名 Whois 跟随数（默认值：0）
- `NEXT_PUBLIC_MAX_IP_WHOIS_FOLLOW`: 最大 IP Whois 跟随数（默认值：5）

### MOZ API

- `MOZ_ACCESS_ID`: Moz API 访问 ID（获取域名指标所需）
- `MOZ_SECRET_KEY`: Moz API 密钥（获取域名指标所需）

### 缓存

- `REDIS_HOST`: Redis 主机（如果为空则禁用缓存）
- `REDIS_PORT`: Redis 端口（默认值：6379）
- `REDIS_PASSWORD`: Redis 密码（可选）
- `REDIS_DB`: Redis 数据库（默认值：0）
- `REDIS_CACHE_TTL`: Redis 缓存 TTL 秒数（默认值：3600）

## 📝 API 文档

`GET` `/api/lookup?query=google.com`

<details>
<summary><strong>响应</strong> OK (200)</summary>

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
<summary><strong>错误响应</strong> Internal Server Error (500)</summary>

```json
{
  "time": 0.609,
  "status": false,
  "error": "No match for domain google.notfound (e.g. domain is not registered)"
}
```

</details>

<details>
<summary><strong>错误响应</strong> Bad Request (400)</summary>

```json
{
  "time": -1,
  "status": false,
  "error": "Query is required"
}
```

</details>

## 🧠 技术栈

- Next.js
- Shadcn UI & Tailwind CSS
- Whois Core Lib (@[whois-raw](https://www.npmjs.com/package/whois-raw))
- RDAP 支持 (@[node-rdap](https://www.npmjs.com/package/node-rdap))

## 💪 TLDs 支持

👉 [TLDs Whois 解析器库源码](../src/lib/whois/lib.ts)

❤ 提示: 部分 TLDs 的 Whois 解析器可能暂不兼容，感谢您提交 [贡献](https://github.com/zmh-program/next-whois-ui/pulls) 以便支持更多 TLDs！
