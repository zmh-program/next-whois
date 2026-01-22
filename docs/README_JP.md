<div align="center">

# 🧪 Next Whois

😎 軽量で美しい Whois クエリツール

[English](/README.md) · [简体中文](/docs/README_CN.md) · [繁體中文](/docs/README_TW.md) · [Русский](/docs/README_RU.md) · [日本語](/docs/README_JP.md) · [Deutsch](/docs/README_DE.md) · [Français](/docs/README_FR.md) · [한국어](/docs/README_KR.md)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui)

</div>

## 😎 特徴

多くを語る必要はありません、試してみてください！ 🥳

1. ✨ **美しいUI**: [Shadcn UI](https://ui.shadcn.com)を使用したモダンなデザインで、快適に使用できます。
2. 📱 **レスポンシブ**: モバイル✅ / タブレット✅ / デスクトップ✅でうまく動作し、PWAアプリのサポートもあります。
3. 🌈 **マルチテーマ**: 複数のテーマをサポート（*ライト＆ダーク*）、システムテーマの検出、好きなテーマに切り替え可能。
4. 🚀 **柔軟なクエリ**: Next.jsを使用しており、サーバーレスデプロイメントと高速クエリをサポート。
5. 📚 **履歴記録**: 履歴はローカルストレージに保存され、履歴の表示とクエリが簡単です。
6. 📡 **オープンAPI**: シンプルなWhoisクエリAPIで、他のサービスとの統合が容易です。
7. 🌍 **IPv4＆IPv6 Whois**: IPv4、IPv6、ドメイン、ASN、CIDRのWhoisクエリをサポート。
8. 📦 **結果キャプチャ**: Whois結果をキャプチャし、共有や保存が簡単です。
9. 📡 **結果キャッシュ**：Redisベースのキャッシュで高速なクエリを実現。
10. 🌍 **国際化**：多言語対応
11. 🚀 **RDAP サポート**：最新のRDAPプロトコルをサポートし、自動的にWHOISにフォールバック

👉 [コントリビュート](https://github.com/zmh-program/next-whois-ui/pulls)

## デプロイ

#### `1` 🚀 プラットフォーム（推奨）

[Vercel](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui) / [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui) / [Zeabur](https://zeabur.com/templates/UHCCCT)

#### `2` 🐳 Docker

```bash
docker run -d -p 3000:3000 programzmh/next-whois-ui
```

#### `3` 🔨 ソースコード

```bash
git clone https://github.com/zmh-program/next-whois-ui
cd next-whois-ui

npm install -g pnpm
pnpm install
pnpm dev
```

## 📏 環境変数

### SEO

- `NEXT_PUBLIC_SITE_TITLE`: サイトタイトル
- `NEXT_PUBLIC_SITE_DESCRIPTION`: サイト説明
- `NEXT_PUBLIC_SITE_KEYWORDS`: サイトキーワード

### WHOIS

- `NEXT_PUBLIC_HISTORY_LIMIT`: 履歴制限（デフォルト値：-1）
- `NEXT_PUBLIC_MAX_WHOIS_FOLLOW`: 最大ドメインWhoisフォロー数（デフォルト値：0）
- `NEXT_PUBLIC_MAX_IP_WHOIS_FOLLOW`: 最大IP Whoisフォロー数（デフォルト値：5）

### MOZ API

- `MOZ_ACCESS_ID`: Moz APIアクセスID（ドメインメトリクスに必要）
- `MOZ_SECRET_KEY`: Moz APIシークレットキー（ドメインメトリクスに必要）

### キャッシュ

- `REDIS_HOST`: Redisホスト（空の場合はキャッシュ無効）
- `REDIS_PORT`: Redisポート（デフォルト値：6379）
- `REDIS_PASSWORD`: Redisパスワード（オプション）
- `REDIS_DB`: Redisデータベース（デフォルト値：0）
- `REDIS_CACHE_TTL`: RedisキャッシュTTL秒数（デフォルト値：3600）

## 📝 APIリファレンス

`GET` `/api/lookup?query=google.com`

<details>
<summary><strong>レスポンス</strong> OK (200)</summary>

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
<summary><strong>エラーレスポンス</strong> Internal Server Error (500)</summary>

```json
{
  "time": 0.609,
  "status": false,
  "error": "No match for domain google.notfound (e.g. domain is not registered)"
}
```

</details>

<details>
<summary><strong>エラーレスポンス</strong> Bad Request (400)</summary>

```json
{
  "time": -1,
  "status": false,
  "error": "Query is required"
}
```

</details>

## 🧠 技術スタック

- Next.js
- Shadcn UI & Tailwind CSS
- Whois Core Lib (@[whois-raw](https://www.npmjs.com/package/whois-raw))
- RDAP サポート (@[node-rdap](https://www.npmjs.com/package/node-rdap))

## 💪 TLDsサポート

👉 [TLDs Whoisパーサーライブラリのソースコード](../src/lib/whois/lib.ts)

❤ ヒント: 一部のTLDsのWhoisパーサーは現在互換性がない場合があります。より多くのTLDsをサポートするために、あなたの[プルリクエスト](https://github.com/zmh-program/next-whois-ui/pulls)をお待ちしています！
