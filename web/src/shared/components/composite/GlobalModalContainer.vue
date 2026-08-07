<script setup lang="ts">
import { computed } from 'vue'

import { getModalComponent } from '@/shared/modal/registry'
import { useModalStore } from '@/shared/stores/modal'

const modalStore = useModalStore()

const stackedModals = computed(() => {
  return modalStore.stack.map((item, index) => {
    const component = item.component || getModalComponent(item.name)
    const zIndex = 50 + index * 10
    return {
      ...item,
      component,
      zIndex,
    }
  })
})
</script>

<template>
  <div v-if="stackedModals.length > 0" class="global-modal-container">
    <template v-for="modal in stackedModals" :key="modal.id">
      <component
        :is="modal.component"
        v-if="modal.component"
        open
        v-bind="modal.props"
        :style="{ zIndex: modal.zIndex }"
        @close="modalStore.closeModal(modal.id)"
      />
    </template>
  </div>
</template>
