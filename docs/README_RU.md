<div align="center">

# 🧪 Next Whois

😎 Легкий и красивый инструмент для Whois-запросов

[English](/README.md) · [简体中文](/docs/README_CN.md) · [繁體中文](/docs/README_TW.md) · [Русский](/docs/README_RU.md) · [日本語](/docs/README_JP.md) · [Deutsch](/docs/README_DE.md) · [Français](/docs/README_FR.md) · [한국어](/docs/README_KR.md)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui)

</div>

## 😎 Особенности

Не нужно много говорить, просто попробуйте! 🥳

1. ✨ **Красивый интерфейс**: Современный дизайн с [Shadcn UI](https://ui.shadcn.com), который делает вас комфортным.
2. 📱 **Адаптивный дизайн**: Работает хорошо на мобильных устройствах✅ / планшетах✅ / настольных компьютерах✅, поддержка PWA приложений.
3. 🌈 **Много тем**: Поддержка нескольких тем (*Светлая и Темная*), обнаружение системной темы, переключение тем по вашему желанию.
4. 🚀 **Гибкий поиск**: Основан на Next.js, поддержка серверлесс развертывания и быстрой работы.
5. 📚 **История записей**: История записей хранится в локальном хранилище, легко просматривать и искать историю.
6. 📡 **Открытый API**: Простой API для поиска whois, легко интегрируется с другими сервисами.
7. 🌍 **Поддержка IPv4 и IPv6 Whois**: Поддержка поиска whois для IPv4, IPv6, доменов, ASN, CIDR.
8. 📦 **Сохранение результатов**: Сохранение результатов whois, легко делиться и сохранять.
9. 📡 **Кэширование результатов**: Кэширование Whois на основе Redis для более быстрых запросов.
10. 🌍 **Интернационализация**: Поддержка нескольких языков
11. 🚀 **Поддержка RDAP**: Поддержка современного протокола RDAP с автоматическим переходом на WHOIS

👉 [Внести свой вклад](https://github.com/zmh-program/next-whois-ui/pulls)

## Развертывание

#### `1` 🚀 Платформы (Рекомендуется)

[Vercel](https://vercel.com/import/project?template=https://github.com/zmh-program/next-whois-ui) / [Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/zmh-program/next-whois-ui) / [Zeabur](https://zeabur.com/templates/UHCCCT)

#### `2` 🐳 Docker

```bash
docker run -d -p 3000:3000 programzmh/next-whois-ui
```

#### `3` 🔨 Исходный код

```bash
git clone https://github.com/zmh-program/next-whois-ui
cd next-whois-ui

npm install -g pnpm
pnpm install
pnpm dev
```

## 📏 Переменные окружения

### SEO

- `NEXT_PUBLIC_SITE_TITLE`: Заголовок сайта
- `NEXT_PUBLIC_SITE_DESCRIPTION`: Описание сайта
- `NEXT_PUBLIC_SITE_KEYWORDS`: Ключевые слова сайта

### WHOIS

- `NEXT_PUBLIC_HISTORY_LIMIT`: Лимит истории (По умолчанию: -1)
- `NEXT_PUBLIC_MAX_WHOIS_FOLLOW`: Максимальное количество следователей whois для доменов (По умолчанию: 0)
- `NEXT_PUBLIC_MAX_IP_WHOIS_FOLLOW`: Максимальное количество следователей whois для IP (По умолчанию: 5)

### MOZ API
- `MOZ_ACCESS_ID`: Идентификатор доступа Moz API (Необходим для метрик домена)
- `MOZ_SECRET_KEY`: Секретный ключ Moz API (Необходим для метрик домена)

### Кэширование

- `REDIS_HOST`: Хост Redis (КЭШИРОВАНИЕ ОТКЛЮЧЕНО, ЕСЛИ ПУСТО)
- `REDIS_PORT`: Порт Redis (По умолчанию: 6379)
- `REDIS_PASSWORD`: Пароль Redis (ОПЦИОНАЛЬНО)
- `REDIS_DB`: База данных Redis (По умолчанию: 0)
- `REDIS_CACHE_TTL`: Время жизни кэша Redis в секундах (По умолчанию: 3600)

## 📝 Справочник API

`GET` `/api/lookup?query=google.com`

<details>
<summary><strong>Ответ</strong> OK (200)</summary>

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
<summary><strong>Ошибка ответа</strong> Internal Server Error (500)</summary>

```json
{
  "time": 0.609,
  "status": false,
  "error": "No match for domain google.notfound (e.g. domain is not registered)"
}
```

</details>

<details>
<summary><strong>Ошибка ответа</strong> Bad Request (400)</summary>

```json
{
  "time": -1,
  "status": false,
  "error": "Query is required"
}
```

</details>

## 🧠 Технологический стек

- Next.js
- Shadcn UI & Tailwind CSS
- Whois Core Lib (@[whois-raw](https://www.npmjs.com/package/whois-raw))
- Поддержка RDAP (@[node-rdap](https://www.npmjs.com/package/node-rdap))

## 💪 Поддержка TLDs

👉 [Исходный код библиотеки парсера TLDs Whois](../src/lib/whois/lib.ts)

❤ Подсказка: Парсер Whois для некоторых TLDs может быть несовместим в настоящее время, спасибо за ваш вклад [Pull Request](https://github.com/zmh-program/next-whois-ui/pulls), чтобы этот проект поддерживал больше TLDs!
