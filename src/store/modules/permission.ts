import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/api/types/auth'

export const usePermissionStore = defineStore('permission', () => {
  const menus = ref<MenuItem[]>([])
  const dynamicRoutes = ref<RouteRecordRaw[]>([])
  const addedRouteNames = ref<string[]>([])
  const routesGenerated = ref<boolean>(false)

  function setMenus(list: MenuItem[]) {
    menus.value = list
  }

  function setDynamicRoutes(routes: RouteRecordRaw[], addedNames: string[]) {
    dynamicRoutes.value = routes
    addedRouteNames.value = addedNames
    routesGenerated.value = true
  }

  function resetRoutes() {
    menus.value = []
    dynamicRoutes.value = []
    addedRouteNames.value = []
    routesGenerated.value = false
  }

  return {
    menus,
    dynamicRoutes,
    addedRouteNames,
    routesGenerated,
    setMenus,
    setDynamicRoutes,
    resetRoutes
  }
})
