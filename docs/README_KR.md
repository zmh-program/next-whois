<div align="center">

<img src="/public/icons/icon-512x512.png" alt="Next Whois" width="64" height="64">

# Next Whois

Next.js로 구축된 빠르고 현대적인 WHOIS/RDAP 조회 도구.

[English](/README.md) · [简体中文](/docs/README_CN.md) · [繁體中文](/docs/README_TW.md) · [Русский](/docs/README_RU.md) · [日本語](/docs/README_JP.md) · [Deutsch](/docs/README_DE.md) · [Français](/docs/README_FR.md) · [한국어](/docs/README_KR.md)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui)

</div>

![Banner](/public/banner.png)

## 기능

- **WHOIS & RDAP** - 도메인, IPv4, IPv6, ASN, CIDR 조회 지원. RDAP 우선, WHOIS 자동 폴백
- **동적 OG 이미지** - Satori 기반 Open Graph 이미지 생성 (`/api/og` 경유)
- **반응형 UI** - Shadcn UI + Tailwind CSS, 모바일, 태블릿, 데스크톱 대응. PWA 지원.
- **다크 / 라이트 테마** - 시스템 감지 및 수동 전환
- **히스토리 & 단축키** - 로컬 히스토리 검색, 필터링, 키보드 단축키 지원
- **EPP 상태 코드** - ICANN 참조가 포함된 읽기 쉬운 상태 설명
- **레지스트라 & NS 브랜딩** - 주요 레지스트라 및 네임서버 제공자의 아이콘 자동 감지
- **도메인 메트릭스** - Moz DA/PA/Spam Score 통합 (선택 사항)
- **Redis 캐싱** - `Cache-Control` 헤더를 포함한 서버 측 결과 캐싱
- **오픈 API** - `/api/lookup`으로 프로그래밍 방식 접근, `/api/og`로 이미지 생성
- **국제화** - 영어, 중국어(간체/번체), 독일어, 러시아어, 일본어, 프랑스어, 한국어
- **API 문서** - 대화형 예제가 포함된 내장 `/docs` 페이지

[기여하기](https://github.com/zmh-program/next-whois-ui/pulls)

## 배포

### 플랫폼 (권장)

[Vercel](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui) / [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui) / [Zeabur](https://zeabur.com/templates/UHCCCT)

### Docker

```bash
docker run -d -p 3000:3000 programzmh/next-whois-ui
```

### 소스 코드

```bash
git clone https://github.com/zmh-program/next-whois-ui
cd next-whois-ui
pnpm install
pnpm dev
```

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `NEXT_PUBLIC_SITE_TITLE` | 사이트 제목 | Next Whois |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | 사이트 설명 | — |
| `NEXT_PUBLIC_SITE_KEYWORDS` | 사이트 키워드 | — |
| `NEXT_PUBLIC_HISTORY_LIMIT` | 최대 히스토리 항목 수 (-1 = 무제한) | -1 |
| `NEXT_PUBLIC_MAX_WHOIS_FOLLOW` | 최대 도메인 WHOIS 추적 깊이 | 0 |
| `MOZ_ACCESS_ID` | Moz API Access ID | — |
| `MOZ_SECRET_KEY` | Moz API Secret Key | — |
| `REDIS_HOST` | Redis 호스트 (비어있으면 캐시 비활성화) | — |
| `REDIS_PORT` | Redis 포트 | 6379 |
| `REDIS_PASSWORD` | Redis 비밀번호 | — |
| `REDIS_DB` | Redis 데이터베이스 인덱스 | 0 |
| `REDIS_CACHE_TTL` | 캐시 TTL (초) | 3600 |

## API

내장된 [API 문서](https://gtb.zmh.me/docs) 페이지를 참조하거나:

**`GET /api/lookup?query=google.com`** — WHOIS/RDAP 조회

**`GET /api/og?query=google.com`** — 동적 OG 이미지 생성

## 기술 스택

- Next.js 14 (Pages Router, Edge Runtime for OG)
- [Whoiser](https://www.npmjs.com/package/whoiser) + RDAP client
- Satori (via `next/og`) for image generation
