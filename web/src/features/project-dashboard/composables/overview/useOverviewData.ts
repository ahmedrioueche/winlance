import { computed, type Ref } from 'vue'
import { useToast } from '@/shared/toast/useToast'
import { useProjectQuery } from '../../queries'

export function useOverviewData(projectId: Ref<string>) {
  const toast = useToast()
  const { data: project, isPending, isError, refetch } = useProjectQuery(projectId)

  const milestones = computed(() => project.value?.milestones ?? [])
  const requirements = computed(() => project.value?.requirements ?? [])

  const completedMilestones = computed(() => milestones.value.filter((m) => m.status === 'DONE').length)
  const overallProgressPercent = computed(() => {
    if (milestones.value.length === 0) return 0
    const total = milestones.value.reduce((acc, m) => acc + (m.progress_percent || 0), 0)
    return Math.round(total / milestones.value.length)
  })

  function formatCurrency(val?: number | string | null, curr = 'USD') {
    const n = Number(val || 0)
    return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${curr}`
  }

  function handleCopyPortalLink() {
    const token = project.value?.portal_token
    const shareUrl = token
      ? `${window.location.origin}/portal/${token}/projects/${projectId.value}`
      : `${window.location.origin}/portal`
    void navigator.clipboard.writeText(shareUrl)
    toast.success('Client portal link copied to clipboard!')
  }

  return {
    project,
    isPending,
    isError,
    refetch,
    milestones,
    requirements,
    completedMilestones,
    overallProgressPercent,
    formatCurrency,
    handleCopyPortalLink,
  }
}
