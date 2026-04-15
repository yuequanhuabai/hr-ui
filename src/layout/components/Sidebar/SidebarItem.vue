<script setup lang="ts">
import { computed } from 'vue'
import type { MenuItem } from '@/api/types/auth'

const props = defineProps<{
  item: MenuItem
  basePath: string
}>()

function resolvePath(routePath: string | null): string {
  if (!routePath) return props.basePath
  if (routePath.startsWith('/')) return routePath
  return props.basePath.replace(/\/$/, '') + '/' + routePath
}

const visibleChildren = computed(() =>
  (props.item.children || []).filter((c) => c.visible === 0 && c.menuType !== 'F')
)

const hasChildren = computed(() => visibleChildren.value.length > 0)
const fullPath = computed(() => resolvePath(props.item.path))
</script>

<template>
  <el-sub-menu v-if="hasChildren" :index="fullPath">
    <template #title>
      <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
      <span>{{ item.menuName }}</span>
    </template>
    <SidebarItem
      v-for="child in visibleChildren"
      :key="child.menuId"
      :item="child"
      :base-path="fullPath"
    />
  </el-sub-menu>

  <el-menu-item v-else :index="fullPath">
    <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
    <template #title>{{ item.menuName }}</template>
  </el-menu-item>
</template>
