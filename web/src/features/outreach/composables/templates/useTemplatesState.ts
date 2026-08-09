import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/shared/toast/useToast'
import { consumeOutreachInsert, stashOutreachInsert } from '../../insert'
import {
  useCreateTemplateMutation,
  useRenderTemplateMutation,
  useTemplatesQuery,
} from '../../queries'
import { TEMPLATE_TYPES, type OutreachTemplate } from '../../types'

export function useTemplatesState() {
  const { t } = useI18n()
  const toast = useToast()
  const route = useRoute()
  const router = useRouter()
  const query = useTemplatesQuery()
  const create = useCreateTemplateMutation()
  const render = useRenderTemplateMutation()

  const templates = computed(() => query.data.value ?? [])
  const title = ref('')
  const content = ref('')
  const type = ref('EMAIL')
  const tagNames = ref('')
  const createOpen = ref(false)

  const renderTarget = ref<OutreachTemplate | null>(null)
  const clientName = ref('')
  const company = ref('')
  const roleTitle = ref('')
  const rendered = ref('')

  const typeOptions = TEMPLATE_TYPES.map((value) => ({
    value,
    label: t(`outreach.templates.types.${value}`),
  }))

  watch(
    () => route.query.fromCoach,
    (value) => {
      if (value !== '1') return
      const payload = consumeOutreachInsert()
      if (!payload?.body) return
      title.value = payload.title
      content.value = payload.body
      createOpen.value = true
      void router.replace({ query: { ...route.query, fromCoach: undefined } })
    },
    { immediate: true },
  )

  async function onCreate() {
    try {
      await create.mutateAsync({
        title: title.value.trim(),
        content: content.value,
        type: type.value,
        tag_names: tagNames.value
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean),
      })
      createOpen.value = false
      title.value = ''
      content.value = ''
      tagNames.value = ''
      toast.success('outreach.templates.created')
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  function openRender(template: OutreachTemplate) {
    renderTarget.value = template
    rendered.value = ''
    clientName.value = ''
    company.value = ''
    roleTitle.value = ''
  }

  async function onRender() {
    if (!renderTarget.value) return
    try {
      const result = await render.mutateAsync({
        id: renderTarget.value.id,
        context: {
          client_name: clientName.value,
          company: company.value,
          title: roleTitle.value,
        },
      })
      rendered.value = result.rendered
    } catch (error) {
      toast.errorFromUnknown(error)
    }
  }

  async function insertIntoProposal(mode: 'raw' | 'rendered') {
    if (!renderTarget.value) return
    const body =
      mode === 'rendered' && rendered.value ? rendered.value : renderTarget.value.content
    if (!body.trim()) {
      toast.errorKey('outreach.templates.insertEmpty')
      return
    }
    stashOutreachInsert({
      title: renderTarget.value.title,
      body,
      source: mode === 'rendered' ? 'rendered' : 'template',
      templateId: renderTarget.value.id,
    })
    renderTarget.value = null
    toast.success('outreach.templates.insertReady')
    await router.push({ name: 'proposals', query: { fromOutreach: '1' } })
  }

  return {
    query,
    templates,
    title,
    content,
    type,
    tagNames,
    createOpen,
    renderTarget,
    clientName,
    company,
    roleTitle,
    rendered,
    typeOptions,
    createPending: computed(() => create.isPending.value),
    renderPending: computed(() => render.isPending.value),
    onCreate,
    openRender,
    onRender,
    insertIntoProposal,
  }
}
