<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
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
import { usePortalProjectQuery, useSignPortalContractMutation } from '../../../queries'

const route = useRoute()
const toast = useToast()

const token = computed(() => String(route.params.token || ''))
const projectId = computed(() => String(route.params.projectId || ''))

const { data: project, isPending, isError, refetch } = usePortalProjectQuery(token, projectId)
const signMutation = useSignPortalContractMutation()
const { exportPdf, isExporting } = useContractExport()

const contract = computed(() => (project.value as any)?.contract || null)
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
  if (!contract.value?.id) return
  if (!agreeTerms.value) {
    toast.errorFromUnknown('Please confirm that you agree to electronically sign this contract.')
    return
  }

  try {
    await signMutation.mutateAsync({
      token: token.value,
      contractId: String(contract.value.id),
      payload: {
        signer_name: signerName.value.trim() || undefined,
        signer_email: signerEmail.value.trim() || undefined,
      },
    })
    toast.success('Contract signed and executed successfully!')
    signModalOpen.value = false
    await refetch()
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
  <div class="space-y-6 max-w-4xl mx-auto pb-16">
    <LoadingState v-if="isPending" class="py-12" />
    <ErrorState
      v-else-if="isError"
      class="py-12"
      title="Failed to load project contract"
      retry-label="Retry"
      @retry="refetch()"
    />
    <EmptyState
      v-else-if="!contract"
      class="py-12"
      title="No contract agreement attached"
      description="Your freelancer has not published a contract for this project workspace yet."
    />

    <div v-else class="space-y-6">
      <!-- Top Action Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 class="font-display text-2xl font-bold text-ink">Project Service Contract</h2>
          <p class="text-xs text-muted">Legal binding agreement for {{ project?.title }}</p>
        </div>

        <div class="flex items-center gap-2">
          <BaseButton
            variant="secondary"
            size="sm"
            :loading="isExporting"
            @click="handleExportPdf"
          >
            <Download class="h-4 w-4 mr-1.5" />
            Export PDF
          </BaseButton>

          <BaseButton
            v-if="!isSigned"
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
              Please review the agreement terms and click "Accept &amp; Sign Contract" to execute.
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

      <!-- Document Preview Canvas -->
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
