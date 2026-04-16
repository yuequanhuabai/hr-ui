<script setup lang="ts">
import { Refresh, Search, Menu } from '@element-plus/icons-vue'

interface ColumnItem {
  label: string
  visible: boolean
}

defineProps<{
  showSearch?: boolean
  columns?: ColumnItem[]
}>()

const emit = defineEmits<{
  (e: 'update:showSearch', value: boolean): void
  (e: 'queryTable'): void
}>()

function toggleSearch(value: boolean | undefined) {
  emit('update:showSearch', !value)
}
function refresh() {
  emit('queryTable')
}
</script>

<template>
  <div class="right-toolbar">
    <el-tooltip v-if="showSearch !== undefined" content="顯示/隱藏搜索" placement="top">
      <el-button circle :icon="Search" @click="toggleSearch(showSearch)" />
    </el-tooltip>
    <el-tooltip content="刷新" placement="top">
      <el-button circle :icon="Refresh" @click="refresh" />
    </el-tooltip>
    <el-tooltip v-if="columns && columns.length" content="顯示/隱藏列" placement="top">
      <el-popover trigger="click" :width="200">
        <template #reference>
          <el-button circle :icon="Menu" />
        </template>
        <div v-for="(col, idx) in columns" :key="idx" style="margin: 4px 0">
          <el-checkbox v-model="col.visible" :label="col.label" />
        </div>
      </el-popover>
    </el-tooltip>
  </div>
</template>

<style scoped>
.right-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 0;
}
</style>
