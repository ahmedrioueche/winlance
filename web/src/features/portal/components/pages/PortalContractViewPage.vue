<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  PenTool,
  ShieldCheck,
} from 'lucide-vue-next'

import {
  BaseButton,
  BaseInput,
  BaseModal,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'
import ContractDocumentCanvas from '@/features/contracts/components/ContractDocumentCanvas.vue'
import { useContractExport } from '@/features/contracts/composables/useContractExport'
import { usePortalContractQuery, useSignPortalContractMutation } from '../../queries'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const token = computed(() => String(route.params.token || ''))
const contractId = computed(() => String(route.params.contractId || ''))

const contractQuery = usePortalContractQuery(token, contractId)
const signMutation = useSignPortalContractMutation()
const { exportPdf, isExporting } = useContractExport()

const contract = computed(() => contractQuery.data.value)
const isSigned = computed(() => contract.value?.status === 'SIGNED' || !!contract.value?.signed_at)

const signModalOpen = ref(false)
const signerName = ref('')
const signerEmail = ref('')
const agreeTerms = ref(false)

function openSignModal() {
  signerName.value = ''
  signerEmail.value = ''
  agreeTerms.value = false
  signModalOpen.value = true
}

async function handleSignContract() {
  if (!agreeTerms.value) {
    toast.errorFromUnknown('Please confirm that you agree to electronically sign this contract.')
    return
  }

  try {
    await signMutation.mutateAsync({
      token: token.value,
      contractId: contractId.value,
      payload: {
        signer_name: signerName.value.trim() || undefined,
        signer_email: signerEmail.value.trim() || undefined,
      },
    })
    toast.success('Contract signed and executed successfully!')
    signModalOpen.value = false
    await contractQuery.refetch()
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function handleExportPdf() {
  if (!contract.value) return
  try {
    await exportPdf({
      title: contract.value.title,
      body: contract.value.body,
      amount: contract.value.amount,
      currency: contract.value.currency,
      status: contract.value.status,
      signedAt: contract.value.signed_at,
      signedName: contract.value.signed_name,
      signedEmail: contract.value.signed_email,
      signedIp: contract.value.signed_ip,
      createdAt: contract.value.created_at,
    })
    toast.success('Contract PDF downloaded')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-20">
    <!-- Navigation Back Link -->
    <div class="flex items-center justify-between">
      <BaseButton
        variant="ghost"
        size="sm"
        @click="router.push({ name: 'portal-proposals', params: { token } })"
      >
        <ArrowLeft class="h-4 w-4 mr-1.5" />
        Back to Portal
      </BaseButton>

      <div class="flex items-center gap-2">
        <BaseButton
          v-if="contract"
          variant="secondary"
          size="sm"
          :loading="isExporting"
          @click="handleExportPdf"
        >
          <Download class="h-4 w-4 mr-1.5" />
          Export PDF
        </BaseButton>

        <BaseButton
          v-if="contract && !isSigned"
          variant="primary"
          size="sm"
          class="bg-emerald-600 hover:bg-emerald-700 text-white"
          @click="openSignModal"
        >
          <PenTool class="h-4 w-4 mr-1.5" />
          Accept &amp; Sign Contract
        </BaseButton>
      </div>
    </div>

    <!-- Data States -->
    <LoadingState v-if="contractQuery.isPending.value" class="py-12" />
    <ErrorState
      v-else-if="contractQuery.isError.value"
      class="py-12"
      title="Failed to load contract agreement"
      retry-label="Retry"
      @retry="contractQuery.refetch()"
    />
    <EmptyState v-else-if="!contract" class="py-12" title="Contract agreement not found" />

    <div v-else class="space-y-6">
      <!-- Status Notice Banner -->
      <div
        v-if="isSigned"
        class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between text-sm text-emerald-800 dark:text-emerald-300"
      >
        <div class="flex items-center gap-3">
          <ShieldCheck class="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <p class="font-bold text-emerald-900 dark:text-emerald-200">Contract Signed &amp; Executed</p>
            <p class="text-xs text-emerald-700 dark:text-emerald-400">
              This agreement was electronically signed on {{ new Date(contract.signed_at!).toLocaleString() }}.
            </p>
          </div>
        </div>
      </div>
      <div
        v-else
        class="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 flex items-center justify-between text-sm text-indigo-900 dark:text-indigo-200"
      >
        <div class="flex items-center gap-3">
          <FileText class="h-6 w-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <p class="font-bold">Pending Client Signature</p>
            <p class="text-xs text-indigo-700 dark:text-indigo-300">
              Please review the terms below and click "Accept &amp; Sign Contract" to execute.
            </p>
          </div>
        </div>
        <BaseButton
          size="sm"
          class="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
          @click="openSignModal"
        >
          Sign Now
        </BaseButton>
      </div>

      <!-- Contract Document Canvas Preview -->
      <ContractDocumentCanvas :contract="contract" />
    </div>

    <!-- Electronic Signature Modal -->
    <BaseModal
      :open="signModalOpen"
      title="Electronic Contract Sign-off"
      @close="signModalOpen = false"
    >
      <div class="space-y-4 text-sm text-ink-soft">
        <div class="rounded-lg bg-surface/50 border border-border/60 p-3 space-y-1 text-xs">
          <p class="font-semibold text-ink">Contract: {{ contract?.title }}</p>
          <p class="text-muted">Total Value: {{ contract?.currency }} {{ contract?.amount }}</p>
        </div>

        <BaseInput
          v-model="signerName"
          label="Full Legal Name"
          placeholder="e.g. Jane Doe"
          required
        />

        <BaseInput
          v-model="signerEmail"
          type="email"
          label="Email Address"
          placeholder="e.g. jane@clientcompany.com"
          required
        />

        <label class="flex items-start gap-3 rounded-lg border border-border p-3 bg-canvas cursor-pointer">
          <input
            v-model="agreeTerms"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent"
          />
          <span class="text-xs text-ink leading-relaxed">
            I confirm that I am authorized to sign this agreement on behalf of the client, and I agree that my electronic signature is binding to the contract terms outlined above.
          </span>
        </label>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <BaseButton variant="ghost" @click="signModalOpen = false">
            Cancel
          </BaseButton>
          <BaseButton
            variant="primary"
            class="bg-emerald-600 hover:bg-emerald-700 text-white"
            :loading="signMutation.isPending.value"
            :disabled="!agreeTerms"
            @click="handleSignContract"
          >
            <CheckCircle2 class="h-4 w-4 mr-1.5" />
            Sign &amp; Execute Contract
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
