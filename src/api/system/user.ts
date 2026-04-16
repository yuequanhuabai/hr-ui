import { request } from '@/api/request'
import type {
  PageResult,
  SysRole,
  SysUser,
  SysUserQuery
} from '@/api/types/system'

export function listUser(params: SysUserQuery) {
  return request<PageResult<SysUser>>({
    url: '/system/user/list',
    method: 'get',
    params
  })
}

export function getUser(userId: number) {
  return request<{ user: SysUser; roles: SysRole[] }>({
    url: `/system/user/${userId}`,
    method: 'get'
  })
}

export function addUser(data: SysUser) {
  return request<void>({
    url: '/system/user',
    method: 'post',
    data
  })
}

export function updateUser(data: SysUser) {
  return request<void>({
    url: '/system/user',
    method: 'put',
    data
  })
}

export function deleteUser(userIds: number | number[]) {
  const ids = Array.isArray(userIds) ? userIds.join(',') : userIds
  return request<void>({
    url: `/system/user/${ids}`,
    method: 'delete'
  })
}

export function resetPassword(userId: number, password: string) {
  return request<void>({
    url: '/system/user/resetPwd',
    method: 'put',
    data: { userId, password }
  })
}

export function changeUserStatus(userId: number, status: number) {
  return request<void>({
    url: '/system/user/changeStatus',
    method: 'put',
    data: { userId, status }
  })
}
