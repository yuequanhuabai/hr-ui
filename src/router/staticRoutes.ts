import type { RouteRecordRaw } from 'vue-router'

export const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登入', hidden: true }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '頁面不存在', hidden: true }
  },
  {
    path: '/401',
    name: 'Unauthorized',
    component: () => import('@/views/error/401.vue'),
    meta: { title: '未授權', hidden: true }
  },
  {
    path: '/redirect/:path(.*)',
    name: 'Redirect',
    component: () => import('@/views/redirect/index.vue'),
    meta: { hidden: true }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首頁', affix: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '個人中心', hidden: true }
      },
      {
        path: 'workflow/apply',
        name: 'WorkflowApply',
        component: () => import('@/views/workflow/apply/index.vue'),
        meta: { title: '請假申請', icon: 'Edit' }
      },
      {
        path: 'workflow/task',
        name: 'WorkflowTask',
        component: () => import('@/views/workflow/task/index.vue'),
        meta: { title: '我的待辦', icon: 'Bell' }
      }
    ]
  }
]
