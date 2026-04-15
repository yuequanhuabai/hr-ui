<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    total: number
    page?: number
    limit?: number
    pageSizes?: number[]
    layout?: string
    background?: boolean
    autoScroll?: boolean
    hidden?: boolean
  }>(),
  {
    page: 1,
    limit: 10,
    pageSizes: () => [10, 20, 30, 50],
    layout: 'total, sizes, prev, pager, next, jumper',
    background: true,
    autoScroll: true,
    hidden: false
  }
)

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:limit', value: number): void
  (e: 'pagination', payload: { page: number; limit: number }): void
}>()

const currentPage = computed({
  get: () => props.page,
  set: (v) => emit('update:page', v)
})
const pageSize = computed({
  get: () => props.limit,
  set: (v) => emit('update:limit', v)
})

function handleSizeChange(val: number) {
  emit('update:limit', val)
  emit('pagination', { page: props.page, limit: val })
  if (props.autoScroll) scrollToTop()
}
function handleCurrentChange(val: number) {
  emit('update:page', val)
  emit('pagination', { page: val, limit: props.limit })
  if (props.autoScroll) scrollToTop()
}

function scrollToTop() {
  const main = document.querySelector('.app-main')
  if (main) main.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div v-show="!hidden && total > 0" class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      :layout="layout"
      :total="total"
      :background="background"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
  background: transparent;
}
</style>
