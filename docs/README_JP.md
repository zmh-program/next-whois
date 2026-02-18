<div align="center">

<img src="/public/icons/icon-512x512.png" alt="Next Whois" width="64" height="64">

# Next Whois

Next.js で構築された、高速でモダンな WHOIS/RDAP ルックアップツール。

[English](/README.md) · [简体中文](/docs/README_CN.md) · [繁體中文](/docs/README_TW.md) · [Русский](/docs/README_RU.md) · [日本語](/docs/README_JP.md) · [Deutsch](/docs/README_DE.md) · [Français](/docs/README_FR.md) · [한국어](/docs/README_KR.md)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui)

</div>

![Banner](/public/banner.png)

## 特徴

- **WHOIS & RDAP** - ドメイン、IPv4、IPv6、ASN、CIDR のルックアップに対応。RDAP 優先、WHOIS へ自動フォールバック
- **動的 OG 画像** - Satori ベースの Open Graph 画像生成（`/api/og` 経由）
- **レスポンシブ UI** - Shadcn UI + Tailwind CSS、モバイル・タブレット・デスクトップに対応。PWA サポート
- **ダーク / ライトテーマ** - システム設定の自動検出と手動切り替え
- **履歴とショートカット** - ローカル履歴の検索・フィルタリング・キーボードショートカット対応
- **EPP ステータスコード** - ICANN リファレンス付きの分かりやすいステータス説明
- **レジストラ & NS ブランディング** - 主要レジストラとネームサーバープロバイダーのアイコン自動検出
- **ドメインメトリクス** - Moz DA/PA/Spam Score 統合（オプション）
- **Redis キャッシュ** - サーバーサイドの結果キャッシュと `Cache-Control` ヘッダー対応
- **オープン API** - `/api/lookup` でプログラマティックアクセス、`/api/og` で画像生成
- **国際化** - 英語、中国語（簡体字/繁体字）、ドイツ語、ロシア語、日本語、フランス語、韓国語
- **API ドキュメント** - インタラクティブな例を含む組み込みの `/docs` ページ

[コントリビュート](https://github.com/zmh-program/next-whois-ui/pulls)

## デプロイ

### プラットフォーム（推奨）

[Vercel](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui) / [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui) / [Zeabur](https://zeabur.com/templates/UHCCCT)

### Docker

```bash
docker run -d -p 3000:3000 programzmh/next-whois-ui
```

### ソースコード

```bash
git clone https://github.com/zmh-program/next-whois-ui
cd next-whois-ui
pnpm install
pnpm dev
```

## 環境変数

| 変数 | 説明 | デフォルト値 |
|------|------|-------------|
| `NEXT_PUBLIC_SITE_TITLE` | サイトタイトル | Next Whois |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | サイト説明 | — |
| `NEXT_PUBLIC_SITE_KEYWORDS` | サイトキーワード | — |
| `NEXT_PUBLIC_HISTORY_LIMIT` | 最大履歴件数（-1 = 無制限） | -1 |
| `NEXT_PUBLIC_MAX_WHOIS_FOLLOW` | 最大ドメイン WHOIS フォロー深度 | 0 |
| `MOZ_ACCESS_ID` | Moz API Access ID | — |
| `MOZ_SECRET_KEY` | Moz API Secret Key | — |
| `REDIS_HOST` | Redis ホスト（空 = キャッシュ無効） | — |
| `REDIS_PORT` | Redis ポート | 6379 |
| `REDIS_PASSWORD` | Redis パスワード | — |
| `REDIS_DB` | Redis データベースインデックス | 0 |
| `REDIS_CACHE_TTL` | キャッシュ TTL（秒） | 3600 |

## API

組み込みの [API ドキュメント](https://gtb.zmh.me/docs) ページをご覧ください。または：

**`GET /api/lookup?query=google.com`** — WHOIS/RDAP ルックアップ

**`GET /api/og?domain=google.com`** — 動的 OG 画像生成

## 技術スタック

- Next.js (Pages Router, Edge Runtime for OG)
- Shadcn UI, Tailwind CSS, Framer Motion
- [whois-raw](https://www.npmjs.com/package/whois-raw) + RDAP client
- Satori (via `next/og`) for image generation

## ライセンス

MIT
