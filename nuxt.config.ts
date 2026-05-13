import { version } from './package.json';

const SITE_URL = 'https://robinsimonklein.github.io/svgoat/';
const SITE_TITLE = 'SVGOAT • The ultimate SVG optimizer & batch processor';
const SITE_DESCRIPTION = 'Clean, optimize, and export your SVGs in seconds. 100% local and blazing fast.';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    figmaClientId: import.meta.env.NUXT_FIGMA_CLIENT_ID || '',
    figmaClientSecret: import.meta.env.NUXT_FIGMA_CLIENT_SECRET || '',
    figmaRedirectUri: import.meta.env.NUXT_FIGMA_REDIRECT_URI,

    public: {
      appVersion: version,
    },
  },

  ssr: false,

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: SITE_TITLE,
      meta: [
        { name: 'description', content: SITE_DESCRIPTION },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: SITE_URL },
        { property: 'og:title', content: SITE_TITLE },
        { property: 'og:description', content: SITE_DESCRIPTION },
        // Twitter Card
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: SITE_TITLE },
        { name: 'twitter:description', content: SITE_DESCRIPTION },
      ],
      link: [
        { rel: 'canonical', href: SITE_URL },
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐐</text></svg>`,
        },
      ],
    },
  },

  modules: ['@nuxt/eslint', '@nuxt/ui', '@vueuse/nuxt', '@pinia/nuxt'],

  css: ['~/assets/css/main.css'],
});
