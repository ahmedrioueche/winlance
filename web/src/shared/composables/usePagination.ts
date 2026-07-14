import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type PaginationOptions = {
  defaultPage?: number
  defaultPageSize?: number
  /** Sync `page` / `pageSize` to the URL query string. */
  syncToQuery?: boolean
}

export function usePagination(options: PaginationOptions = {}) {
  const {
    defaultPage = 1,
    defaultPageSize = 25,
    syncToQuery = true,
  } = options

  const route = useRoute()
  const router = useRouter()

  const page = ref(readInt(route.query.page, defaultPage))
  const pageSize = ref(readInt(route.query.pageSize, defaultPageSize))

  const offset = computed(() => (page.value - 1) * pageSize.value)

  watch([page, pageSize], ([nextPage, nextSize]) => {
    if (!syncToQuery) return
    void router.replace({
      query: {
        ...route.query,
        page: nextPage > 1 ? String(nextPage) : undefined,
        pageSize: nextSize !== defaultPageSize ? String(nextSize) : undefined,
      },
    })
  })

  function setPage(next: number) {
    page.value = Math.max(1, next)
  }

  function setPageSize(next: number) {
    pageSize.value = Math.max(1, next)
    page.value = 1
  }

  function reset() {
    page.value = defaultPage
    pageSize.value = defaultPageSize
  }

  return {
    page,
    pageSize,
    offset,
    setPage,
    setPageSize,
    reset,
  }
}

function readInt(value: unknown, fallback: number) {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number.parseInt(String(raw ?? ''), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}
