import { request } from '@/api/request'
import type { SysMenu } from '@/api/types/system'

export function menuList(params?: Partial<SysMenu>) {
  return request<SysMenu[]>({
    url: '/system/menu/list',
    method: 'get',
    params
  })
}

export function menuTree(params?: Partial<SysMenu>) {
  return request<SysMenu[]>({
    url: '/system/menu/tree',
    method: 'get',
    params
  })
}

export function roleMenuIds(roleId: number) {
  return request<number[]>({
    url: `/system/menu/roleMenuIds/${roleId}`,
    method: 'get'
  })
}

export function getMenu(menuId: number) {
  return request<SysMenu>({
    url: `/system/menu/${menuId}`,
    method: 'get'
  })
}

export function addMenu(data: Partial<SysMenu>) {
  return request<void>({
    url: '/system/menu',
    method: 'post',
    data
  })
}

export function updateMenu(data: Partial<SysMenu>) {
  return request<void>({
    url: '/system/menu',
    method: 'put',
    data
  })
}

export function deleteMenu(menuId: number) {
  return request<void>({
    url: `/system/menu/${menuId}`,
    method: 'delete'
  })
}
