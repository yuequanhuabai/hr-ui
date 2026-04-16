import { ElMessage } from 'element-plus'
import router from './index'
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
import { getToken } from '@/utils/auth'
import { getRouters } from '@/api/auth'
import { generateRoutes, NOT_FOUND_ROUTE } from '@/utils/dynamicRoutes'
import NProgress from '@/utils/nprogress'

const WHITE_LIST = ['/login', '/404', '/401']
const APP_TITLE = 'HR 管理系統'

router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  const hasToken = !!getToken()

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      return
    }

    const userStore = useUserStore()
    const permissionStore = usePermissionStore()

    if (permissionStore.routesGenerated) {
      next()
      return
    }

    try {
      await userStore.getInfo()
      const menus = await getRouters()
      permissionStore.setMenus(menus)

      const routes = generateRoutes(menus)
      const addedNames: string[] = []
      for (const r of routes) {
        router.addRoute('Layout', r)
        if (r.name) addedNames.push(r.name as string)
      }
      router.addRoute(NOT_FOUND_ROUTE)
      addedNames.push(NOT_FOUND_ROUTE.name as string)

      permissionStore.setDynamicRoutes(routes, addedNames)
      next({ ...to, replace: true })
    } catch (err) {
      userStore.resetState()
      removeDynamicRoutes()
      permissionStore.resetRoutes()
      ElMessage.error((err as Error)?.message || '用戶信息獲取失敗，請重新登入')
      next(`/login?redirect=${to.fullPath}`)
    }
    return
  }

  if (WHITE_LIST.includes(to.path)) {
    next()
    return
  }

  next(`/login?redirect=${to.fullPath}`)
})

router.afterEach((to) => {
  NProgress.done()
  const title = (to.meta?.title as string) || ''
  document.title = title ? `${title} - ${APP_TITLE}` : APP_TITLE
})

router.onError(() => {
  NProgress.done()
})

export function removeDynamicRoutes(): void {
  const permissionStore = usePermissionStore()
  for (const name of permissionStore.addedRouteNames) {
    if (router.hasRoute(name)) {
      router.removeRoute(name)
    }
  }
}
