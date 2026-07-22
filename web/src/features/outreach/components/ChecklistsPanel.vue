<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  BaseButton,
  BaseCheckbox,
  BaseInput,
  BaseModal,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { useToast } from '@/shared/toast/useToast'

import {
  useAddChecklistItemMutation,
  useChecklistsQuery,
  useCreateChecklistMutation,
  useDeleteChecklistItemMutation,
  useUpdateChecklistItemMutation,
} from '../queries'
import type { ChecklistItem } from '../types'

const { t } = useI18n()
const toast = useToast()
const query = useChecklistsQuery()
const create = useCreateChecklistMutation()
const addItem = useAddChecklistItemMutation()
const updateItem = useUpdateChecklistItemMutation()
const deleteItem = useDeleteChecklistItemMutation()

const checklists = computed(() => query.data.value ?? [])
const selectedId = ref<number | null>(null)
const title = ref('')
const description = ref('')
const itemContent = ref('')
const editing = ref<ChecklistItem | null>(null)
const editContent = ref('')
const editOrder = ref('0')
const editDoneDefault = ref(false)
const deleteItemId = ref<number | null>(null)

watch(
  checklists,
  (items) => {
    if (selectedId.value == null && items[0]) selectedId.value = items[0].id
  },
  { immediate: true },
)

const selected = computed(
  () => checklists.value.find((item) => item.id === selectedId.value) ?? null,
)

async function onCreate() {
  if (!title.value.trim()) return
  try {
    const checklist = await create.mutateAsync({
      title: title.value.trim(),
      description: description.value,
    })
    title.value = ''
    description.value = ''
    selectedId.value = checklist.id
    toast.success('outreach.checklists.created')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function onAddItem() {
  if (!selected.value || !itemContent.value.trim()) return
  try {
    await addItem.mutateAsync({
      checklistId: selected.value.id,
      content: itemContent.value.trim(),
      order: selected.value.items.length,
    })
    itemContent.value = ''
    toast.success('outreach.checklists.itemAdded')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

function openEdit(item: ChecklistItem) {
  editing.value = item
  editContent.value = item.content
  editOrder.value = String(item.order)
  editDoneDefault.value = item.is_done_default
}

async function saveEdit() {
  if (!editing.value) return
  try {
    await updateItem.mutateAsync({
      id: editing.value.id,
      content: editContent.value.trim(),
      order: Number(editOrder.value) || 0,
      is_done_default: editDoneDefault.value,
    })
    editing.value = null
    toast.success('outreach.checklists.itemUpdated')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}

async function confirmDeleteItem() {
  if (deleteItemId.value == null) return
  try {
    await deleteItem.mutateAsync(deleteItemId.value)
    deleteItemId.value = null
    toast.success('outreach.checklists.itemDeleted')
  } catch (error) {
    toast.errorFromUnknown(error)
  }
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <h2 class="font-display text-xl text-ink">{{ t('outreach.checklists.title') }}</h2>
      <p class="mt-1 text-sm text-muted">{{ t('outreach.checklists.subtitle') }}</p>
    </div>

    <LoadingState v-if="query.isPending.value" />
    <ErrorState
      v-else-if="query.isError.value"
      :title="t('common.errors.generic')"
      :retry-label="t('common.actions.retry')"
      @retry="query.refetch()"
    />
    <template v-else>
      <div class="grid gap-3 sm:grid-cols-2">
        <BaseInput v-model="title" :label="t('outreach.checklists.name')" />
        <BaseInput v-model="description" :label="t('outreach.checklists.description')" />
      </div>
      <BaseButton :loading="create.isPending.value" @click="onCreate">
        {{ t('outreach.checklists.create') }}
      </BaseButton>

      <EmptyState v-if="!checklists.length" :title="t('outreach.checklists.empty')" />
      <div v-else class="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <ul class="space-y-2">
          <li v-for="list in checklists" :key="list.id">
            <button
              type="button"
              class="w-full rounded-lg border px-3 py-2 text-left text-sm transition"
              :class="
                list.id === selectedId
                  ? 'border-accent bg-accent-soft text-ink'
                  : 'border-border bg-canvas-elevated text-ink-soft hover:border-border-strong'
              "
              @click="selectedId = list.id"
            >
              {{ list.title }}
              <span class="mt-0.5 block text-xs text-muted">
                {{ t('outreach.checklists.itemCount', { count: list.items.length }) }}
              </span>
            </button>
          </li>
        </ul>

        <div v-if="selected" class="space-y-4">
          <div>
            <h3 class="font-display text-lg text-ink">{{ selected.title }}</h3>
            <p class="mt-1 text-sm text-ink-soft">{{ selected.description }}</p>
          </div>

          <EmptyState
            v-if="!selected.items.length"
            :title="t('outreach.checklists.emptyItems')"
          />
          <ul v-else class="space-y-2">
            <li
              v-for="item in selected.items"
              :key="item.id"
              class="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-canvas-elevated px-3 py-2"
            >
              <div>
                <p class="text-sm text-ink">{{ item.content }}</p>
                <p class="mt-1 text-xs text-muted">
                  {{ t('outreach.checklists.order', { order: item.order }) }}
                  <span v-if="item.is_done_default">
                    · {{ t('outreach.checklists.doneDefault') }}
                  </span>
                </p>
              </div>
              <div class="flex gap-2">
                <BaseButton size="sm" variant="secondary" @click="openEdit(item)">
                  {{ t('outreach.checklists.edit') }}
                </BaseButton>
                <BaseButton size="sm" variant="ghost" @click="deleteItemId = item.id">
                  {{ t('common.actions.delete') }}
                </BaseButton>
              </div>
            </li>
          </ul>

          <div class="flex flex-wrap items-end gap-3">
            <BaseInput
              v-model="itemContent"
              class="min-w-[16rem] flex-1"
              :label="t('outreach.checklists.itemContent')"
            />
            <BaseButton :loading="addItem.isPending.value" @click="onAddItem">
              {{ t('outreach.checklists.addItem') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </template>

    <BaseModal
      :open="editing != null"
      :title="t('outreach.checklists.editItem')"
      @close="editing = null"
    >
      <div class="space-y-3">
        <BaseInput v-model="editContent" :label="t('outreach.checklists.itemContent')" />
        <BaseInput v-model="editOrder" type="number" :label="t('outreach.checklists.orderLabel')" />
        <BaseCheckbox v-model="editDoneDefault" :label="t('outreach.checklists.doneDefaultLabel')" />
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="editing = null">
          {{ t('common.actions.cancel') }}
        </BaseButton>
        <BaseButton :loading="updateItem.isPending.value" @click="saveEdit">
          {{ t('common.actions.save') }}
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      :open="deleteItemId != null"
      :title="t('outreach.checklists.deleteItemTitle')"
      @close="deleteItemId = null"
    >
      <p>{{ t('outreach.checklists.deleteItemMessage') }}</p>
      <template #footer>
        <BaseButton variant="secondary" @click="deleteItemId = null">
          {{ t('common.actions.cancel') }}
        </BaseButton>
        <BaseButton :loading="deleteItem.isPending.value" @click="confirmDeleteItem">
          {{ t('common.actions.delete') }}
        </BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
