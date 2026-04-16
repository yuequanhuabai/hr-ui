import { request } from '@/api/request'
import type { SysRole } from '@/api/types/system'

export function roleAll() {
  return request<SysRole[]>({
    url: '/system/role/all',
    method: 'get'
  })
}
