/**
 * Page pagination controls.
 * @emits update:page
 */
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/shared/components/base/BaseButton.vue'

interface Props {
  page: number
  pageSize: number
  total: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const { t } = useI18n()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const canPrev = computed(() => props.page > 1)
const canNext = computed(() => props.page < totalPages.value)

function go(page: number) {
  if (props.disabled) return
  const next = Math.min(Math.max(1, page), totalPages.value)
  if (next !== props.page) emit('update:page', next)
}
</script>

<template>
  <nav
    class="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-soft"
    :aria-label="t('common.pagination.label')"
  >
    <p>
      {{
        t('common.pagination.summary', {
          page,
          totalPages,
          total,
        })
      }}
    </p>
    <div class="flex items-center gap-2">
      <BaseButton
        variant="secondary"
        size="sm"
        :disabled="disabled || !canPrev"
        @click="go(page - 1)"
      >
        {{ t('common.pagination.previous') }}
      </BaseButton>
      <BaseButton
        variant="secondary"
        size="sm"
        :disabled="disabled || !canNext"
        @click="go(page + 1)"
      >
        {{ t('common.pagination.next') }}
      </BaseButton>
    </div>
  </nav>
</template>
