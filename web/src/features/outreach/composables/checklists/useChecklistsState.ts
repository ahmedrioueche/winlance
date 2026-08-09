import { computed, ref, watch } from 'vue'
import { useToast } from '@/shared/toast/useToast'
import {
  useAddChecklistItemMutation,
  useChecklistsQuery,
  useCreateChecklistMutation,
  useDeleteChecklistItemMutation,
  useUpdateChecklistItemMutation,
} from '../../queries'
import type { ChecklistItem } from '../../types'

export function useChecklistsState() {
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

  return {
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
    createPending: computed(() => create.isPending.value),
    addItemPending: computed(() => addItem.isPending.value),
    updateItemPending: computed(() => updateItem.isPending.value),
    deleteItemPending: computed(() => deleteItem.isPending.value),
    onCreate,
    onAddItem,
    openEdit,
    saveEdit,
    confirmDeleteItem,
  }
}
