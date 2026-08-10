import { computed, ref, type Ref } from 'vue'
import { computeSideBySideDiff } from '@/shared/utils/diff'
import type { Proposal, ProposalVersion } from '../../types'

export function useProposalComparison(
  proposal: Ref<Proposal | undefined>,
  versions: Ref<ProposalVersion[]>,
  currentTitle: Ref<string>,
  currentBody: Ref<string>,
  currentAmount: Ref<number | string>,
  currentCurrency: Ref<string>,
) {
  const comparingVersion = ref<ProposalVersion | null>(null)
  const compareTargetId = ref<string>('current')

  const isComparing = computed(() => comparingVersion.value !== null)

  function formatAuthor(ver: ProposalVersion): string {
    const name = ver.created_by_name || ver.created_by_role
    if (ver.created_by_role === 'client' && ver.created_by_name) {
      return `${ver.created_by_name} (Client)`
    }
    return name
  }

  const compareTargetOptions = computed(() => {
    const opts = [{ value: 'current', label: 'Current Working Draft' }]
    versions.value.forEach((v) => {
      if (v.id !== comparingVersion.value?.id) {
        opts.push({
          value: v.id,
          label: `v${v.version_number} — ${v.change_summary || 'Version'} (${formatAuthor(v)})`,
        })
      }
    })
    return opts
  })

  const compareRightContent = computed(() => {
    if (compareTargetId.value === 'current') {
      return proposal.value?.body || currentBody.value
    }
    const match = versions.value.find((v) => v.id === compareTargetId.value)
    return match?.body ?? ''
  })

  const compareRightLabel = computed(() => {
    if (compareTargetId.value === 'current') {
      return 'Current Working Draft'
    }
    const match = versions.value.find((v) => v.id === compareTargetId.value)
    return match ? `v${match.version_number} (${match.change_summary})` : 'Selected Version'
  })

  const compareRightTitle = computed(() => {
    if (compareTargetId.value === 'current') {
      return currentTitle.value || proposal.value?.title || ''
    }
    const match = versions.value.find((v) => v.id === compareTargetId.value)
    return match?.title ?? ''
  })

  const compareRightAmount = computed(() => {
    if (compareTargetId.value === 'current') {
      return Number(currentAmount.value || proposal.value?.amount || 0)
    }
    const match = versions.value.find((v) => v.id === compareTargetId.value)
    return match ? Number(match.amount || 0) : 0
  })

  const compareRightCurrency = computed(() => {
    if (compareTargetId.value === 'current') {
      return currentCurrency.value || proposal.value?.currency || 'USD'
    }
    const match = versions.value.find((v) => v.id === compareTargetId.value)
    return match?.currency ?? 'USD'
  })

  const leftAmount = computed(() => Number(comparingVersion.value?.amount || 0))
  const leftCurrency = computed(() => comparingVersion.value?.currency || 'USD')
  const leftTitle = computed(() => comparingVersion.value?.title || '')

  function normalizeText(str: string | null | undefined): string {
    return (str || '').replace(/\r\n/g, '\n').trim()
  }

  const amountDiff = computed(() => compareRightAmount.value - leftAmount.value)
  const hasAmountDiff = computed(() => leftAmount.value !== compareRightAmount.value)
  const hasTitleDiff = computed(() => normalizeText(leftTitle.value) !== normalizeText(compareRightTitle.value))

  const diffLines = computed(() => {
    if (!comparingVersion.value) return { left: [], right: [] }
    return computeSideBySideDiff(comparingVersion.value.body, compareRightContent.value)
  })

  function handleCompare(ver: ProposalVersion) {
    comparingVersion.value = ver
    compareTargetId.value = 'current'
  }

  function handleCloseComparison() {
    comparingVersion.value = null
  }

  return {
    comparingVersion,
    compareTargetId,
    isComparing,
    compareTargetOptions,
    compareRightLabel,
    compareRightTitle,
    compareRightAmount,
    compareRightCurrency,
    leftAmount,
    leftCurrency,
    leftTitle,
    amountDiff,
    hasAmountDiff,
    hasTitleDiff,
    diffLines,
    handleCompare,
    handleCloseComparison,
    formatAuthor,
  }
}
