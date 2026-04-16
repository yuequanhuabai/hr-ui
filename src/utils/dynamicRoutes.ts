import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/api/types/auth'
import ParentView from '@/layout/ParentView.vue'

const MENU_TYPE = {
  DIRECTORY: 'M',
  PAGE: 'C',
  BUTTON: 'F'
} as const

const viewModules = import.meta.glob('../views/**/*.vue')

function resolveComponent(componentPath: string | null | undefined) {
  if (!componentPath) return ParentView
  const key = `../views/${componentPath}.vue`
  const loader = viewModules[key]
  if (!loader) {
    console.warn(`[dynamicRoutes] 找不到組件：${key}，退回 ParentView`)
    return ParentView
  }
  return loader as () => Promise<unknown>
}

function stripLeadingSlash(path: string): string {
  return path.startsWith('/') ? path.slice(1) : path
}

function toPascalCaseName(path: string): string {
  return path
    .split('/')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/[-_](\w)/g, (_, c) => c.toUpperCase()))
    .join('')
}

function toRoute(menu: MenuItem): RouteRecordRaw {
  const rawPath = menu.path || ''
  const path = stripLeadingSlash(rawPath)

  const isDirectory = menu.menuType === MENU_TYPE.DIRECTORY
  const component = isDirectory ? ParentView : resolveComponent(menu.component)

  const route: RouteRecordRaw = {
    path,
    component,
    name: toPascalCaseName(rawPath) || `Menu${menu.menuId}`,
    meta: {
      title: menu.menuName,
      icon: menu.icon || undefined,
      hidden: menu.visible === 1
    }
  }

  if (menu.children?.length) {
    route.children = menu.children
      .filter((c) => c.menuType !== MENU_TYPE.BUTTON)
      .map((c) => toRoute(c))
  }

  return route
}

export function generateRoutes(menus: MenuItem[]): RouteRecordRaw[] {
  return menus
    .filter((m) => m.menuType !== MENU_TYPE.BUTTON)
    .map((m) => toRoute(m))
}

export const NOT_FOUND_ROUTE: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'NotFoundCatchAll',
  redirect: '/404',
  meta: { hidden: true }
}
