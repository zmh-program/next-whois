<div align="center">

<img src="/public/icons/icon-512x512.png" alt="Next Whois" width="64" height="64">

# Next Whois

快速、现代的 WHOIS/RDAP 查询工具，基于 Next.js 构建。

[English](/README.md) · [简体中文](/docs/README_CN.md) · [繁體中文](/docs/README_TW.md) · [Русский](/docs/README_RU.md) · [日本語](/docs/README_JP.md) · [Deutsch](/docs/README_DE.md) · [Français](/docs/README_FR.md) · [한국어](/docs/README_KR.md)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui)

</div>

![Banner](/public/banner.png)

## 特性

- **WHOIS & RDAP** - 支持域名、IPv4、IPv6、ASN、CIDR 查询，优先使用 RDAP，自动回退到 WHOIS
- **动态 OG 图片** - 基于 Satori 的 Open Graph 图片生成，通过 `/api/og` 访问
- **响应式界面** - Shadcn UI + Tailwind CSS，适配手机、平板和桌面端，支持 PWA
- **深色 / 浅色主题** - 自动检测系统主题，支持手动切换
- **历史记录与快捷键** - 本地历史记录，支持搜索、筛选和键盘快捷键
- **EPP 状态码** - 可读的状态描述，附带 ICANN 参考链接
- **注册商与 NS 品牌识别** - 自动识别主要注册商和域名服务器提供商的图标
- **域名指标** - 可选集成 Moz DA/PA/Spam Score
- **Redis 缓存** - 服务端结果缓存，支持 `Cache-Control` 响应头
- **开放 API** - `/api/lookup` 提供编程访问，`/api/og` 生成动态图片
- **国际化** - 支持英语、简体中文、繁体中文、德语、俄语、日语、法语、韩语
- **API 文档** - 内置 `/docs` 页面，提供交互式示例

[贡献代码](https://github.com/zmh-program/next-whois-ui/pulls)

## 部署

### 云平台（推荐）

[Vercel](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui) / [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui) / [Zeabur](https://zeabur.com/templates/UHCCCT)

### Docker

```bash
docker run -d -p 3000:3000 programzmh/next-whois-ui
```

### 源码部署

```bash
git clone https://github.com/zmh-program/next-whois-ui
cd next-whois-ui
pnpm install
pnpm dev
```

## 环境变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `NEXT_PUBLIC_SITE_TITLE` | 站点标题 | Next Whois |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | 站点描述 | — |
| `NEXT_PUBLIC_SITE_KEYWORDS` | 站点关键词 | — |
| `NEXT_PUBLIC_HISTORY_LIMIT` | 最大历史记录数（-1 = 无限制） | -1 |
| `NEXT_PUBLIC_MAX_WHOIS_FOLLOW` | 最大域名 WHOIS 跟随深度 | 0 |
| `MOZ_ACCESS_ID` | Moz API Access ID | — |
| `MOZ_SECRET_KEY` | Moz API Secret Key | — |
| `REDIS_HOST` | Redis 主机（留空则禁用缓存） | — |
| `REDIS_PORT` | Redis 端口 | 6379 |
| `REDIS_PASSWORD` | Redis 密码 | — |
| `REDIS_DB` | Redis 数据库索引 | 0 |
| `REDIS_CACHE_TTL` | 缓存 TTL（秒） | 3600 |

## API

查看内置的 [API 文档](https://gtb.zmh.me/docs) 页面，或：

**`GET /api/lookup?query=google.com`** — WHOIS/RDAP 查询

**`GET /api/og?query=google.com`** — 动态 OG 图片生成

## 技术栈

- Next.js 14 (Pages Router, Edge Runtime for OG)
- [Whoiser](https://www.npmjs.com/package/whoiser) + RDAP client
- Satori (via `next/og`) for image generation
