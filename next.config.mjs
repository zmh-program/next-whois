/** @type {import('next').NextConfig} */

import setupPWA from 'next-pwa';
import { i18n } from './next-i18next.config.mjs';

const nextConfig = {
  reactStrictMode: true,
  i18n,
};

const withPWA = setupPWA({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    buildExcludes: [/manifest\.json$/, /_next\/data/, /_next\/static/],
    runtimeCaching: [
      // cache *.css, *.js, *.woff2 files
      {
        urlPattern: /^https?.*\.(css|js|woff2)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'assets-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        }
      },
    ],
});

export default withPWA(nextConfig);
