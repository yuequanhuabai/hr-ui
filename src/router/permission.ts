import { ElMessage } from 'element-plus'
import router from './index'
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
import { getToken } from '@/utils/auth'

const WHITE_LIST = ['/login', '/404', '/401']

router.beforeEach(async (to, _from, next) => {
  const hasToken = !!getToken()

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      return
    }

    const userStore = useUserStore()
    const permissionStore = usePermissionStore()

    if (userStore.userInfo) {
      next()
      return
    }

    try {
      await userStore.getInfo()
      const menus = await import('@/api/auth').then((m) => m.getRouters())
      permissionStore.setMenus(menus)
      permissionStore.setDynamicRoutes([])
      next({ ...to, replace: true })
    } catch (err) {
      userStore.resetState()
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

router.afterEach(() => {
  // hook point for NProgress / title update (Step 27)
})
