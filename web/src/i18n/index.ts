import { createI18n } from 'vue-i18n'

import { appConfig } from '@/config'

import enAiCoach from './locales/en/aiCoach.json'
import enAnalytics from './locales/en/analytics.json'
import enAuth from './locales/en/auth.json'
import enCommon from './locales/en/common.json'
import enContracts from './locales/en/contracts.json'
import enHome from './locales/en/home.json'
import enLeads from './locales/en/leads.json'
import enOutreach from './locales/en/outreach.json'
import enPortal from './locales/en/portal.json'
import enProjects from './locales/en/projects.json'
import enProposals from './locales/en/proposals.json'

import frAiCoach from './locales/fr/aiCoach.json'
import frAnalytics from './locales/fr/analytics.json'
import frAuth from './locales/fr/auth.json'
import frCommon from './locales/fr/common.json'
import frContracts from './locales/fr/contracts.json'
import frHome from './locales/fr/home.json'
import frLeads from './locales/fr/leads.json'
import frOutreach from './locales/fr/outreach.json'
import frPortal from './locales/fr/portal.json'
import frProjects from './locales/fr/projects.json'
import frProposals from './locales/fr/proposals.json'

const STORAGE_KEY = 'winlance_locale'

function getInitialLocale(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'fr') {
      return saved
    }
  } catch {
    // Ignore localStorage access errors
  }
  return appConfig.defaultLocale || 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  datetimeFormats: {
    en: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
    fr: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
  },
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
      home: frHome,
      leads: frLeads,
      proposals: frProposals,
      contracts: frContracts,
      projects: frProjects,
      portal: frPortal,
      outreach: frOutreach,
      aiCoach: frAiCoach,
      analytics: frAnalytics,
      clients: frCommon.clients,
      settings: frCommon.settings,
    },
  },
})

export function setAppLocale(newLocale: 'en' | 'fr') {
  i18n.global.locale.value = newLocale
  try {
    localStorage.setItem(STORAGE_KEY, newLocale)
  } catch {
    // Ignore localStorage write errors
  }
}
