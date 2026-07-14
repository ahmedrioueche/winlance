const rawFlags = {
  enableDemoAuth: import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true',
} as const

export type FeatureFlag = keyof typeof rawFlags

export const featureFlags = rawFlags

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag]
}
