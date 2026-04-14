import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export interface TagView {
  name: string
  path: string
  fullPath: string
  title: string
  meta?: Record<string, unknown>
}

export const useTagsViewStore = defineStore('tagsView', () => {
  const visitedViews = ref<TagView[]>([])
  const cachedViews = ref<string[]>([])

  function addView(route: RouteLocationNormalized) {
    const name = (route.name as string) || ''
    if (!name) return

    if (!visitedViews.value.some((v) => v.path === route.path)) {
      visitedViews.value.push({
        name,
        path: route.path,
        fullPath: route.fullPath,
        title: (route.meta?.title as string) || name,
        meta: route.meta
      })
    }

    if (!cachedViews.value.includes(name)) {
      cachedViews.value.push(name)
    }
  }

  function delView(path: string) {
    const idx = visitedViews.value.findIndex((v) => v.path === path)
    if (idx > -1) {
      const [removed] = visitedViews.value.splice(idx, 1)
      const cacheIdx = cachedViews.value.indexOf(removed.name)
      if (cacheIdx > -1) cachedViews.value.splice(cacheIdx, 1)
    }
  }

  function delOthersViews(path: string) {
    visitedViews.value = visitedViews.value.filter((v) => v.path === path)
    cachedViews.value = visitedViews.value.map((v) => v.name)
  }

  function delAllViews() {
    visitedViews.value = []
    cachedViews.value = []
  }

  return {
    visitedViews,
    cachedViews,
    addView,
    delView,
    delOthersViews,
    delAllViews
  }
})
