import { createI18n } from 'vue-i18n'

import { appConfig } from '@/config'

import enAuth from './locales/en/auth.json'
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'

export const i18n = createI18n({
  legacy: false,
  locale: appConfig.defaultLocale,
  fallbackLocale: 'en',
  messages: {
    en: {
      common: enCommon,
      auth: enAuth,
      home: enHome,
    },
  },
})
