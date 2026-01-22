<div align="center">

# 🧪 Next Whois
😎 가볍고 아름다운 Whois 조회 도구

[English](/README.md) · [简体中文](/docs/README_CN.md) · [繁體中文](/docs/README_TW.md) · [Русский](/docs/README_RU.md) · [日本語](/docs/README_JP.md) · [Deutsch](/docs/README_DE.md) · [Français](/docs/README_FR.md) · [한국어](/docs/README_KR.md)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui)

</div>

## 😎 특징
더 이상의 설명이 필요 없습니다. 직접 사용해보세요! 🥳

1. ✨ **아름다운 UI**: [Shadcn UI](https://ui.shadcn.com)를 사용한 현대적인 디자인으로 편안한 사용성 제공
2. 📱 **반응형**: 모바일✅ / 태블릿✅ / 데스크톱✅에서 잘 작동하며, PWA 앱 지원
3. 🌈 **다중 테마**: 다중 테마 지원 (*라이트 & 다크*), 시스템 테마 감지, 원하는 대로 테마 전환
4. 🚀 **유연한 쿼리**: Next.js 기반으로 서버리스 배포와 빠른 쿼리 지원
5. 📚 **기록 저장**: 로컬 스토리지에 기록이 저장되어 쉽게 조회 가능
6. 📡 **오픈 API**: 간단한 whois 쿼리 API, 다른 서비스와 쉽게 통합
7. 🌍 **IPv4 & IPv6 Whois**: IPv4, IPv6, 도메인, ASN, CIDR whois 쿼리 지원
8. 📦 **결과 캡처**: whois 결과를 캡처하여 쉽게 공유하고 저장
9. 📡 **결과 캐싱**: Redis 기반 Whois 캐싱으로 더 빠른 쿼리
10. 🌍 **국제화**: 다국어 지원
11. 🚀 **RDAP 지원**: 현대적인 RDAP 프로토콜 지원과 WHOIS로의 자동 대체

👉 [기여하기](https://github.com/zmh-program/next-whois-ui/pulls)

## 배포
#### `1` 🚀 플랫폼 (권장)
[Vercel](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui) / [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui) / [Zeabur](https://zeabur.com/templates/UHCCCT)
#### `2` 🐳 Docker
```bash
docker run -d -p 3000:3000 programzmh/next-whois-ui
```

#### `3` 🔨 소스 코드
```bash
git clone https://github.com/zmh-program/next-whois-ui
cd next-whois-ui

npm install -g pnpm
pnpm install
pnpm dev
```

## 📏 환경 변수

### SEO
- `NEXT_PUBLIC_SITE_TITLE`: 사이트 제목
- `NEXT_PUBLIC_SITE_DESCRIPTION`: 사이트 설명
- `NEXT_PUBLIC_SITE_KEYWORDS`: 사이트 키워드

### WHOIS
- `NEXT_PUBLIC_HISTORY_LIMIT`: 기록 제한 (기본값: -1)
- `NEXT_PUBLIC_MAX_WHOIS_FOLLOW`: 최대 도메인 Whois 추적 (기본값: 0)
- `NEXT_PUBLIC_MAX_IP_WHOIS_FOLLOW`: 최대 IP Whois 추적 (기본값: 5)

### MOZ API
- `MOZ_ACCESS_ID`: Moz API 액세스 ID (도메인 메트릭스에 필요)
- `MOZ_SECRET_KEY`: Moz API 시크릿 키 (도메인 메트릭스에 필요)

### CACHE
- `REDIS_HOST`: Redis 호스트 (비어있을 경우 캐시 비활성화)
- `REDIS_PORT`: Redis 포트 (기본값: 6379)
- `REDIS_PASSWORD`: Redis 비밀번호 (선택사항)
- `REDIS_DB`: Redis DB (기본값: 0)
- `REDIS_CACHE_TTL`: Redis 캐시 TTL 초 (기본값: 3600)

## 🧠 기술 스택
- Next.js
- Shadcn UI & Tailwind CSS
- Whois Core Lib (@[whois-raw](https://www.npmjs.com/package/whois-raw))
- RDAP 지원 (@[node-rdap](https://www.npmjs.com/package/node-rdap))

## 💪 TLD 지원
👉 [TLD Whois 파서 라이브러리 소스 코드](../src/lib/whois/lib.ts)

❤ 팁: 일부 TLD의 Whois 파서가 현재 호환되지 않을 수 있습니다. [Pull Request](https://github.com/zmh-program/next-whois-ui/pulls)를 통해 더 많은 TLD를 지원할 수 있도록 기여해 주셔서 감사합니다! 