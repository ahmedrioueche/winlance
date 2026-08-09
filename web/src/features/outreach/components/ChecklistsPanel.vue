<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  BaseButton,
  BaseInput,
  BaseModal,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/base'
import { useChecklistsState } from '../composables/checklists/useChecklistsState'
import ChecklistEditModal from './checklists/ChecklistEditModal.vue'

const { t } = useI18n()

const {
  query,
  checklists,
  selectedId,
  selected,
  title,
  description,
  itemContent,
  editing,
  editContent,
  editOrder,
  editDoneDefault,
  deleteItemId,
  createPending,
  addItemPending,
  updateItemPending,
  deleteItemPending,
  onCreate,
  onAddItem,
  openEdit,
  saveEdit,
  confirmDeleteItem,
} = useChecklistsState()
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
      <BaseButton :loading="createPending" @click="onCreate">
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
            <BaseButton :loading="addItemPending" @click="onAddItem">
              {{ t('outreach.checklists.addItem') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </template>

    <ChecklistEditModal
      v-model:edit-content="editContent"
      v-model:edit-order="editOrder"
      v-model:edit-done-default="editDoneDefault"
      :open="editing != null"
      :is-updating="updateItemPending"
      @close="editing = null"
      @save="saveEdit"
    />

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
        <BaseButton :loading="deleteItemPending" @click="confirmDeleteItem">
          {{ t('common.actions.delete') }}
        </BaseButton>
      </template>
    </BaseModal>
  </section>
</template>
