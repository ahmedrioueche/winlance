import { computed, ref, watch, type Ref } from 'vue'
import { useToast } from '@/shared/toast/useToast'
import { rescoreLead } from '../../api'
import {
  useCompleteFollowUpMutation,
  useCreateContactMutation,
  useCreateFollowUpMutation,
  useCreateNoteMutation,
  useLeadQuery,
  useTransitionLeadMutation,
} from '../../queries'
import type { LeadStatus } from '../../types'

export function useLeadDetailData(id: Ref<string>) {
  const toast = useToast()
  const leadIdNum = computed(() => Number(id.value))
  const { data: lead, isPending, isError, refetch } = useLeadQuery(id)

  const transitionLeadMutation = useTransitionLeadMutation()
  const createContactMutation = useCreateContactMutation()
  const createNoteMutation = useCreateNoteMutation()
  const createFollowUpMutation = useCreateFollowUpMutation()
  const completeFollowUpMutation = useCompleteFollowUpMutation()

  const statusModel = ref<LeadStatus>('NEW')
  const contactFirst = ref('')
  const contactLast = ref('')
  const contactEmail = ref('')
  const noteContent = ref('')
  const followUpAt = ref('')
  const followUpNotes = ref('')

  watch(
    lead,
    (val) => {
      if (val) statusModel.value = val.status
    },
    { immediate: true },
  )

  async function onStatusChange() {
    if (!lead.value || statusModel.value === lead.value.status) return
    try {
      await transitionLeadMutation.mutateAsync({ id: id.value, status: statusModel.value })
      toast.success('leads.messages.transitioned')
    } catch (error) {
      statusModel.value = lead.value.status
      toast.errorFromUnknown(error)
    }
  }

  async function onRescore() {
    try {
      await rescoreLead(id.value)
      await refetch()
      toast.success('leads.messages.rescored')
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  async function addContact() {
    try {
      await createContactMutation.mutateAsync({
        lead: leadIdNum.value,
        first_name: contactFirst.value,
        last_name: contactLast.value,
        email: contactEmail.value,
      })
      contactFirst.value = ''
      contactLast.value = ''
      contactEmail.value = ''
      toast.success('leads.messages.contactAdded')
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  async function addNote() {
    try {
      await createNoteMutation.mutateAsync({ lead: leadIdNum.value, content: noteContent.value })
      noteContent.value = ''
      toast.success('leads.messages.noteAdded')
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  async function addFollowUp() {
    try {
      await createFollowUpMutation.mutateAsync({
        lead: leadIdNum.value,
        scheduled_at: new Date(followUpAt.value).toISOString(),
        notes: followUpNotes.value,
      })
      followUpAt.value = ''
      followUpNotes.value = ''
      toast.success('leads.messages.followUpAdded')
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  async function markComplete(followUpId: number) {
    try {
      await completeFollowUpMutation.mutateAsync({ id: followUpId })
      toast.success('leads.messages.followUpCompleted')
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  return {
    lead,
    isPending,
    isError,
    refetch,
    statusModel,
    contactFirst,
    contactLast,
    contactEmail,
    noteContent,
    followUpAt,
    followUpNotes,
    createContactPending: createContactMutation.isPending,
    createNotePending: createNoteMutation.isPending,
    createFollowUpPending: createFollowUpMutation.isPending,
    completeFollowUpPending: completeFollowUpMutation.isPending,
    onStatusChange,
    onRescore,
    addContact,
    addNote,
    addFollowUp,
    markComplete,
  }
}
