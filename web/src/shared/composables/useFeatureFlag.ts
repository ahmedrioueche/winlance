import { isFeatureEnabled, type FeatureFlag } from '@/config/flags'

export function useFeatureFlag(flag: FeatureFlag) {
  return isFeatureEnabled(flag)
}
