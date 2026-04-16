import { request } from '@/api/request'
import type { SysDept } from '@/api/types/system'

export function deptTree(params?: Partial<SysDept>) {
  return request<SysDept[]>({
    url: '/system/dept/tree',
    method: 'get',
    params
  })
}

export function deptList(params?: Partial<SysDept>) {
  return request<SysDept[]>({
    url: '/system/dept/list',
    method: 'get',
    params
  })
}

export function getDept(deptId: number) {
  return request<SysDept>({
    url: `/system/dept/${deptId}`,
    method: 'get'
  })
}

export function addDept(data: Partial<SysDept>) {
  return request<void>({
    url: '/system/dept',
    method: 'post',
    data
  })
}

export function updateDept(data: Partial<SysDept>) {
  return request<void>({
    url: '/system/dept',
    method: 'put',
    data
  })
}

export function deleteDept(deptId: number) {
  return request<void>({
    url: `/system/dept/${deptId}`,
    method: 'delete'
  })
}
