<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const collapsed = computed(() => appStore.sidebarCollapsed)
const activeMenu = computed(() => route.path)

const topMenus = computed(() =>
  (permissionStore.menus || []).filter((m) => m.visible === 0 && m.menuType !== 'F')
)
</script>

<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="collapsed"
    :collapse-transition="false"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409eff"
    router
    unique-opened
    class="sidebar-menu"
  >
    <SidebarItem
      v-for="menu in topMenus"
      :key="menu.menuId"
      :item="menu"
      base-path="/"
    />
  </el-menu>
</template>

<style scoped>
.sidebar-menu {
  border-right: none;
  width: 100%;
}
.sidebar-menu:not(.el-menu--collapse) {
  width: 210px;
}
</style>
