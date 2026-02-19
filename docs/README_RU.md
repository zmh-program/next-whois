<div align="center">

<img src="/public/icons/icon-512x512.png" alt="Next Whois" width="64" height="64">

# Next Whois

Быстрый и современный инструмент WHOIS/RDAP-запросов на базе Next.js.

[English](/README.md) · [简体中文](/docs/README_CN.md) · [繁體中文](/docs/README_TW.md) · [Русский](/docs/README_RU.md) · [日本語](/docs/README_JP.md) · [Deutsch](/docs/README_DE.md) · [Français](/docs/README_FR.md) · [한국어](/docs/README_KR.md)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui)

</div>

![Banner](/public/banner.png)

## Возможности

- **WHOIS & RDAP** - Запросы по доменам, IPv4, IPv6, ASN, CIDR с приоритетом RDAP и откатом на WHOIS
- **Динамические OG-изображения** - Генерация Open Graph изображений на основе Satori через `/api/og`
- **Адаптивный интерфейс** - Shadcn UI + Tailwind CSS, работает на мобильных, планшетах и десктопах. Поддержка PWA.
- **Тёмная / Светлая тема** - Автоопределение системной темы с ручным переключением
- **История и горячие клавиши** - Локальная история с поиском, фильтрацией и клавиатурными сокращениями
- **EPP-коды статусов** - Понятные описания статусов со ссылками на ICANN
- **Брендинг регистраторов и NS** - Автоматическое определение иконок основных регистраторов и DNS-провайдеров
- **Метрики доменов** - Интеграция Moz DA/PA/Spam Score (опционально)
- **Redis-кэширование** - Серверное кэширование результатов с заголовками `Cache-Control`
- **Открытый API** - `/api/lookup` для программного доступа, `/api/og` для генерации изображений
- **Интернационализация** - Английский, китайский (упрощённый/традиционный), немецкий, русский, японский, французский, корейский
- **Документация API** - Встроенная страница `/docs` с интерактивными примерами

[Внести вклад](https://github.com/zmh-program/next-whois-ui/pulls)

## Развёртывание

### Платформы (Рекомендуется)

[Vercel](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui) / [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui) / [Zeabur](https://zeabur.com/templates/UHCCCT)

### Docker

```bash
docker run -d -p 3000:3000 programzmh/next-whois-ui
```

### Исходный код

```bash
git clone https://github.com/zmh-program/next-whois-ui
cd next-whois-ui
pnpm install
pnpm dev
```

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `NEXT_PUBLIC_SITE_TITLE` | Заголовок сайта | Next Whois |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Описание сайта | — |
| `NEXT_PUBLIC_SITE_KEYWORDS` | Ключевые слова сайта | — |
| `NEXT_PUBLIC_HISTORY_LIMIT` | Макс. записей в истории (-1 = без лимита) | -1 |
| `NEXT_PUBLIC_MAX_WHOIS_FOLLOW` | Макс. глубина WHOIS-переходов для доменов | 0 |
| `MOZ_ACCESS_ID` | Moz API Access ID | — |
| `MOZ_SECRET_KEY` | Moz API Secret Key | — |
| `REDIS_HOST` | Хост Redis (пусто = кэш отключён) | — |
| `REDIS_PORT` | Порт Redis | 6379 |
| `REDIS_PASSWORD` | Пароль Redis | — |
| `REDIS_DB` | Индекс базы данных Redis | 0 |
| `REDIS_CACHE_TTL` | TTL кэша в секундах | 3600 |

## API

См. встроенную страницу [документации API](https://gtb.zmh.me/docs), или:

**`GET /api/lookup?query=google.com`** — WHOIS/RDAP-запрос

**`GET /api/og?query=google.com`** — Генерация динамического OG-изображения

## Технологический стек

- Next.js 14 (Pages Router, Edge Runtime for OG)
- [Whoiser](https://www.npmjs.com/package/whoiser) + RDAP client
- Satori (via `next/og`) for image generation
