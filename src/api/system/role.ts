import { request } from '@/api/request'
import type {
  PageResult,
  SysRole,
  SysRoleQuery
} from '@/api/types/system'

export function listRole(params: SysRoleQuery) {
  return request<PageResult<SysRole>>({
    url: '/system/role/list',
    method: 'get',
    params
  })
}

export function roleAll() {
  return request<SysRole[]>({
    url: '/system/role/all',
    method: 'get'
  })
}

export function getRole(roleId: number) {
  return request<SysRole>({
    url: `/system/role/${roleId}`,
    method: 'get'
  })
}

export function addRole(data: SysRole) {
  return request<void>({
    url: '/system/role',
    method: 'post',
    data
  })
}

export function updateRole(data: SysRole) {
  return request<void>({
    url: '/system/role',
    method: 'put',
    data
  })
}

export function updateRoleDataScope(data: SysRole) {
  return request<void>({
    url: '/system/role/dataScope',
    method: 'put',
    data
  })
}

export function changeRoleStatus(roleId: number, status: number) {
  return request<void>({
    url: '/system/role/changeStatus',
    method: 'put',
    data: { roleId, status }
  })
}

export function deleteRole(roleIds: number | number[]) {
  const ids = Array.isArray(roleIds) ? roleIds.join(',') : roleIds
  return request<void>({
    url: `/system/role/${ids}`,
    method: 'delete'
  })
}
