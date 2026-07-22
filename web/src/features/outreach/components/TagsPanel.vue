<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  BaseButton,
  BaseInput,
  BaseModal,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import {
  useCreateTagMutation,
  useDeleteTagMutation,
  useTagsQuery,
  useUpdateTagMutation,
} from '../queries'

const { t } = useI18n()
const toast = useToast()
const query = useTagsQuery()
const create = useCreateTagMutation()
const update = useUpdateTagMutation()
const remove = useDeleteTagMutation()

const name = ref('')
const editingId = ref<number | null>(null)
const editName = ref('')
const deleteId = ref<number | null>(null)

const tags = computed(() => query.data.value ?? [])
const ownedTags = computed(() => tags.value.filter((tag) => tag.user != null))
const systemTags = computed(() => tags.value.filter((tag) => tag.user == null))

async function onCreate() {
  if (!name.value.trim()) return
  try {
    await create.mutateAsync({ name: name.value.trim() })
    name.value = ''
    toast.success('outreach.tags.created')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

function startEdit(id: number, current: string) {
  editingId.value = id
  editName.value = current
}

async function saveEdit() {
  if (editingId.value == null || !editName.value.trim()) return
  try {
    await update.mutateAsync({ id: editingId.value, name: editName.value.trim() })
    editingId.value = null
    toast.success('outreach.tags.updated')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function confirmDelete() {
  if (deleteId.value == null) return
  try {
    await remove.mutateAsync(deleteId.value)
    deleteId.value = null
    toast.success('outreach.tags.deleted')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <h2 class="font-display text-xl text-ink">{{ t('outreach.tags.title') }}</h2>
      <p class="mt-1 text-sm text-muted">{{ t('outreach.tags.subtitle') }}</p>
    </div>

    <LoadingState v-if="query.isPending.value" />
    <ErrorState
      v-else-if="query.isError.value"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="query.refetch()"
    />
    <template v-else>
      <form class="flex flex-wrap items-end gap-3" @submit.prevent="onCreate">
        <BaseInput v-model="name" class="min-w-[14rem] flex-1" :label="t('outreach.tags.name')" />
        <BaseButton type="submit" :loading="create.isPending.value">
          {{ t('outreach.tags.create') }}
        </BaseButton>
      </form>

      <div class="space-y-3">
        <h3 class="text-sm font-medium text-ink">{{ t('outreach.tags.yours') }}</h3>
        <EmptyState v-if="!ownedTags.length" :title="t('outreach.tags.empty')" />
        <ul v-else class="space-y-2">
          <li
            v-for="tag in ownedTags"
            :key="tag.id"
            class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-canvas-elevated px-3 py-2"
          >
            <template v-if="editingId === tag.id">
              <BaseInput v-model="editName" class="min-w-[12rem] flex-1" :label="t('outreach.tags.name')" />
              <div class="flex gap-2">
                <BaseButton size="sm" :loading="update.isPending.value" @click="saveEdit">
                  {{ t('common.actions.save') }}
                </BaseButton>
                <BaseButton size="sm" variant="secondary" @click="editingId = null">
                  {{ t('common.actions.cancel') }}
                </BaseButton>
              </div>
            </template>
            <template v-else>
              <div>
                <p class="font-medium text-ink">{{ tag.name }}</p>
                <p class="text-xs text-muted">{{ tag.slug }}</p>
              </div>
              <div class="flex gap-2">
                <BaseButton size="sm" variant="secondary" @click="startEdit(tag.id, tag.name)">
                  {{ t('outreach.tags.rename') }}
                </BaseButton>
                <BaseButton size="sm" variant="ghost" @click="deleteId = tag.id">
                  {{ t('common.actions.delete') }}
                </BaseButton>
              </div>
            </template>
          </li>
        </ul>
      </div>

      <div v-if="systemTags.length" class="space-y-3">
        <h3 class="text-sm font-medium text-ink">{{ t('outreach.tags.system') }}</h3>
        <ul class="flex flex-wrap gap-2">
          <li
            v-for="tag in systemTags"
            :key="tag.id"
            class="rounded-md border border-border bg-canvas-muted px-3 py-1.5 text-sm text-ink-soft"
          >
            {{ tag.name }}
          </li>
        </ul>
      </div>
    </template>

    <BaseModal
      :open="deleteId != null"
      :title="t('outreach.tags.deleteTitle')"
      @close="deleteId = null"
    >
      <p>{{ t('outreach.tags.deleteMessage') }}</p>
      <template #footer>
        <BaseButton variant="secondary" @click="deleteId = null">
          {{ t('common.actions.cancel') }}
        </BaseButton>
        <BaseButton :loading="remove.isPending.value" @click="confirmDelete">
          {{ t('common.actions.delete') }}
        </BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
