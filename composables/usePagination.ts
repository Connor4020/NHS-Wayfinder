import { computed, ref, type ComputedRef, type Ref } from 'vue'

type NumericSource = Ref<number> | ComputedRef<number>

export default function usePagination(total: NumericSource, pageSize: number, initialPage = 1) {
  const page = ref(initialPage)

  const offset = computed(() => (page.value - 1) * pageSize)
  const totalPages = computed(() => Math.max(1, Math.ceil(Number(total.value || 0) / pageSize)))
  const hasPrev = computed(() => page.value > 1)
  const hasNext = computed(() => page.value * pageSize < Number(total.value || 0))

  const nextPage = () => {
    if (!hasNext.value) return
    page.value += 1
  }

  const prevPage = () => {
    if (!hasPrev.value) return
    page.value -= 1
  }

  const resetPage = () => {
    page.value = 1
  }

  return {
    page,
    offset,
    totalPages,
    hasPrev,
    hasNext,
    nextPage,
    prevPage,
    resetPage,
  }
}
