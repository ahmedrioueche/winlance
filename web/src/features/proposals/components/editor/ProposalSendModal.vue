<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Copy, Mail, Plus, Send, X } from 'lucide-vue-next'
import { BaseButton, BaseModal } from '@/shared/components/base'

interface Props {
  open: boolean
  defaultEmail?: string
  portalShareUrl: string
  isSendingEmail?: boolean
  isUpdatingStatus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultEmail: '',
  isSendingEmail: false,
  isUpdatingStatus: false,
})

const emit = defineEmits<{
  close: []
  sendEmail: [payload: { recipients: string[]; customMessage: string }]
  copyLinkAndMarkSent: []
  markReady: []
}>()

const { t } = useI18n()

const emailList = ref<string[]>([])
const newEmailInput = ref('')
const customMessage = ref('')
const isCopied = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      emailList.value = []
      newEmailInput.value = ''
      customMessage.value = ''
      isCopied.value = false
      if (props.defaultEmail && props.defaultEmail.trim()) {
        addEmail(props.defaultEmail.trim())
      }
    }
  },
  { immediate: true },
)

function addEmail(emailStr: string) {
  const parts = emailStr.split(/[,;\s]+/).map((e) => e.trim()).filter(Boolean)
  for (const email of parts) {
    if (email && !emailList.value.includes(email)) {
      emailList.value.push(email)
    }
  }
}

function handleAddInputEmail() {
  if (newEmailInput.value.trim()) {
    addEmail(newEmailInput.value.trim())
    newEmailInput.value = ''
  }
}

function removeEmail(index: number) {
  emailList.value.splice(index, 1)
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
    e.preventDefault()
    handleAddInputEmail()
  }
}

function handleSendEmail() {
  handleAddInputEmail()
  if (emailList.value.length === 0) return
  emit('sendEmail', {
    recipients: [...emailList.value],
    customMessage: customMessage.value.trim(),
  })
}

function handleCopyLink() {
  emit('copyLinkAndMarkSent')
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2500)
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="t('proposals.editor.sendModal.title', '🚀 Deliver & Publish Proposal')"
    @close="emit('close')"
  >
    <div class="space-y-5 text-xs">
      <!-- Section 1: Multi-Recipient Email Input -->
      <div class="space-y-2">
        <label class="block font-semibold text-ink">
          {{ t('proposals.editor.sendModal.recipientsLabel', 'Recipient Email Address(es)') }}
        </label>
        <p class="text-muted leading-relaxed">
          {{ t('proposals.editor.sendModal.recipientsNote', 'Add one or more email addresses (press Enter or comma to add).') }}
        </p>

        <!-- Chips & Input Container -->
        <div class="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-canvas p-2 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/20">
          <div
            v-for="(email, idx) in emailList"
            :key="idx"
            class="flex items-center gap-1 rounded-lg border border-accent/30 bg-accent/10 px-2 py-1 text-xs font-semibold text-accent"
          >
            <Mail class="h-3 w-3" />
            <span>{{ email }}</span>
            <button
              type="button"
              class="ms-1 text-accent/70 hover:text-accent"
              @click="removeEmail(idx)"
            >
              <X class="h-3 w-3" />
            </button>
          </div>

          <div class="flex min-w-[200px] flex-1 items-center gap-1">
            <input
              v-model="newEmailInput"
              type="email"
              class="w-full bg-transparent px-1 py-1 text-xs text-ink outline-none placeholder:text-muted/60"
              :placeholder="emailList.length === 0 ? t('proposals.editor.sendModal.emailPlaceholder', 'e.g. client{\'@\'}company.com') : t('proposals.editor.sendModal.addAnotherPlaceholder', 'Add another email...')"
              @keydown="handleKeyDown"
              @blur="handleAddInputEmail"
            />
            <button
              v-if="newEmailInput.trim()"
              type="button"
              class="text-accent hover:bg-accent/10 rounded-md p-1 transition-colors"
              @click="handleAddInputEmail"
            >
              <Plus class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Section 2: Custom Note / Message -->
      <div class="space-y-1.5">
        <label class="block font-semibold text-ink">
          {{ t('proposals.editor.sendModal.customMessageLabel', 'Personal Message / Cover Note (Optional)') }}
        </label>
        <textarea
          v-model="customMessage"
          class="min-h-[90px] w-full resize-y rounded-xl border border-border bg-canvas p-3 text-xs text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
          :placeholder="t('proposals.editor.sendModal.customMessagePlaceholder', 'e.g. Hi Sarah, excited to share our proposal for the upcoming project! Let me know if you have any questions...')"
        />
      </div>

      <!-- Section 3: Alternative Share Option Banner -->
      <div class="flex items-center justify-between rounded-xl border border-border/80 bg-canvas-muted p-3">
        <div class="space-y-0.5">
          <p class="font-semibold text-ink">
            {{ t('proposals.editor.sendModal.shareLinkTitle', 'Or share via Client Portal link') }}
          </p>
          <p class="text-muted text-[11px]">
            {{ t('proposals.editor.sendModal.shareLinkDesc', 'Copy link to share manually via WhatsApp, Slack, or chat.') }}
          </p>
        </div>

        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="isSendingEmail || isUpdatingStatus"
          @click="handleCopyLink"
        >
          <Check v-if="isCopied" class="h-3.5 w-3.5 text-emerald-500" />
          <Copy v-else class="h-3.5 w-3.5" />
          <span>{{ isCopied ? t('common.copied', 'Copied!') : t('proposals.editor.sendModal.copyLinkBtn', 'Copy Link & Mark Sent') }}</span>
        </BaseButton>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full flex-wrap items-center justify-between gap-2">
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="isSendingEmail || isUpdatingStatus"
          @click="emit('markReady')"
        >
          <span>{{ t('proposals.editor.sendModal.markReadyBtn', 'Mark as Ready (Internal)') }}</span>
        </BaseButton>

        <div class="flex items-center gap-2">
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="isSendingEmail || isUpdatingStatus"
            @click="emit('close')"
          >
            {{ t('common.actions.cancel', 'Cancel') }}
          </BaseButton>

          <BaseButton
            size="sm"
            :loading="isSendingEmail"
            :disabled="emailList.length === 0 && !newEmailInput.trim()"
            @click="handleSendEmail"
          >
            <Send class="h-3.5 w-3.5" />
            <span>{{ t('proposals.editor.sendModal.sendEmailBtn', 'Send Email & Publish') }}</span>
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
