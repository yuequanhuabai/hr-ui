import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/api/types/auth'

export const usePermissionStore = defineStore('permission', () => {
  const menus = ref<MenuItem[]>([])
  const dynamicRoutes = ref<RouteRecordRaw[]>([])
  const routesGenerated = ref<boolean>(false)

  function setMenus(list: MenuItem[]) {
    menus.value = list
  }

  function setDynamicRoutes(routes: RouteRecordRaw[]) {
    dynamicRoutes.value = routes
    routesGenerated.value = true
  }

  function resetRoutes() {
    menus.value = []
    dynamicRoutes.value = []
    routesGenerated.value = false
  }

  return {
    menus,
    dynamicRoutes,
    routesGenerated,
    setMenus,
    setDynamicRoutes,
    resetRoutes
  }
})
