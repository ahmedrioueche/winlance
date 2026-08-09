import { computed, ref, type Ref } from 'vue'
import { usePortalInfoQuery, useVerifyPasscodeMutation } from '../../queries'

export function usePortalDashboardData(token: Ref<string>) {
  const { data: portalInfo, isPending, isError, refetch } = usePortalInfoQuery(token)
  const verifyPasscodeMutation = useVerifyPasscodeMutation()

  const passcode = ref('')
  const isPasscodeModalOpen = computed(() => {
    return Boolean(portalInfo.value?.is_password_protected)
  })

  async function handleVerifyPasscode() {
    if (!token.value || !passcode.value.trim()) return

    try {
      await verifyPasscodeMutation.mutateAsync({
        token: token.value,
        passcode: passcode.value.trim(),
      })
      passcode.value = ''
      void refetch()
    } catch (error) {
      // Error handles in toast
    }
  }

  return {
    portalInfo,
    isPending,
    isError,
    refetch,
    passcode,
    isPasscodeModalOpen,
    isVerifying: verifyPasscodeMutation.isPending,
    handleVerifyPasscode,
  }
}
