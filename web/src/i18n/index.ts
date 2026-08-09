import { createI18n } from 'vue-i18n'

import { appConfig } from '@/config'

import enAuth from './locales/en/auth.json'
import enAiCoach from './locales/en/aiCoach.json'
import enAnalytics from './locales/en/analytics.json'
import enCommon from './locales/en/common.json'
import enContracts from './locales/en/contracts.json'
import enHome from './locales/en/home.json'
import enLeads from './locales/en/leads.json'
import enOutreach from './locales/en/outreach.json'
import enPortal from './locales/en/portal.json'
import enProjects from './locales/en/projects.json'
import enProposals from './locales/en/proposals.json'
import frAuth from './locales/fr/auth.json'
import frCommon from './locales/fr/common.json'
import frPortal from './locales/fr/portal.json'

export const i18n = createI18n({
  legacy: false,
  locale: appConfig.defaultLocale,
  fallbackLocale: 'en',
  messages: {
    en: {
      common: enCommon,
      auth: enAuth,
      home: enHome,
      leads: enLeads,
      proposals: enProposals,
      contracts: enContracts,
      projects: enProjects,
      portal: enPortal,
      outreach: enOutreach,
      aiCoach: enAiCoach,
      analytics: enAnalytics,
      clients: enCommon.clients,
      settings: enCommon.settings,
    },
    fr: {
      common: frCommon,
      auth: frAuth,
      portal: frPortal,
    },
  },
})
