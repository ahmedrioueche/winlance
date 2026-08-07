import { defineStore } from 'pinia'
import { computed, ref, type Component } from 'vue'

export interface ActiveModal {
  id: string
  name: string
  component?: Component
  props?: Record<string, unknown>
}

let modalIdCounter = 0

export const useModalStore = defineStore('modal', () => {
  const stack = ref<ActiveModal[]>([])

  const topModal = computed(() => stack.value[stack.value.length - 1] ?? null)
  const hasOpenModals = computed(() => stack.value.length > 0)

  function openModal(
    name: string,
    props?: Record<string, unknown>,
    component?: Component,
  ): string {
    modalIdCounter += 1
    const id = `modal-${modalIdCounter}`
    stack.value.push({
      id,
      name,
      component,
      props,
    })
    return id
  }

  function closeModal(id?: string) {
    if (!id) {
      stack.value.pop()
      return
    }
    const idx = stack.value.findIndex((m) => m.id === id)
    if (idx !== -1) {
      stack.value.splice(idx, 1)
    }
  }

  function closeAllModals() {
    stack.value = []
  }

  function updateModalProps(id: string, newProps: Record<string, unknown>) {
    const target = stack.value.find((m) => m.id === id)
    if (target) {
      target.props = { ...target.props, ...newProps }
    }
  }

  return {
    stack,
    topModal,
    hasOpenModals,
    openModal,
    closeModal,
    closeAllModals,
    updateModalProps,
  }
})
