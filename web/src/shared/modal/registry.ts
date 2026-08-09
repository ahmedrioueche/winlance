import { defineAsyncComponent, type Component } from 'vue'
import { useModalStore } from '@/shared/stores/modal'

const modalRegistry: Record<string, Component> = {
  'create-project': defineAsyncComponent(
    () => import('@/features/projects/components/create/CreateProjectModal.vue'),
  ),
  'create-client': defineAsyncComponent(
    () => import('@/features/client-dashboard/components/clients/CreateClientModal.vue'),
  ),
}

export function registerModal(name: string, component: Component) {
  modalRegistry[name] = component
}

export function getModalComponent(name: string): Component | undefined {
  return modalRegistry[name]
}

export function openCreateProjectModal(props?: Record<string, unknown>) {
  const modalStore = useModalStore()
  return modalStore.openModal('create-project', props)
}

export function openCreateClientModal(props?: Record<string, unknown>) {
  const modalStore = useModalStore()
  return modalStore.openModal('create-client', props)
}
